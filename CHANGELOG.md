# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Repository scaffolding: governance files, docs, and CI skeleton.
- Pure budget evaluator (evaluate/summarize) for LCP, CLS, INP, transfer size, request count.
- CLI that exits non-zero when over budget, plus a composite action.yml.
- 8 vitest tests; strict TypeScript; CI on Node 20 and 22.
