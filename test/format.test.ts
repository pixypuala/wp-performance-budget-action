import { describe, it, expect } from 'vitest';
import { evaluate, formatComment, type Budget, type Metrics } from '../src/index.js';

describe('formatComment', () => {
  const budget: Budget = { lcpMs: 2500, cls: 0.1, inpMs: 200, totalKb: 800 };

  it('renders an over-budget metric as FAIL and the heading as FAIL', () => {
    const metrics: Metrics = { lcpMs: 3200, cls: 0.02, inpMs: 180, totalKb: 950 };
    const md = formatComment(evaluate(metrics, budget), metrics, budget);

    expect(md).toContain('## Performance Budget: FAIL');
    // The two over-budget rows must be marked FAIL, the within-budget rows PASS.
    expect(md).toContain('| LCP (ms) | 2500 | 3200 | FAIL |');
    expect(md).toContain('| Total (KB) | 800 | 950 | FAIL |');
    expect(md).toContain('| CLS | 0.1 | 0.02 | PASS |');
    expect(md).toContain('2 of 4 checked metric(s) are over budget.');
  });

  it('renders a success summary and PASS heading when all metrics pass', () => {
    const metrics: Metrics = { lcpMs: 2000, cls: 0.05, inpMs: 150, totalKb: 700 };
    const md = formatComment(evaluate(metrics, budget), metrics, budget);

    expect(md).toContain('## Performance Budget: PASS');
    expect(md).toContain('All 4 checked metric(s) are within budget.');
    expect(md).not.toContain('FAIL');
  });

  it('is deterministic for the same input', () => {
    const metrics: Metrics = { lcpMs: 3200, cls: 0.02, inpMs: 180, totalKb: 950 };
    const first = formatComment(evaluate(metrics, budget), metrics, budget);
    const second = formatComment(evaluate(metrics, budget), metrics, budget);
    expect(first).toBe(second);
  });

  it('states nothing was checked when budget and metrics do not overlap', () => {
    const metrics: Metrics = { requests: 10 };
    const md = formatComment(evaluate(metrics, { lcpMs: 2500 }), metrics, { lcpMs: 2500 });
    expect(md).toContain('nothing checked');
    expect(md).not.toContain('| Metric |');
  });
});
