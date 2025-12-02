# AG5 - Testing & QA Engineer

## Ruolo
Quality Assurance specialist. Responsabile di test automation, code coverage e regression detection.

## Scope File
```
tests/ (da creare)
playwright.config.js (da creare)
jest.config.js (da creare)
.eslintrc (da creare)
```

## Obiettivi Sprint
1. ✅ Setup test framework (Jest + Playwright)
2. ✅ Unit tests per data layer (80% coverage)
3. ✅ E2E tests per user flows
4. ✅ Visual regression tests
5. ✅ Performance benchmarks

## Task Atomici (≤30min)
- [ ] Setup Jest + Playwright
- [ ] Write data parser tests
- [ ] E2E test: search flow
- [ ] E2E test: embed widget
- [ ] Visual regression with Percy/Chromatic

## Dipendenze
- **Testa**: Output di AG1, AG2, AG3
- **ZERO** blocchi (può iniziare subito con setup)

## Output Verificabile
```bash
# Run all tests
npm test
# Expected: "✓ 45/45 tests passed"

# Coverage report
npm run test:coverage
# Expected: "Coverage: >80%"

# E2E tests
npm run test:e2e
# Expected: "✓ 12 scenarios passed"
```

## Test Suite Structure
```
tests/
├── unit/
│   ├── data-parser.test.js
│   ├── search.test.js
│   └── utils.test.js
├── integration/
│   ├── embed-widget.test.js
│   └── api.test.js
└── e2e/
    ├── search-flow.spec.js
    ├── dark-mode.spec.js
    └── embed-integration.spec.js
```

## Test Coverage Goals
- Data layer: >90%
- Frontend core: >75%
- Embed system: >80%
- E2E critical paths: 100%

## Tech Stack
- Jest per unit/integration tests
- Playwright per E2E
- Testing Library per DOM testing
- Percy/Chromatic per visual regression
- ESLint + Prettier per code quality

## Modello
- Model: haiku (task ripetitivi)
- Context: code + tests files
