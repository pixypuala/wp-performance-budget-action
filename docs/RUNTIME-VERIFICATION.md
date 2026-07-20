# Runtime verification

The unit suite proves the parser and the evaluator against fixtures. This
document records the step fixtures cannot prove: that the parser reads a report
produced by a real Lighthouse run against a real WordPress site, and that the
CLI's exit codes behave as a CI gate on those real numbers.

## The audit

Lighthouse 12.8.2, headless Chrome, against a live WordPress 7.0.2 install:

```
$ npx lighthouse@12 http://portfolio.local/ \
    --output=json --output-path=./lh-portfolio.json \
    --only-categories=performance --chrome-flags="--headless=new"

$ node -e "…parseLighthouseReport(report)…"
metrics from REAL lighthouse run: {"lcpMs":2803,"cls":0,"totalKb":244,"requests":24}
```

Cross-checked against the report's own audit values — `largest-contentful-paint`
2802.549 ms, `cumulative-layout-shift` 0, `total-byte-weight` 249665 bytes — the
parser's rounding and the bytes-to-KiB conversion are correct, and it omitted
`inpMs`, which a Lighthouse run in this mode does not produce. That omission is
the intended behaviour: a partial report yields partial metrics, and the
evaluator only checks metrics both sides declare.

## The gate

Same real metrics, two budgets:

```
$ node dist/cli.js real-metrics.json budget-pass.json
✅ Within budget (3 metric(s) checked).
exit=0

$ node dist/cli.js real-metrics.json budget-fail.json
❌ 2 metric(s) over budget:
  ✗ lcpMs: 2803 > 2000 (×1.402)
  ✗ totalKb: 244 > 100 (×2.44)
exit=1
```

Three metrics were checked, not four: the budget declared `lcpMs`, `cls`, and
`totalKb`, and `requests` was measured but unbudgeted. Exit 0 and exit 1 are what
make this usable as a failing CI step.

## What is still not proven here

Posting the PR comment requires an authenticated GitHub API call from a real
workflow run with `pull-requests: write`. The client is injected and covered
offline by unit tests; the live call has not been executed from this machine.
