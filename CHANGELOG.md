# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Repository scaffolding: governance files, docs, and CI skeleton.
- Pure budget evaluator (evaluate/summarize) for LCP, CLS, INP, transfer size, request count.
- CLI that exits non-zero when over budget, plus a composite action.yml.
- `formatComment`: a pure, network-free PR-comment formatter that renders an evaluation as a
  deterministic Markdown table with text-based `PASS`/`FAIL` status (not colour-only).
- `parseLighthouseReport`: a pure parser that extracts the `evaluate` metrics shape (LCP,
  CLS, INP, transfer KB, request count) from a Lighthouse JSON result, omitting missing or
  non-numeric audits.
- `postOrUpdateComment`: posts or updates the PR budget comment through an injected HTTP
  client, finding its prior comment via a hidden marker so builds never stack duplicates.
- `run` (`src/main.ts`): the end-to-end action entrypoint wiring parse → evaluate → format →
  comment, reading inputs from the environment, setting `passed`/`violations`/`comment-url`
  outputs, and driving the pass/fail exit code. The live GitHub call is bound to a real
  `fetch` client only at the entrypoint bottom; the pipeline is unit-tested offline via
  injected client, file reader, logger, and output sink.
- `action.yml` rewired to the entrypoint, exposing `lighthouse-report`, `budget`,
  `github-token`, `pr-number`, `repo`, `comment`, and `api-base-url` inputs plus
  `passed`/`violations`/`comment-url` outputs.
- `.github/workflows/lighthouse-budget.yml`: a runnable workflow that performs a live
  Lighthouse audit on the runner and invokes the action to comment on the PR.
- Package entry (`src/index.ts`) exporting the pure building blocks.
- 27 vitest tests; strict TypeScript; CI on Node 20 and 22.
