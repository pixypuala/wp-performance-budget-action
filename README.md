# WP Performance Budget Action

> **Document status:** implementation-complete engineering blueprint, not a claim that the software has already been built.

A local CLI and GitHub Action that evaluates repeatable WordPress journey budgets while separating lab measurements, server diagnostics and field data.

## Who this is for

- WordPress plugin/theme teams
- agencies
- performance engineers
- maintainers wanting regression gates

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
pnpm test        # 27 unit tests: evaluator, formatter, Lighthouse parser, comment poster, action orchestration
pnpm build       # compile the CLI to dist/
node dist/cli.js fixtures/metrics.json fixtures/budget.json   # exits 1 when over budget
```

### Use as a GitHub Action

Run Lighthouse to produce a JSON report, then hand it to this action. It
evaluates the budget, posts (or updates) the PR comment, and fails the job when
a metric is over budget:

```yaml
- name: Run Lighthouse
  run: |
    corepack pnpm dlx lighthouse "$TARGET_URL" \
      --only-categories=performance \
      --chrome-flags="--headless=new --no-sandbox" \
      --output=json --output-path=./lighthouse-report.json
  env:
    TARGET_URL: ${{ vars.LIGHTHOUSE_URL }}

- uses: pixypuala/wp-performance-budget-action@v0
  with:
    lighthouse-report: ./lighthouse-report.json
    budget: ./perf-budget.json
    github-token: ${{ secrets.GITHUB_TOKEN }}
    pr-number: ${{ github.event.pull_request.number }}
```

The workflow needs `pull-requests: write` permission to comment. A complete,
runnable example lives in `.github/workflows/lighthouse-budget.yml`. For a purely
local check without a report or GitHub, the CLI still takes a pre-extracted
metrics file and a budget file:

```bash
node dist/cli.js fixtures/metrics.json fixtures/budget.json   # exits 1 when over budget
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
- `run` (`src/main.ts`) — the end-to-end action entrypoint. It reads inputs from the
  environment, then wires the pure blocks together: `parseLighthouseReport` → `evaluate` →
  `formatComment` → `postOrUpdateComment`, sets the `passed`/`violations`/`comment-url`
  outputs, and drives the process exit code (non-zero on a breach, which fails the job). The
  HTTP client, file reader, logger, and output sink are injected, so the whole pipeline is
  unit-tested offline against a mock client and a fixture report — the live GitHub call only
  binds real `fetch` at the bottom of the file.
- CLI (`src/cli.ts`) — reads two JSON files and exits non-zero when over budget, for a purely
  local check without a Lighthouse report or GitHub.
- `action.yml` — composite GitHub Action that builds the entrypoint and runs it, exposing
  `lighthouse-report`, `budget`, `github-token`, `pr-number`, `repo`, `comment`, and
  `api-base-url` inputs and `passed`/`violations`/`comment-url` outputs.
- `.github/workflows/lighthouse-budget.yml` — a runnable workflow that performs a live
  Lighthouse audit on the runner (Chrome is preinstalled on `ubuntu-latest`) and invokes the
  action to comment on the PR.
- Package entry (`src/index.ts`) re-exports `evaluate`, `summarize`, `formatComment`,
  `parseLighthouseReport`, `postOrUpdateComment`, and types.
- 27 vitest tests; strict TypeScript; CI on Node 20/22.

## Environment-dependent seams (covered by the workflow)

The two seams that need a real environment are now wired, and the workflow provides that
environment. The **live Lighthouse audit** needs a real browser: the
`.github/workflows/lighthouse-budget.yml` job runs it on `ubuntu-latest`, where Chrome is
preinstalled, and produces the report JSON that `parseLighthouseReport` consumes. The
**authenticated GitHub API call** needs a real token and network: the composite action binds
a live `fetch`-based client and the job's `GITHUB_TOKEN` into `postOrUpdateComment`. Both are
exercised offline in unit tests via injection; proving them against a live PR requires an
actual CI run with `pull-requests: write` permission and a reachable target URL.
