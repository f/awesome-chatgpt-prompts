# TRACK-B: Frontend Core Refactoring

## Mission
Refactorizza script.js monolitico (48KB) in architettura modulare con virtual scrolling e performance optimization.

## Contesto
Current state:
- script.js: 48KB, 1400+ lines, monolitico
- style.css: 42KB
- No bundling, no modules
- 220+ items rendered simultaneamente (performance issue)
- Dark mode già implementato ✓

## Obiettivi Concreti (questo sprint)

### 1. Split Monolith → Modules [30min]
Ristruttura script.js:
```
src/
├── js/
│   ├── main.js (entry point)
│   ├── state.js (state management)
│   ├── search.js (search logic)
│   ├── ui.js (DOM manipulation)
│   ├── filters.js (filtering logic)
│   └── utils.js (helper functions)
```

### 2. Virtual Scrolling [30min]
Implementa rendering lazy per 220+ items:
```javascript
// Render solo 20 items visibili + 10 buffer
// Performance target: 60fps scroll
// Library: vanilla-js o react-window
```

### 3. Build Setup [25min]
Setup Vite bundler:
```bash
npm install -D vite
# vite.config.js
# npm run build → dist/
# Target bundle: <100KB
```

### 4. Performance Optimization [20min]
- Debounce search input (300ms)
- Lazy load prompt content
- CSS critical path extraction
- Image lazy loading (se presenti)

## Task Sequence (esegui in ordine)

```bash
# 1. Backup current
cp script.js script.legacy.js

# 2. Setup Vite
npm install -D vite
# Create vite.config.js

# 3. Create src/ structure
mkdir -p src/js
# Split script.js → modules

# 4. Implement virtual scrolling
# ... (usa intersection observer o libreria)

# 5. Test build
npm run build
# Verify: dist/ created, bundle <100KB

# 6. Test performance
npm run lighthouse
# Target: Performance >90
```

## Output Attesi

✅ File creati:
- `src/js/main.js` (entry)
- `src/js/state.js` (~100 lines)
- `src/js/search.js` (~150 lines)
- `src/js/ui.js` (~200 lines)
- `src/js/filters.js` (~100 lines)
- `src/js/utils.js` (~80 lines)
- `vite.config.js`
- `dist/` (build output)

✅ Metriche:
- Bundle size: <100KB (da 48KB)
- Lighthouse Performance: >90
- First Contentful Paint: <1.5s
- Time to Interactive: <3s

## Sync Points
- **SYNC-1 (2h)**: Ricevi data/prompts.json da AG1
- **SYNC-2 (4h)**: Integra con AG4 (build pipeline)

## Dependenze
- Attendi AG1 per `data/prompts.json` format
- Poi procedi in parallelo

## Agent Config
```yaml
agent_id: AG2
model: sonnet
focus_files:
  - script.js
  - src/js/*
  - style.css
  - _layouts/default.html
  - vite.config.js
```

---

**INIZIA ORA**: Crea directory src/js/ e inizia lo split di script.js partendo da utils.js (funzioni helper).
