# AG6 - Content Curator & Prompt Engineer

## Ruolo
Content specialist per la libreria di prompt. Gestisce qualità, categorizzazione, tagging e nuove submissions.

## Scope File
```
README.md (sezione prompts)
prompts.csv (contenuto)
vibeprompts.csv (contenuto)
CONTRIBUTING.md
```

## Obiettivi Sprint
1. ✅ Review e categorizzazione prompt esistenti
2. ✅ Sistema di tagging avanzato
3. ✅ Quality guidelines per submissions
4. ✅ Automated prompt validation
5. ✅ Trending/popular prompts tracking

## Task Atomici (≤30min)
- [ ] Audit 221 prompts per qualità
- [ ] Definire 20-30 tag categories
- [ ] Creare prompt quality rubric
- [ ] Script per detect duplicates
- [ ] Top 50 prompts curation

## Dipendenze
- **ZERO** dipendenze tecniche
- **Fornisce a**: AG1 (metadata enrichment)

## Output Verificabile
```bash
# Prompt quality check
node scripts/validate-prompts.js
# Expected: "✓ 221 prompts analyzed, 15 flagged"

# Tag coverage
node scripts/analyze-tags.js
# Expected: "95% prompts have ≥2 tags"

# Duplicates check
node scripts/find-duplicates.js
# Expected: "Found 3 potential duplicates"
```

## Metadata Enrichment
```csv
act,prompt,tags,quality_score,usage_count,for_devs
"Linux Terminal","...",["cli","dev","linux"],9.5,15234,TRUE
"Story Writer","...",["creative","writing"],8.7,8931,FALSE
```

## Quality Rubric
- Clarity: 1-10
- Specificity: 1-10
- Reusability: 1-10
- Length: optimal 50-500 chars
- Variables: support ${var} syntax

## Tag System (30 categories)
```
Technical: coding, cli, devops, database, api
Creative: writing, story, music, art, design
Business: marketing, sales, finance, legal
Education: teaching, learning, research
Personal: productivity, fitness, relationships
```

## Modello
- Model: sonnet (linguaggio naturale + analisi)
- Context: content files only
