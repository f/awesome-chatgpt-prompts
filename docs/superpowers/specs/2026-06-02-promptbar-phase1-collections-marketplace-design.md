# PromptBar Phase 1 — Collections & Marketplace Design Spec

**Date:** 2026-06-02
**Author:** le-dawg + Claude Code
**Status:** Approved for implementation planning
**Scope:** Phase 1 only — Collections, Marketplace Distribution, `set_me_up`, Agent Compat

---

## 1. Context & Scope

PromptBar becomes a Git-native team distribution platform for Skills and Plugin Marketplaces. This spec covers Phase 1 exclusively.

**Phase 1 delivers:**
- User-owned Collections (named, versioned lists of skills + MCPs)
- Platform-served `marketplace.json` compatible with Claude Code, Copilot CLI, Codex, Antigravity
- `set_me_up` MCP tool — org-verified onboarding + marketplace registration
- Agent compatibility registry (`AgentConfig`) — server-side, admin-updatable via MCP
- Onboarding UX block in `/settings`
- Skills system unchanged

**Out of scope (Phase 2+):**
- `.skill` upload hardening + manifest standardization
- Skill sync pull (Phase 2)
- Skill push + conflict resolution (Phase 3)
- Code signing, attestations, strict policy gates (Phase 4)
- OAuth write scope expansion for GitHub push (Phase 3 prerequisite)

---

## 2. Data Model

### 2.1 New Prisma Models

```prisma
model Collection {
  id          String               @id @default(cuid())
  slug        String
  name        String
  description String?
  visibility  CollectionVisibility @default(USER_PRIVATE)
  ownerId     String
  owner       User                 @relation(fields: [ownerId], references: [id])
  items       CollectionItem[]
  members     CollectionMember[]
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt

  @@unique([ownerId, slug])
  @@map("collections")
}

model CollectionItem {
  id           String         @id @default(cuid())
  order        Int
  name         String
  description  String?
  sourceType   ItemSourceType @default(GITHUB)
  sourceUrl    String?        // GitHub/GitLab URL — required when sourceType = GITHUB
  sourcePath   String?        // subdirectory within repo
  sourceRef    String         @default("main")
  promptId     String?        // required when sourceType = INTERNAL
  prompt       Prompt?        @relation(fields: [promptId], references: [id])
  contentHash  String?        // SHA-256 of served content — INTERNAL items only
  type         ItemType
  lastSyncedAt DateTime?
  syncStatus   SyncStatus?
  upstreamRef  String?        // last known upstream commit SHA
  collectionId String
  collection   Collection     @relation(fields: [collectionId], references: [id])
  createdAt    DateTime       @default(now())

  @@unique([collectionId, order])
  @@map("collection_items")
}

model CollectionMember {
  collectionId String
  userId       String
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt    DateTime   @default(now())

  @@id([collectionId, userId])
  @@map("collection_members")
}

model AgentConfig {
  id                String    @id @default(cuid())
  agentId           String    @unique  // "claude-code", "copilot-cli", "codex", "antigravity", etc.
  displayName       String
  tier              AgentTier
  pluginRegisterCmd String?   // template string; {host}, {username}, {slug} substituted at runtime
  pluginInstallCmd  String?
  mcpConfigTemplate Json?     // per-agent config injection format
  skillsPathGlobal  String?
  skillsPathProject String?
  npxSkillsFlag     String?   // e.g. "--agent claude"
  cliCheckCmd       String?   // e.g. "claude --version"
  docsUrl           String?   // source for auto-fetch update
  isActive          Boolean   @default(true)
  lastUpdatedAt     DateTime  @default(now())
  updatedById       String?

  @@map("agent_configs")
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  action    String
  target    String?
  meta      Json?
  createdAt DateTime @default(now())

  @@index([userId, createdAt])
  @@map("audit_logs")
}
```

### 2.2 New Enums

```prisma
enum CollectionVisibility {
  PUBLIC        // anyone reads; le-dawg can unpublish others'
  ADMIN_PRIVATE // org admins + invited CollectionMembers read; hidden from public
  USER_PRIVATE  // owner only — no exceptions, returns 404 to all others including admins
}

enum ItemSourceType {
  GITHUB    // sourceUrl points to GitHub/GitLab repo; Claude Code fetches natively
  INTERNAL  // skill stored as Prompt record in platform DB; served via download endpoint
  LOCAL     // lives on user's machine only; excluded from marketplace.json and install commands
}

enum ItemType {
  SKILL
  MCP
}

enum SyncStatus {
  IN_SYNC
  AHEAD
  BEHIND
  DIVERGED
  CONFLICT
  ERROR
}

enum AgentTier {
  MARKETPLACE_NATIVE  // supports marketplace.json + /plugin commands natively
  NPX_SKILLS          // npx skills for SKILL items + manual MCP config injection
  MANUAL              // config file only
}
```

### 2.3 URL namespace

Collections are namespaced by owner username:

```
/api/collections/[username]/[slug]/marketplace.json
```

`@@unique([ownerId, slug])` — same slug allowed across different users. Global uniqueness not required.

---

## 3. API Routes

All new routes under `src/app/api/collections/`.

```
src/app/api/collections/
├── route.ts                                    GET (list public) | POST (create)
├── [username]/
│   ├── route.ts                                GET (list user's visible collections)
│   └── [slug]/
│       ├── route.ts                            GET | PATCH | DELETE
│       ├── marketplace.json/
│       │   └── route.ts                        GET — serves marketplace.json
│       └── items/
│           ├── route.ts                        GET | POST (add item)
│           ├── reorder/
│           │   └── route.ts                    POST { itemIds: string[] }
│           └── [itemId]/
│               ├── route.ts                    PATCH | DELETE
│               └── download/
│                   └── route.ts                GET — serves INTERNAL plugin files
```

### 3.1 Route contracts

**`GET /api/collections/[username]/[slug]/marketplace.json`**
- PUBLIC: unauthenticated access allowed
- ADMIN_PRIVATE: requires `PROMPTS_API_KEY` header (existing MCP auth)
- USER_PRIVATE: owner API key only; returns 404 to all others (existence not revealed)
- Response: Claude Code-compatible `marketplace.json`
  - GITHUB items: `source.url = sourceUrl`, `source.ref = sourceRef`
  - INTERNAL items: `source.url = /api/collections/[u]/[s]/items/[id]/download`, `sha = contentHash`
  - LOCAL items: excluded entirely

**`POST /api/collections`**
- Auth: session required
- Phase 1 publisher gate: `assertPublisher(user)` — `username === "le-dawg"`
- Body: `{ slug, name, description?, visibility }`
- Returns: `{ id, slug, marketplaceUrl }`

**`POST /api/collections/[username]/[slug]/items/reorder`**
- Auth: session, owner only
- Body: `{ itemIds: string[] }` — full desired order
- Bulk-updates `order` values in transaction

**`DELETE /api/collections/[username]/[slug]`**
- Auth: session, owner only — no exceptions

**`DELETE /api/collections/[username]/[slug]/items/[itemId]`**
- Auth: session, owner only — no exceptions

**`PATCH /api/collections/[username]/[slug]/items/[itemId]`**
- Auth: session, owner OR admin (for PUBLIC collections only)
- Admins cannot PATCH items on USER_PRIVATE or ADMIN_PRIVATE collections they don't own

### 3.2 Access matrix

| Visibility | Owner | Invited member | Other admin | le-dawg | Unauthenticated |
|---|---|---|---|---|---|
| PUBLIC | R/W/Patch/Delete | — | R/W/Patch | R/W/Patch + unpublish | R |
| ADMIN_PRIVATE | R/W/Patch/Delete | R | R | R | 404 |
| USER_PRIVATE | R/W/Patch/Delete | — | 404 | 404 | 404 |

Delete = owner only across all tiers.
Unpublish (visibility change on others' collections) = le-dawg only.
USER_PRIVATE always returns 404, never 403 — existence not revealed.

---

## 4. MCP Tools

All added to `src/pages/api/mcp.ts`. Auth via existing `authenticateApiKey` pattern.

### 4.1 Collection tools

**`get_collections`**
```
Input:  { username?: string, visibility?: "public"|"admin_private"|"user_private" }
Output: { collections: [{ slug, name, description, visibility, owner, itemCount, marketplaceUrl }] }
```

**`get_collection`**
```
Input:  { username: string, slug: string }
Output: { collection: { ...metadata, items: [{ order, name, type, sourceType, sourceUrl, sourcePath, sourceRef, syncStatus }] } }
```

**`create_collection`**
```
Input:  { slug, name, description?, visibility: "public"|"admin_private"|"user_private" }
Output: { collection: { id, slug, marketplaceUrl } }
Phase 1: rejects unless authenticated user is le-dawg
```

**`update_collection_item`**
```
Input:  { username, slug, action: "add"|"edit"|"remove", itemId?: string, item?: { order?, name, type, sourceType, sourceUrl, sourcePath?, sourceRef?, description? } }
Output: { item }
- "remove" action: owner only
- "add"/"edit": owner OR admin on PUBLIC collections
```

**`reorder_collection`**
```
Input:  { username, slug, itemIds: string[] }
Output: { items: [{ id, order, name }] }
Owner only.
```

**`install_collection`**
```
Input:  { username, slug, agent?: "claude-code"|"copilot-cli"|"codex"|"antigravity"|"kilo"|"cursor"|"windsurf"|"cline"|"opencode" }
Output: {
  commands: string[],          // GITHUB + INTERNAL items only
  skipped: { name, reason }[], // LOCAL items: "local-only — push to GitHub or upload to platform first"
  summary: string
}
```

Install command shape by agent tier:
- Tier 1 (MARKETPLACE_NATIVE): `[agent] plugin marketplace add <marketplaceUrl>` + per-item install commands
- Tier 2 (NPX_SKILLS): `npx skills add <sourceUrl> --agent <npxSkillsFlag>` for SKILL items; config injection snippet for MCP items
- MCP items: always config injection regardless of tier

### 4.2 Onboarding tools

**`set_me_up`**
```
Input:  { targetAgent?: string }
Output: {
  checks: DiagnosticResult[],
  allPassed: boolean,
  installCommands: string[],
  nextSteps: string[],
  collectionUrl: string | null
}
```

Execution phases:

1. **DETECT_AGENT** — infer from MCP transport metadata. Fail → elicit numbered list of 9 supported agents; user types selection.

2. **VERIFY_SESSION** — API key resolves to user with linked GitHub identity. Hard stop if missing: `"Generate an API key at <host>/settings"`

3. **VERIFY_ORG_MEMBERSHIP**
   - Primary: `GET https://api.github.com/orgs/solution8-com/members/{githubUsername}` via NextAuth OAuth token
   - 204 → pass
   - 403 (missing `read:org` scope) → elicitation fallback: `"Run: gh api /orgs/solution8-com/members/{username} — paste the HTTP status"`; 204 from elicit → pass; 404 → fail
   - 404 → hard stop: `"Not a solution8-com org member. Contact le-dawg."`

4. **VERIFY_CLI** — for Tier 1 + Tier 2 CLI agents: elicit `cliCheckCmd` from `AgentConfig`. IDE-only agents (Cline, Windsurf) skip to config injection. Missing CLI → warn + remediation URL from `AgentConfig.docsUrl`.

5. **CHECK_EXISTING_MARKETPLACE** — if user already has collection registered → idempotent success, skip steps 6-7.

6. **SUGGEST_COLLECTION** — list user's PUBLIC + ADMIN_PRIVATE collections. None exist → `"Use create_collection to set up your first collection."` Collections exist → user selects one via elicitation.

7. **GENERATE_INSTALL_COMMANDS** — per detected agent tier, return ready-to-run install commands.

**`update_agent_config`** (admin only)
```
Input:  { agentId: string, action: "fetch"|"write", data?: Partial<AgentConfig> }
Output: { diff?: object, updated?: AgentConfig, status: string }
```
- `action: "fetch"` — fetches `AgentConfig.docsUrl` (allowlisted domains only), returns proposed diff for confirmation
- `action: "write"` — applies confirmed data to DB; rate-limited to 1/hour per agentId per admin; audit-logged

### 4.3 Retained existing tools (unchanged)

`save_skill`, `add_file_to_skill`, `update_skill_file`, `remove_file_from_skill`, `get_skill`, `search_skills`, `create_skill_comment`

---

## 5. Agent Compatibility Registry

### 5.1 Supported agents — Phase 1

**Tier 1: MARKETPLACE_NATIVE** — native `marketplace.json` + `/plugin` commands

| agentId | displayName | pluginRegisterCmd | cliCheckCmd |
|---|---|---|---|
| `claude-code` | Claude Code | `claude mcp add ... && /plugin marketplace add {url}` | `claude --version` |
| `copilot-cli` | GitHub Copilot CLI | `copilot plugin marketplace add {url}` | `copilot --version` |
| `codex` | Codex CLI | `codex plugin marketplace add {url}` | `codex --version` |
| `antigravity` | Antigravity CLI | `/plugin marketplace add {url}` | `agy --version` |

**Tier 2: NPX_SKILLS** — `npx skills` for SKILL items + config injection for MCP

| agentId | displayName | npxSkillsFlag | skillsPathGlobal | cliCheckCmd |
|---|---|---|---|---|
| `kilo-code` | Kilo Code | `--agent kilo` | `~/.config/kilo/` | `kilo --version` |
| `cursor` | Cursor | `--agent cursor` | `~/.cursor/skills/` | `cursor --version` |
| `windsurf` | Windsurf | `--agent windsurf` | `~/.codeium/windsurf/skills/` | _(IDE — skip)_ |
| `cline` | Cline | `--agent cline` | `~/.cline/data/` | _(IDE — skip)_ |
| `opencode` | OpenCode | `--agent opencode` | `~/.config/opencode/` | `opencode --version` |

### 5.2 `npx skills` install path logic

```
SKILL item + Tier 1 agent  → /plugin install via marketplace.json
SKILL item + Tier 2 agent  + GitHub sync URL  → npx skills add <sourceUrl> --agent <flag>
SKILL item + Tier 2 agent  + INTERNAL source  → config injection (download URL)
MCP  item + any agent      → config injection from AgentConfig.mcpConfigTemplate
LOCAL item + any agent     → skipped, warning returned
```

---

## 6. Onboarding UX

Extension to `src/app/settings/page.tsx`. No new page.

New section below existing API key block:

```
── Agent Setup (existing McpConfigTabs) ─────────────────────
── Collections & Marketplace (NEW) ──────────────────────────

Your collections appear as installable marketplaces in Claude
Code and other supported agents.

Quick setup via MCP:
  Use `set_me_up` in your connected agent session to complete
  marketplace setup automatically.

Manual setup:
  [List of user's collections with marketplace.json URLs]
  [Copy button per URL]
```

`[username]` profile page: PUBLIC collections listed read-only. No onboarding block.

---

## 7. Auth & Security

### 7.1 Auth helpers (new)

```typescript
assertPublisher(user)         // Phase 1: username === "le-dawg"
assertOwner(user, collection) // collection.ownerId === user.id
assertAdminOrOwner(user, collection) // owner OR user.role === ADMIN
```

### 7.2 Access control — DB query layer

`USER_PRIVATE` queries always append `WHERE ownerId = authenticatedUserId`. Admin role explicitly excluded. Returns 404, never 403.

`ADMIN_PRIVATE` queries: `WHERE ownerId = userId OR role = ADMIN OR EXISTS(CollectionMember WHERE userId = authenticatedUserId)`

### 7.3 SSRF protection

`CollectionItem.sourceUrl` validated on write:
- Must match `https://github.com/` or `https://gitlab.com/`
- Reject: `localhost`, `127.x`, `10.x`, `192.168.x`, `169.254.x`, IPv6 loopback, non-HTTPS

`update_agent_config` fetch allowlist:
```
github.com, raw.githubusercontent.com, docs.anthropic.com,
cursor.com, openai.com, kilo.ai, docs.windsurf.com,
cline.bot, docs.github.com, antigravity.google
```

### 7.4 Content integrity

INTERNAL items: SHA-256 of served file content stored in `CollectionItem.contentHash`. Returned as `sha` field in `marketplace.json`. Tier 1 agents verify on install.

### 7.5 Rate limits

| Endpoint | Limit | Scope |
|---|---|---|
| `GET marketplace.json` (unauth) | 60 req/min | per IP |
| `GET marketplace.json` (auth) | 300 req/min | per API key |
| `set_me_up` | 10 req/hour | per user |
| `update_agent_config` | 1 req/hour | per agentId per admin |
| `install_collection` | 30 req/hour | per user |

### 7.6 Audit logging

`AuditLog` written for: `install_collection`, `set_me_up` (with check results), `update_agent_config` (with before/after diff), collection create/delete, visibility changes.

### 7.7 Supply chain mitigations (Phase 1)

| Attack vector | Mitigation |
|---|---|
| Malicious script in INTERNAL items | SHA-256 hash verified on install; admin-reviewed |
| Post-install weaponization (GITHUB items) | `upstreamRef` tracks last known SHA; optional pin |
| Namespace collision | `@@unique([ownerId, slug])` scoped to owner |
| SSRF via sourceUrl | Domain allowlist + IP range rejection on write |
| prompt injection in update_agent_config | Fetched content presented as diff — never auto-applied |
| API key in marketplace.json | Never included; auth via header only |

Not mitigated Phase 1 (Phase 4): code signing, sandboxing, supply chain attestations.

---

## 8. Testing Matrix

### 8.1 Data model

- `@@unique([ownerId, slug])` enforced; same slug different owner allowed
- `USER_PRIVATE` invisible to other users AND admins — 0 rows, not 403
- `ADMIN_PRIVATE` visible to admins + invited CollectionMembers
- `sourceUrl` SSRF validation: localhost, private IPs, http:// all rejected on write
- `@@unique([collectionId, order])` enforced
- `contentHash` computed correctly on INTERNAL write
- `AuditLog` entry created on sensitive actions

### 8.2 API routes

- `GET marketplace.json` — all visibility tiers × auth states
- LOCAL items excluded from marketplace.json response
- INTERNAL items include download URL + sha in marketplace.json
- `POST /api/collections` — non-admin rejected (Phase 1 gate)
- Delete operations — owner only enforced
- Admin PATCH on PUBLIC collection succeeds; on USER_PRIVATE returns 404
- Rate limits: 61st req → 429

### 8.3 MCP tools

- `get_collections` visibility filtering correct
- `create_collection` non-admin rejected Phase 1
- `update_collection_item remove` — non-owner rejected
- Admin add/edit on PUBLIC collection succeeds; remove returns error
- `install_collection` LOCAL items in `skipped` array, not `commands`
- `install_collection` Tier 1 → marketplace command; Tier 2 → npx skills
- MCP items always config injection regardless of tier
- `set_me_up` idempotent on rerun
- `set_me_up` missing `read:org` scope triggers elicitation
- `set_me_up` non-org member → hard stop + remediation
- `update_agent_config` off-allowlist domain rejected

### 8.4 marketplace.json compliance

- Validates against Claude Code schema
- Copilot CLI, Codex CLI, Antigravity CLI can each register endpoint and install
- GITHUB item: correct source URL + ref
- INTERNAL item: download endpoint URL + contentHash as sha

### 8.5 Security

- `USER_PRIVATE` returns 404 not 403 to non-owners
- `contentHash` mismatch on INTERNAL download flagged
- Publisher gate: non-le-dawg rejected Phase 1
- All sensitive actions produce AuditLog rows

### 8.6 End-to-end scenarios

1. New admin: login → settings → MCP connect → `set_me_up` → marketplace registered → `install_collection` → plugin active in agent session
2. Admin creates PUBLIC collection → another admin adds item → owner reorders → Tier 1 agent installs
3. Admin reads another admin's USER_PRIVATE collection via MCP → 404
4. `update_agent_config` fetch → diff presented → admin confirms → `set_me_up` uses updated config

---

## 9. Acceptance Criteria

Phase 1 is done when all are true:

- [ ] User logs into PromptBar via GitHub, verified as solution8-com org member
- [ ] Settings page shows Collections block with marketplace URLs
- [ ] `set_me_up` MCP tool completes all 7 checks for Claude Code with verified auth path
- [ ] All 4 Tier 1 agents can register `marketplace.json` endpoint and install collection items
- [ ] Tier 2 agents install SKILL items via `npx skills`; MCP items via config injection
- [ ] LOCAL items skipped with clear warning in `install_collection`
- [ ] USER_PRIVATE collections return 404 to all non-owners including admins
- [ ] ADMIN_PRIVATE collections visible to org admins + invited members only
- [ ] Delete restricted to owner only across all visibility tiers
- [ ] le-dawg can unpublish other users' PUBLIC collections
- [ ] `update_agent_config` MCP tool fetches from allowlist, presents diff, requires confirmation
- [ ] All sensitive actions produce AuditLog entries
- [ ] SSRF protection rejects private IPs and non-HTTPS sourceUrls
- [ ] INTERNAL items: contentHash computed on write, returned as sha in marketplace.json
- [ ] Rate limits active on all specified endpoints

---

## 10. Backlog Items (logged, not in Phase 1 scope)

- **BLOCKING (pre-implementation):** Admin plugin review/approval UI — scope before writing-plans
- **MCP audit:** Too many tools exposed in mcp.ts; guide/article content exposed as tools; auth broken
- **Admin template libraries:** Per-user MCP-driven git-versioned collections with complete access isolation
- **URL import:** Paste URL from skills.sh/officialskills.sh → platform fetches and adds to skill list
- **BUG:** MCP skill/article creation reports success but URL is broken (ID+slug concatenation issue)
- **Phase 3 prerequisite:** OAuth scope expansion (`repo` write) + secure token storage for GitHub push sync

---

## 11. Phase Boundaries

| Phase | Scope |
|---|---|
| **1 (this spec)** | Collections, marketplace.json serving, set_me_up, agent compat registry, onboarding UX |
| **2** | .skill upload hardening, manifest standardization, skill sync pull (read-first) |
| **3** | Skill push + conflict resolution, marketplace admin/policy/observability, GitHub write OAuth |
| **4** | Code signing, attestations, strict policy gates, enterprise hardening |
