# AG3 - Embed System Specialist

## Ruolo
Specialista nei widget embeddable. Responsabile di embed.html, embed-preview.html e relativi script/style isolati.

## Scope File
```
embed.html
embed-preview.html
embed-script.js (45KB)
embed-preview-script.js (40KB)
embed-style.css
embed-preview-style.css
```

## Obiettivi Sprint
1. ✅ Ottimizzare bundle size embed (<30KB)
2. ✅ Aggiungere customization API
3. ✅ Shadow DOM per style isolation
4. ✅ CDN-ready packaging
5. ✅ Widget documentation

## Task Atomici (≤30min)
- [ ] Minify embed-script.js (45KB → <20KB)
- [ ] Implementare Shadow DOM isolation
- [ ] Creare widget configurator
- [ ] CDN setup (jsDelivr/unpkg)
- [ ] Integration examples

## Dipendenze
- **Riceve da**: AG1 (data source)
- **ZERO** dipendenze da AG2 (main site)

## Output Verificabile
```bash
# Bundle check
ls -lh embed-script.min.js
# Expected: "<20KB"

# Integration test
npm run test:embed
# Expected: "✓ Widget loads in <500ms"

# Cross-browser test
npm run test:browsers
# Expected: "✓ Chrome, Firefox, Safari OK"
```

## Widget API Design
```javascript
// Simple integration
<script src="https://prompts.chat/embed.js"></script>
<div data-prompts-widget
     data-theme="dark"
     data-categories="coding,writing"
     data-limit="10"></div>

// Advanced API
PromptsWidget.init({
  container: '#my-div',
  theme: 'dark',
  filters: ['coding'],
  onSelect: (prompt) => console.log(prompt)
})
```

## Tech Stack
- Vanilla JS (no dependencies per embed)
- Shadow DOM per isolation
- PostCSS per minification
- Rollup per bundling

## Modello
- Model: sonnet (task ben definiti)
- Context: embed files only
