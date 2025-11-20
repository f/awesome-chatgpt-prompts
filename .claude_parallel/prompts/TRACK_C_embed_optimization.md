# TRACK-C: Embed Widget Optimization

## Mission
Ottimizza embed system: riduci bundle size (45KB → <20KB), implementa Shadow DOM isolation e CDN-ready packaging.

## Contesto
Current state:
- embed-script.js: 45KB (troppo grande)
- embed-preview-script.js: 40KB
- No isolation (style conflicts possibili)
- No CDN distribution
- No widget API configurabile

## Obiettivi Concreti (questo sprint)

### 1. Bundle Minification [30min]
Ottimizza embed-script.js:
```javascript
// Target: 45KB → <20KB
// Techniques:
// - Tree shaking
// - Minification (Terser)
// - Remove duplicates
// - Lazy load CSS
```

### 2. Shadow DOM Isolation [30min]
Implementa encapsulation:
```javascript
class PromptsWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // Styles completamente isolati
  }
}
customElements.define('prompts-widget', PromptsWidget);
```

### 3. Widget API [25min]
Crea API configurabile:
```javascript
<prompts-widget
  theme="dark"
  categories="coding,writing"
  limit="10"
  language="en">
</prompts-widget>

// O JavaScript API
PromptsWidget.init({
  container: '#widget',
  theme: 'dark',
  filters: ['coding'],
  onSelect: (prompt) => { /* callback */ }
});
```

### 4. CDN Package [20min]
Prepara distribuzione CDN:
```html
<!-- jsDelivr -->
<script src="https://cdn.jsdelivr.net/gh/f/awesome-chatgpt-prompts@latest/dist/widget.min.js"></script>

<!-- unpkg -->
<script src="https://unpkg.com/awesome-chatgpt-prompts@latest/dist/widget.min.js"></script>
```

## Task Sequence (esegui in ordine)

```bash
# 1. Analyze current bundle
npm install -D rollup @rollup/plugin-terser
# Analyze: what's causing 45KB?

# 2. Create rollup.config.js
# Target: ESM + UMD builds

# 3. Implement Shadow DOM
# Refactor embed-script.js → Web Component

# 4. Build optimized bundle
npm run build:widget
# Verify: <20KB

# 5. Test integration
# Create examples/integration.html
# Test in multiple contexts

# 6. CDN setup
# Tag release per jsDelivr auto-publish
```

## Output Attesi

✅ File creati:
- `src/widget/index.js` (Web Component)
- `src/widget/styles.js` (CSS-in-JS)
- `src/widget/api.js` (Public API)
- `rollup.config.js`
- `dist/widget.min.js` (<20KB)
- `dist/widget.esm.js` (ESM version)
- `examples/integration.html`
- `docs/widget-api.md`

✅ Metriche:
- Bundle size: <20KB (da 45KB = 56% reduction)
- Load time: <500ms
- No style conflicts: 100%
- Browser support: Chrome, Firefox, Safari, Edge

## Sync Points
- **SYNC-1 (2h)**: Ricevi data/prompts.json da AG1
- **No blockers**: Può procedere in parallelo con AG2

## Dependenze
- Attendi AG1 per data format
- ZERO dipendenze da AG2 (frontend main)

## Agent Config
```yaml
agent_id: AG3
model: sonnet
focus_files:
  - embed-script.js
  - embed-preview-script.js
  - embed-style.css
  - src/widget/*
  - rollup.config.js
```

## Integration Examples

### Example 1: Simple
```html
<script src="https://prompts.chat/widget.js"></script>
<prompts-widget></prompts-widget>
```

### Example 2: Configured
```html
<prompts-widget
  theme="dark"
  search="true"
  categories="coding,dev"
  limit="20">
</prompts-widget>
```

### Example 3: JavaScript API
```javascript
const widget = PromptsWidget.init({
  container: document.getElementById('prompts'),
  theme: 'auto', // auto, light, dark
  filters: {
    categories: ['coding', 'writing'],
    forDevs: true
  },
  layout: 'grid', // list, grid, compact
  onSelect: (prompt) => {
    console.log('Selected:', prompt.act);
    navigator.clipboard.writeText(prompt.prompt);
  }
});
```

---

**INIZIA ORA**: Analizza embed-script.js per identificare le aree di maggiore peso (usa rollup-plugin-visualizer).
