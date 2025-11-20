# 🚀 Claude Parallel Dev Orchestrator

Sistema di orchestrazione multi-agente per sviluppo parallelo ad alta velocità.

## 📂 Struttura

```
.claude_parallel/
├── agents/          # Configurazioni agenti specializzati (AG0-AG6)
├── prompts/         # Prompt operativi per ogni track
├── todos/           # Sprint planning, backlog, done list
├── sync/            # Gestione sincronizzazioni e conflitti
└── README.md        # Questo file
```

---

## 🤖 Agenti Disponibili

| ID | Nome | Ruolo | Model | Status |
|----|------|-------|-------|--------|
| AG0 | Master Orchestrator | Coordinatore centrale | opus | ⚡ ACTIVE |
| AG1 | Data Pipeline | CSV→JSON, schema, search | sonnet | 🟢 READY |
| AG2 | Frontend Core | UI refactoring, performance | sonnet | 🟡 WAITING |
| AG3 | Embed System | Widget optimization | sonnet | 🟡 WAITING |
| AG4 | Build & Infra | CI/CD, deployment | haiku | 🟢 READY |
| AG5 | Testing & QA | Test automation | haiku | 🟢 READY |
| AG6 | Content Curator | Prompt quality, tagging | sonnet | 🟢 READY |

---

## 🎯 Quick Start

### 1. Review Sprint Plan
```bash
cat .claude_parallel/todos/sprint_current.md
```

### 2. Launch Orchestrator (AG0)
```bash
# AG0 monitora e coordina tutti gli agenti
claude-code --agent-config .claude_parallel/agents/AG0_orchestrator.md
```

### 3. Launch Parallel Tracks
```bash
# In separate terminals or as background tasks
claude-code --agent-config .claude_parallel/agents/AG1_data_pipeline.md \
            --prompt-file .claude_parallel/prompts/TRACK_A_data_pipeline.md &

claude-code --agent-config .claude_parallel/agents/AG4_build_infra.md &
claude-code --agent-config .claude_parallel/agents/AG5_testing_qa.md &
claude-code --agent-config .claude_parallel/agents/AG6_content_curator.md &

# AG2, AG3 start after SYNC-1 (when AG1 completes)
```

### 4. Monitor Progress
```bash
# Watch sprint status
watch -n 30 'grep -E "\\[x\\]|\\[ \\]" .claude_parallel/todos/sprint_current.md | head -20'

# Check conflicts
cat .claude_parallel/sync/conflicts.md
```

---

## 📋 Workflow

### Phase 1: Setup (0-2h)
**Parallel execution** of independent tracks:
- AG1: Data pipeline (CRITICAL PATH)
- AG4: CI/CD setup
- AG5: Test framework
- AG6: Content audit

### Phase 2: Development (2-6h)
**After SYNC-1** (AG1 completion):
- AG2: Frontend refactoring
- AG3: Embed optimization
- Continue AG4, AG5, AG6

### Phase 3: Integration (6-12h)
**After SYNC-2**:
- AG4 integrates all builds
- AG5 runs E2E tests
- AG0 resolves conflicts

### Phase 4: Deploy (12-16h)
- Final review
- Preview deployment
- Production release

---

## 🔄 Sync Points

### SYNC-1 (T+2h)
**Trigger**: AG1 completes data/prompts.json
**Action**: AG2, AG3 pull and integrate
**Blocker**: ✅ Critical for frontend & embed

### SYNC-2 (T+6h)
**Trigger**: AG2, AG3 complete refactoring
**Action**: AG4 integrates builds, AG5 tests
**Blocker**: ⚠️ Integration issues possible

### SYNC-3 (T+12h)
**Trigger**: All tracks >90% complete
**Action**: AG0 final review, conflict resolution
**Blocker**: 🟢 Pre-deploy checkpoint

---

## 🛠️ Utility Scripts

### Create New Track
```bash
# Template for new track
cp .claude_parallel/prompts/TRACK_A_data_pipeline.md \
   .claude_parallel/prompts/TRACK_X_new_feature.md
```

### Sync All Agents
```bash
# Trigger global sync
echo "SYNC-$(date +%s)" > .claude_parallel/sync/trigger
```

### Status Report
```bash
# Generate status summary
cat <<EOF
=== ORCHESTRATOR STATUS ===
Sprint: $(grep "Sprint ID" .claude_parallel/todos/sprint_current.md)
Completed: $(grep -c "\\[x\\]" .claude_parallel/todos/sprint_current.md) tasks
Remaining: $(grep -c "\\[ \\]" .claude_parallel/todos/sprint_current.md) tasks
Conflicts: $(grep -c "ACTIVE" .claude_parallel/sync/conflicts.md)
EOF
```

---

## 📊 Metrics & KPIs

Track progress with these metrics:

```bash
# Velocity (tasks/hour)
# Coverage (% files touched)
# Conflict rate (conflicts/sync)
# Test pass rate (%)
```

See [sprint_current.md](todos/sprint_current.md) for detailed metrics.

---

## ⚠️ Important Notes

1. **AG1 is critical path** - All other frontend work depends on it
2. **AG0 coordinates** - Don't bypass orchestrator for conflicts
3. **Atomic commits** - Small, focused commits reduce conflicts
4. **Test before push** - Run tests locally before pushing
5. **Sync frequently** - Pull latest every 30min

---

## 🎓 Best Practices

### For Agents
- ✅ Pull before starting work
- ✅ Commit atomically (small, focused)
- ✅ Test before pushing
- ✅ Update sprint status immediately
- ✅ Communicate blockers early

### For Orchestrator (AG0)
- ✅ Monitor sync points proactively
- ✅ Resolve conflicts immediately
- ✅ Keep sprint plan updated
- ✅ Escalate blockers to user
- ✅ Celebrate wins! 🎉

---

## 🔗 Resources

- [Sprint Current](todos/sprint_current.md) - Active sprint tasks
- [Backlog](todos/backlog.md) - Future epics & features
- [Conflicts](sync/conflicts.md) - Conflict management
- [Agents](agents/) - Agent configurations

---

## 📞 Support

Issues? Questions?
1. Check [conflicts.md](sync/conflicts.md) for known issues
2. Review [sprint_current.md](todos/sprint_current.md) for status
3. Contact AG0 (Orchestrator) for coordination

---

**Version**: 1.0.0
**Created**: 2025-11-20
**Last Updated**: 2025-11-20
**Status**: ✅ OPERATIONAL
