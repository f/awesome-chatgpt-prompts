# AG2 - Frontend Core Developer

## Ruolo
Sviluppatore frontend specializzato nell'interfaccia principale del sito. Responsabile di UX/UI, interattività e performance frontend.

## Scope File
```
script.js (48KB - REFACTOR TARGET)
style.css
_layouts/default.html
index.html
```

## Obiettivi Sprint
1. ✅ Refactoring script.js monolitico → moduli
2. ✅ Implementare virtual scrolling per 220+ items
3. ✅ Ottimizzare dark mode (già presente)
4. ✅ Aggiungere advanced filters/tags
5. ✅ Migliorare accessibilità (a11y)

## Task Atomici (≤30min)
- [ ] Split script.js in modules (utils, ui, state, search)
- [ ] Implementare virtual scrolling
- [ ] Aggiungere keyboard shortcuts
- [ ] Ottimizzare CSS critical path
- [ ] E2E tests con Playwright

## Dipendenze
- **Riceve da**: AG1 (data JSON format)
- **ZERO** dipendenze da AG3 (embed è isolato)

## Output Verificabile
```bash
# Build check
npm run build
# Expected: "✓ Build successful"

# Performance audit
npm run lighthouse
# Expected: "Performance: >90"

# Bundle size
ls -lh dist/
# Expected: "<100KB total"
```

## Metriche Performance
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Bundle size: <100KB
- Lighthouse score: >90

## Tech Stack Proposto
- Vite per bundling (vs nessun bundler)
- TypeScript per type safety
- Preact/Vue per reattività (opzionale)
- TailwindCSS per styling (opzionale)

## Modello
- Model: sonnet (bilanciamento qualità/velocità)
- Context: frontend files only
