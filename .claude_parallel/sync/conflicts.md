# Conflict Management & Sync Log

## 🎯 Purpose
Track merge conflicts, sync issues, and resolution strategies across parallel development tracks.

---

## 🔄 Sync Protocol

### Auto-Sync Triggers
1. **File commits** to watched paths trigger notifications
2. **SYNC markers** in sprint plan (SYNC-1, SYNC-2, etc.)
3. **Manual sync** via orchestrator command

### Sync Process
```bash
# AG0 triggers sync
echo "SYNC-$(date +%s)" > .claude_parallel/sync/trigger

# Each agent checks trigger
watch -n 60 'cat .claude_parallel/sync/trigger'

# Pull latest
git pull origin claude/parallel-dev-orchestrator-*

# Resolve conflicts (if any)
# Report status to AG0
```

---

## ⚠️ Known Conflict Zones

### Zone 1: package.json
**Risk**: 🔴 HIGH
**Reason**: Multiple agents install dependencies
**Tracks**: AG1, AG2, AG3, AG4, AG5

**Mitigation**:
- AG0 maintains master package.json
- Agents request deps via issue comments
- AG4 integrates all deps weekly

**Resolution Strategy**:
```bash
# Accept all dependencies (merge)
git checkout --theirs package.json
npm install
npm dedupe
git add package.json package-lock.json
```

---

### Zone 2: data/prompts.json
**Risk**: 🟡 MEDIUM
**Reason**: AG1 generates, AG6 enriches metadata
**Tracks**: AG1 (writer), AG6 (enricher)

**Mitigation**:
- AG1 writes base structure
- AG6 adds metadata layer (separate step)
- Sequential, not parallel

**Resolution Strategy**:
```bash
# AG6 waits for AG1 completion
# No concurrent writes = no conflicts
```

---

### Zone 3: README.md
**Risk**: 🟡 MEDIUM
**Reason**: Documentation updates
**Tracks**: AG4 (badges), AG6 (content)

**Mitigation**:
- AG4 owns header section (lines 1-100)
- AG6 owns prompt list (lines 100+)
- Clear section boundaries

**Resolution Strategy**:
```bash
# Manual merge if conflict
# Review both changes, combine intelligently
```

---

### Zone 4: .github/workflows/
**Risk**: 🟢 LOW
**Reason**: AG4 exclusive ownership
**Tracks**: AG4 only

**Mitigation**: Single owner = no conflicts

---

## 📋 Conflict Log

### CONFLICT-001
**Date**: 2025-11-20 (anticipated)
**Status**: 🟠 POTENTIAL
**Zone**: package.json
**Tracks**: AG1, AG2, AG3
**Description**: All tracks installing deps in parallel

**Resolution**:
- Implement dep request system
- AG0 coordinates package.json updates
- **Status**: PREVENTED

---

### CONFLICT-002
**Date**: TBD
**Status**: 🟢 RESOLVED
**Zone**: vite.config.js
**Tracks**: AG2, AG3
**Description**: Both trying to configure Vite differently

**Resolution**:
- AG2 owns main app config
- AG3 uses rollup.config.js instead
- Separated configs = no conflict
- **Status**: PREVENTED BY DESIGN

---

## 🛠️ Resolution Tools

### 1. Conflict Detector Script
```bash
#!/bin/bash
# .claude_parallel/scripts/detect-conflicts.sh

echo "🔍 Scanning for potential conflicts..."

# Check for concurrent package.json edits
git log --oneline --since="1 hour ago" package.json | wc -l

# Check for overlapping file edits
git log --oneline --since="1 hour ago" --name-only | \
  sort | uniq -c | sort -rn | head -10

# Alert if >2 commits to same file
```

### 2. Smart Merge Tool
```bash
#!/bin/bash
# .claude_parallel/scripts/smart-merge.sh

FILE=$1

case $FILE in
  package.json)
    # Use npm to resolve
    npm install
    ;;
  *.md)
    # Manual review required
    echo "⚠️  Manual review needed for $FILE"
    ;;
  *)
    # Default: accept incoming
    git checkout --theirs $FILE
    ;;
esac
```

### 3. Sync Status Dashboard
```bash
#!/bin/bash
# .claude_parallel/scripts/sync-status.sh

cat <<EOF
╔══════════════════════════════════════╗
║     SYNC STATUS DASHBOARD           ║
╚══════════════════════════════════════╝

Track A (Data):     ✅ SYNCED
Track B (Frontend): 🔄 SYNCING (85%)
Track C (Embed):    ✅ SYNCED
Track D (Build):    ⏸️  WAITING
Track E (Testing):  ✅ SYNCED
Track F (Content):  ✅ SYNCED

Last Sync: $(date)
Conflicts: 0
Warnings: 1 (package.json outdated)

EOF
```

---

## 📊 Conflict Metrics

| Sprint | Total Conflicts | Auto-Resolved | Manual | Avg Resolution Time |
|--------|----------------|---------------|--------|---------------------|
| SPRINT-001 | 0 (projected) | 0 | 0 | n/a |

**Target**: <2 conflicts per sprint, <15min resolution time

---

## 🎓 Best Practices

### For Agents
1. **Pull before push**: Always `git pull` before starting work
2. **Atomic commits**: Small, focused commits reduce conflicts
3. **Communicate**: Post status updates in sync log
4. **Test before merge**: Run tests before pushing

### For Orchestrator (AG0)
1. **Monitor sync points**: Watch for SYNC-* triggers
2. **Proactive resolution**: Don't wait for conflicts to escalate
3. **Clear ownership**: Assign file ownership explicitly
4. **Backup critical files**: Before major merges

---

## 🚨 Escalation Path

### Level 1: Auto-Resolution
- Conflict detector runs
- Smart merge tool attempts resolution
- Success → Continue

### Level 2: Agent Coordination
- Agents negotiate resolution
- Quick sync call (async via comments)
- AG0 mediates if needed

### Level 3: Orchestrator Intervention
- AG0 manually reviews conflict
- Decides resolution strategy
- Updates conflict log
- Implements fix

### Level 4: User Escalation
- Complex conflicts requiring product decisions
- AG0 creates issue for user review
- Blocks sprint until resolved

---

## 📝 Templates

### Conflict Report Template
```markdown
## CONFLICT-XXX

**Date**: YYYY-MM-DD HH:MM
**Status**: 🔴 ACTIVE | 🟠 IN_PROGRESS | 🟢 RESOLVED
**Zone**: file_name.ext
**Tracks**: AG1, AG2
**Priority**: HIGH | MEDIUM | LOW

**Description**:
[What caused the conflict]

**Impact**:
- Blocks: [which tracks]
- Risk: [potential issues]

**Resolution Strategy**:
1. Step 1
2. Step 2
3. Step 3

**Owner**: AG0
**ETA**: [time estimate]
```

---

## 🔗 Related Documents
- [Sprint Plan](../todos/sprint_current.md)
- [Agent Configs](../agents/)
- [Prompts](../prompts/)

---

**Last Updated**: 2025-11-20
**Next Review**: After each SYNC point
**Owner**: AG0 (Master Orchestrator)
