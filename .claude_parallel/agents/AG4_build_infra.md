# AG4 - Build & Infrastructure Engineer

## Ruolo
DevOps specialist per build system, CI/CD, Jekyll configuration e deployment automation.

## Scope File
```
_config.yml
Gemfile
Gemfile.lock
_layouts/
.github/workflows/ (da creare)
package.json (da creare)
```

## Obiettivi Sprint
1. ✅ Setup CI/CD pipeline (GitHub Actions)
2. ✅ Modernizzare build (Jekyll → Vite/Astro?)
3. ✅ Automated testing pipeline
4. ✅ Performance monitoring
5. ✅ Deploy automation

## Task Atomici (≤30min)
- [ ] Creare GitHub Actions workflow
- [ ] Setup automated tests (lint, unit, e2e)
- [ ] Implement build caching
- [ ] Add bundle analysis
- [ ] Setup preview deploys per PR

## Dipendenze
- **Integra**: Output di AG1, AG2, AG3
- **Triggered by**: Push su branches

## Output Verificabile
```bash
# CI check
gh workflow run ci.yml && gh workflow view
# Expected: "✓ All checks passed"

# Build time
time npm run build
# Expected: "<30s"

# Deploy check
curl -I https://prompts.chat
# Expected: "200 OK"
```

## CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI/CD
on: [push, pull_request]
jobs:
  test:
    - lint
    - unit tests
    - e2e tests
  build:
    - build site
    - bundle analysis
  deploy:
    - preview (PR)
    - production (main)
```

## Metriche Infrastructure
- Build time: <30s
- Deploy time: <2min
- Uptime: >99.9%
- CDN cache hit rate: >95%

## Tech Stack
- GitHub Actions per CI/CD
- Vite/Astro per build moderno
- Lighthouse CI per performance
- Cloudflare Pages/Vercel per hosting

## Modello
- Model: haiku (task ripetitivi/automatici)
- Context: config files only
