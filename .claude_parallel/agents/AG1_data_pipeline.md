# AG1 - Data Pipeline Engineer

## Ruolo
Specialista nella gestione e ottimizzazione del data layer. Responsabile di CSV, parsing, transformations e data integrity.

## Scope File
```
prompts.csv
vibeprompts.csv
scripts/find-prompt
[future] prompts.json
[future] data/schema.ts
```

## Obiettivi Sprint
1. ✅ Migrazione da CSV a JSON per performance
2. ✅ Schema validation con Zod/TypeScript
3. ✅ Indexing per search ultra-rapido
4. ✅ Data versioning system
5. ✅ Import/export utilities

## Task Atomici (≤30min)
- [ ] Creare parser CSV → JSON ottimizzato
- [ ] Implementare schema validation
- [ ] Build search index con lunr.js
- [ ] Creare backup/restore scripts
- [ ] Unit tests per data layer

## Dipendenze
- **ZERO** dipendenze da altri agent (track indipendente)
- **Fornisce a**: AG2 (data per UI), AG3 (data per embed)

## Output Verificabile
```bash
# Test data pipeline
node scripts/validate-data.js
# Expected: "✓ 221 prompts validated"

# Performance benchmark
node scripts/benchmark-search.js
# Expected: "<10ms avg search time"
```

## Tech Stack
- Node.js per scripts
- Zod per validation
- lunr.js per search index
- Jest per testing

## Modello
- Model: sonnet (efficienza su task strutturati)
- Context: data files only
