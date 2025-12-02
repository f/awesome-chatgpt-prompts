# 🚀 LAUNCH SEQUENCE - Parallel Dev Orchestrator

## ⚡ Modalità di Avvio

Scegli tra **Sequential** (più semplice) o **Parallel** (massima velocità).

---

## 🔹 MODALITÀ 1: Sequential Launch (Consigliata per primo utilizzo)

Avvia un agente alla volta, monitora, poi passa al prossimo.

### Step 1: Launch Master Orchestrator (AG0)
```bash
# Terminal 1
cd /home/user/awesome-chatgpt-prompts

# Leggi la configurazione orchestrator
cat .claude_parallel/agents/AG0_orchestrator.md

# AG0 monitora tutto il sistema
# Esegui manualmente o tramite Task tool
```

**AG0 Checklist**:
- [ ] Sprint plan reviewed
- [ ] Agents status verified
- [ ] Sync points configured
- [ ] Ready to launch tracks

---

### Step 2: Launch Critical Path (AG1 - Data Pipeline)
```bash
# Terminal 2
# Segui prompt: TRACK_A_data_pipeline.md

# Task sequence:
# 1. npm init -y
# 2. npm install csv-parser lunr zod
# 3. Create scripts/csv-to-json.js
# 4. Create data/schema.ts
# 5. Create scripts/build-search-index.js
# 6. Test: node scripts/csv-to-json.js
```

**AG1 Output Atteso**:
- ✅ `data/prompts.json` created (221 items)
- ✅ `data/search-index.json` created
- ✅ Tests passing

**SYNC-1 TRIGGER**: Quando AG1 completa → notifica AG2, AG3

---

### Step 3: Launch Independent Tracks (AG4, AG5, AG6)
```bash
# Terminal 3 - AG4 (Build & CI/CD)
# Crea .github/workflows/ci.yml
# Setup ESLint, Prettier
# Configure build caching

# Terminal 4 - AG5 (Testing)
# Setup Jest, Playwright
# Write initial tests

# Terminal 5 - AG6 (Content Curation)
# Audit prompts.csv
# Define tag categories
```

**Paralleli sicuri**: AG4, AG5, AG6 non hanno conflitti tra loro

---

### Step 4: After SYNC-1 → Launch Frontend Tracks
```bash
# Attendi: AG1 completes data/prompts.json

# Terminal 6 - AG2 (Frontend)
# Segui prompt: TRACK_B_frontend_refactor.md
# Setup Vite
# Split script.js → modules

# Terminal 7 - AG3 (Embed)
# Segui prompt: TRACK_C_embed_optimization.md
# Setup Rollup
# Optimize bundle
```

---

### Step 5: Integration & Deploy (SYNC-2, SYNC-3)
```bash
# AG4 integra tutti i build
# AG5 run E2E tests
# AG0 conflict resolution
# Deploy to preview
```

---

## 🔸 MODALITÀ 2: Parallel Launch (Massima velocità)

Lancia tutti gli agenti simultaneamente. Richiede gestione avanzata.

### Command Sequence (esegui in parallelo)
```bash
#!/bin/bash
# .claude_parallel/launch-all.sh

# Background processes
(
  echo "🚀 AG1 - Data Pipeline starting..."
  # Execute AG1 tasks
) &

(
  echo "🚀 AG4 - Build & Infra starting..."
  # Execute AG4 tasks
) &

(
  echo "🚀 AG5 - Testing starting..."
  # Execute AG5 tasks
) &

(
  echo "🚀 AG6 - Content starting..."
  # Execute AG6 tasks
) &

# Wait for AG1 (critical path)
wait $AG1_PID

# Now launch AG2, AG3
(
  echo "🚀 AG2 - Frontend starting..."
  # Execute AG2 tasks
) &

(
  echo "🚀 AG3 - Embed starting..."
  # Execute AG3 tasks
) &

# AG0 monitors all
echo "🎯 AG0 - Orchestrator monitoring..."
watch -n 30 'grep -c "\\[x\\]" .claude_parallel/todos/sprint_current.md'
```

---

## 🎯 PER CLAUDE CODE: Task Tool Launch

Usa il **Task tool** per lanciare gli agenti come sub-agents:

```python
# Launch in parallel usando multiple Task calls in un singolo messaggio

Task(
  subagent_type="general-purpose",
  description="Data Pipeline Engineering",
  prompt="""
    Read the file: .claude_parallel/prompts/TRACK_A_data_pipeline.md
    Execute all tasks in sequence as described.
    Report back when data/prompts.json is created.
  """
)

Task(
  subagent_type="general-purpose",
  description="CI/CD Setup",
  prompt="""
    Read the file: .claude_parallel/agents/AG4_build_infra.md
    Create GitHub Actions workflow.
    Setup linting and build pipeline.
  """
)

Task(
  subagent_type="general-purpose",
  description="Testing Framework Setup",
  prompt="""
    Read the file: .claude_parallel/agents/AG5_testing_qa.md
    Setup Jest and Playwright.
    Create initial test structure.
  """
)

# ... continua per altri agent
```

---

## 📊 Monitoring Dashboard

### Real-time Status
```bash
# Terminal dedicato al monitoring
watch -n 10 '
echo "═══ ORCHESTRATOR DASHBOARD ═══";
echo "";
echo "📋 Sprint Progress:";
echo "  Completed: $(grep -c "\[x\]" .claude_parallel/todos/sprint_current.md)";
echo "  Remaining: $(grep -c "\[ \]" .claude_parallel/todos/sprint_current.md)";
echo "";
echo "🤖 Agent Status:";
echo "  AG1 (Data):     $(grep "status:" .claude_parallel/agents/AG1_data_pipeline.md | tail -1)";
echo "  AG2 (Frontend): $(grep "status:" .claude_parallel/agents/AG2_frontend_core.md | tail -1)";
echo "  AG3 (Embed):    $(grep "status:" .claude_parallel/agents/AG3_embed_system.md | tail -1)";
echo "";
echo "⚠️  Conflicts: $(grep -c "ACTIVE" .claude_parallel/sync/conflicts.md)";
echo "";
echo "Last update: $(date)";
'
```

---

## ✅ Pre-Launch Checklist

Prima di iniziare:

- [ ] Repository clean (no uncommitted changes)
- [ ] Git branch correct: `claude/parallel-dev-orchestrator-*`
- [ ] Sprint plan reviewed
- [ ] Agent roles understood
- [ ] Sync points identified
- [ ] Monitoring setup ready

---

## 🎯 Expected Timeline

| Phase | Duration | Tracks Active | Output |
|-------|----------|---------------|--------|
| Setup | 0-2h | AG1, AG4, AG5, AG6 | Data pipeline, CI setup |
| Development | 2-6h | AG2, AG3, AG4, AG5 | Refactored code |
| Integration | 6-12h | AG4, AG5, AG0 | Integrated builds |
| Deploy | 12-16h | AG4, AG0 | Production release |

**Total**: 16h wall-clock → **4-5h** con parallelizzazione efficace

---

## 🚨 Emergency Stop

Se qualcosa va storto:

```bash
# Stop tutti i processi
killall claude-code

# Reset allo stato precedente
git stash
git checkout claude/parallel-dev-orchestrator-*
git pull origin claude/parallel-dev-orchestrator-*

# Review conflicts
cat .claude_parallel/sync/conflicts.md

# Restart con modalità Sequential
```

---

## 📞 Quando Usare Quale Modalità?

**Sequential** se:
- ✅ Primo utilizzo del sistema
- ✅ Preferisci controllo granulare
- ✅ Debugging necessario
- ✅ Learning mode

**Parallel** se:
- ✅ Esperienza con il sistema
- ✅ Massima velocità richiesta
- ✅ CI/CD automation
- ✅ Production mode

---

## 🎉 Success Criteria

Sprint completato quando:

- ✅ Tutti i task [x] in sprint_current.md
- ✅ Zero conflitti attivi
- ✅ Tests passing (>80% coverage)
- ✅ Build successful (<30s)
- ✅ Preview deploy working

---

**Pronto per il lancio?** 🚀

```bash
echo "🎯 Parallel Dev Orchestrator - READY FOR LAUNCH"
echo "Choose your mode: Sequential (1) or Parallel (2)"
```

---

**Version**: 1.0.0
**Last Updated**: 2025-11-20
