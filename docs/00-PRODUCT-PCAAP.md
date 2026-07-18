# Product Definition Using PCAAP

## Problem

Performance regressions are usually discovered after deployment because projects track a single Lighthouse score or no stable budget at all.

## Cost

- slower user journeys
- unstable CI
- large assets and query regressions
- misleading performance claims
- expensive late optimization

## Answer

Define versioned journey budgets, run statistical samples, gather browser and server timing, compare against baselines, explain variance and publish artifacts locally and in CI.

## Advantage

The tool focuses on attributable regressions and evidence instead of a vanity score.

## Proof

- sample theme/plugin regression causes a clear failed budget
- local and CI commands match
- warm/cold and median/p75 policy documented
- artifact includes environment and trace links
- lab data is never described as CrUX field data

## Ask

Use it on one repeatable WordPress journey, contribute a collector, or review the statistical budget policy.

## Product principles

1. **Bound every claim.** State exactly which versions, environments, contracts, roles, journeys and evidence support a claim.
2. **Prefer official platform APIs.** Private internals may be studied but must not become undocumented production dependencies.
3. **Prove failure detection.** Every important gate needs a known-bad fixture or mutation proving that it can fail.
4. **Local equals CI.** CI invokes versioned repository commands; it does not contain hidden logic unavailable to contributors.
5. **Safe by default.** Destructive, privileged, remote, secret-bearing or production-targeting behavior requires explicit opt-in.
6. **Documentation is a product surface.** A new contributor must be able to install, reproduce, test and understand limitations without private guidance.
7. **Maintenance is designed before launch.** Compatibility policy, ownership, deprecation, security disclosure and archive criteria exist before v1.0.

## Success outcomes

- A qualified developer can reach the documented demo from a clean clone without guessing.
- A reviewer can map every user-facing promise to code, tests and evidence.
- A maintainer can identify the supported versions, release process and breaking-change policy.
- A security reviewer can find permissions, sensitive data, network access and unsafe operations in one threat model.
- An outside contributor can select a scoped issue, run checks locally and submit a compliant pull request.

## Failure conditions

The project is not ready when it depends on undocumented local services, hides secrets in examples, uses vague compatibility language, lacks negative tests, has unowned critical code, cannot produce release artifacts from a tag, or has no plan for security reports and breaking changes.
