# TRACK-A: Data Pipeline Transformation

## Mission
Trasforma il data layer da CSV a JSON con schema validation, search indexing e performance optimization.

## Contesto
Repository: awesome-chatgpt-prompts
Current state:
- 221 prompts in prompts.csv
- 37 vibe prompts in vibeprompts.csv
- No schema validation
- No search optimization
- Manual data management

## Obiettivi Concreti (questo sprint)

### 1. CSV → JSON Migration [30min]
Crea `scripts/csv-to-json.js`:
```javascript
// Input: prompts.csv, vibeprompts.csv
// Output: data/prompts.json, data/vibeprompts.json
// Performance: <100ms conversion
```

### 2. Schema Validation [25min]
Crea `data/schema.ts`:
```typescript
interface Prompt {
  id: string;
  act: string;
  prompt: string;
  tags: string[];
  for_devs: boolean;
  quality_score?: number;
}
// Validation con Zod
```

### 3. Search Index [30min]
Crea `scripts/build-search-index.js`:
```javascript
// Lunr.js indexing
// Fields: act, prompt, tags
// Output: data/search-index.json
```

### 4. Testing [20min]
Crea `tests/data-pipeline.test.js`:
- Test CSV parsing
- Test schema validation
- Test search performance (<10ms)

## Task Sequence (esegui in ordine)

```bash
# 1. Setup
npm init -y
npm install csv-parser lunr zod

# 2. Create scripts/csv-to-json.js
# ... (implementa il parser)

# 3. Test conversione
node scripts/csv-to-json.js
# Verify: data/prompts.json created with 221 items

# 4. Create schema and validation
# ... (implementa schema.ts)

# 5. Build search index
# ... (implementa build-search-index.js)

# 6. Run tests
npm test
```

## Output Attesi

✅ File creati:
- `data/prompts.json` (221 items)
- `data/vibeprompts.json` (37 items)
- `data/schema.ts` (TypeScript definitions)
- `data/search-index.json` (lunr index)
- `scripts/csv-to-json.js`
- `scripts/build-search-index.js`
- `tests/data-pipeline.test.js`

✅ Metriche:
- Conversion time: <100ms
- Search time: <10ms avg
- Test coverage: >80%

## Sync Points
- **SYNC-1 (2h)**: Condividi data/prompts.json con AG2 (frontend) e AG3 (embed)
- **No blockers**: Track completamente indipendente

## Agent Config
```yaml
agent_id: AG1
model: sonnet
focus_files:
  - prompts.csv
  - vibeprompts.csv
  - scripts/*
  - data/*
  - tests/data-*
```

---

**INIZIA ORA**: Crea package.json e installa le dipendenze necessarie.
