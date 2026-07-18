# WP Performance Budget Action

> **Document status:** implementation-complete engineering blueprint, not a claim that the software has already been built.

A local CLI and GitHub Action that evaluates repeatable WordPress journey budgets while separating lab measurements, server diagnostics and field data.

## Who this is for

- WordPress plugin/theme teams
- agencies
- performance engineers
- maintainers wanting regression gates

## Start-to-finish route

1. Read `docs/00-PRODUCT-PCAAP.md` and accept or change the problem boundary.
2. Freeze v1 scope using `docs/01-SCOPE-REQUIREMENTS-ACCEPTANCE.md`.
3. Record architecture decisions from `docs/02-ARCHITECTURE-AND-ADRS.md` before scaffolding.
4. Create the exact repository skeleton in `docs/03-REPOSITORY-STRUCTURE.md`.
5. Apply the stack and compatibility policy in `docs/04-STACK-COMPATIBILITY-DEPENDENCIES.md`.
6. Execute phases in `docs/05-IMPLEMENTATION-PLAN.md`; do not jump to polish before contracts and failure paths.
7. Apply security/privacy controls and threat model from `docs/06-SECURITY-PRIVACY-THREAT-MODEL.md`.
8. Build the test system in `docs/07-TEST-QUALITY-ACCESSIBILITY-PERFORMANCE.md`.
9. Enforce merge/release gates in `docs/08-CI-CD-SUPPLY-CHAIN-RELEASE.md`.
10. Produce user, contributor, API and evidence documentation from `docs/09-DOCUMENTATION-DEMO-EVIDENCE.md`.
11. Establish governance and maintainer expectations from `docs/10-OPEN-SOURCE-GOVERNANCE.md`.
12. Operate support, deprecation and incident handling from `docs/11-MAINTENANCE-SUPPORT-INCIDENTS.md`.
13. Follow `docs/12-ROADMAP-MILESTONES-ISSUES.md` and release only through `docs/13-STRICT-AUDIT-FIX-DEFINITION-OF-DONE.md`.
14. Freeze commands and machine contracts in `docs/15-TECHNICAL-CONTRACTS-COMMANDS-SCHEMAS.md`.
15. Execute the decomposed work in `docs/16-IMPLEMENTATION-BACKLOG.md`.
16. Release and transfer maintainership using `docs/17-RELEASE-MANIFEST-AND-HANDOFF.md`.
17. Use `TEMPLATES/` to initialize repository community and CI files; replace all placeholders before publishing.

## Required implementation outputs

- CLI package
- GitHub Action
- diagnostic plugin
- budget/result schemas
- fixture sites
- sample dashboards/reports
- statistical methodology document

## Non-negotiable rule

A feature is not complete because code exists. It is complete only when its contract, permissions, failure behavior, automated tests, manual evidence where applicable, documentation, migration/deprecation impact and release artifact are all reviewed.

## Getting started

Requires Node 20+ and pnpm (`corepack enable`).

```bash
pnpm install
pnpm test        # 24 unit tests: evaluator, PR-comment formatter, Lighthouse parser, comment poster
pnpm build       # compile the CLI to dist/
node dist/cli.js fixtures/metrics.json fixtures/budget.json   # exits 1 when over budget
```

### Use as a GitHub Action

```yaml
- uses: pixypuala/wp-performance-budget-action@v0
  with:
    metrics: ./reports/metrics.json
    budget: ./perf-budget.json
```

## What is built today

- `evaluate` (`src/evaluate.ts`) — the pure pass/fail policy: compares measured metrics (LCP,
  CLS, INP, transfer KB, request count) against a declared budget, reporting each over-budget
  metric and how far over. Only metrics present in both are checked, so partial budgets work.
- `summarize` — human-readable CI/PR output.
- `formatComment` (`src/format.ts`) — a pure function that renders an evaluation as a
  deterministic Markdown table for a PR comment. Pass/fail is signalled with the text
  `PASS`/`FAIL` (never colour alone), so it survives plain text, screen readers, and
  monochrome rendering. No network — building the string is separate from posting it.
- `parseLighthouseReport` (`src/lighthouse.ts`) — a pure function that turns a Lighthouse
  JSON result object into the exact metrics shape `evaluate` consumes (LCP, CLS, INP,
  transfer KB, request count). Missing or non-numeric audits are omitted, so a partial
  report yields a partial `Metrics` and the "only check overlapping metrics" rule holds.
- `postOrUpdateComment` (`src/github-comment.ts`) — posts the budget comment to a PR, or
  edits the existing one in place (found via a hidden marker) so builds do not stack
  duplicates. The HTTP client is injected, so the create-vs-update decision and request
  shape are fully unit-tested against a mock — no network, no live token.
- CLI (`src/cli.ts`) — reads two JSON files and exits non-zero when over budget.
- `action.yml` — composite GitHub Action wrapping the CLI.
- Package entry (`src/index.ts`) re-exports `evaluate`, `summarize`, `formatComment`,
  `parseLighthouseReport`, `postOrUpdateComment`, and types.
- 24 vitest tests; strict TypeScript; CI on Node 20/22.

## Documented boundary (not yet built)

Two environment-dependent seams remain. Running Lighthouse live requires a real browser,
so producing the report JSON that `parseLighthouseReport` consumes is deferred (the parse
step itself is built and tested). Making the authenticated GitHub API call requires a real
token and network; `postOrUpdateComment` performs the request logic against an injected
client, but wiring a live client and credentials into the action runtime is deferred.
