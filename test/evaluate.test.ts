import { describe, it, expect } from 'vitest';
import { evaluate, summarize, type Budget, type Metrics } from '../src/evaluate.js';

describe('evaluate', () => {
  const budget: Budget = { lcpMs: 2500, cls: 0.1, inpMs: 200, totalKb: 800 };

  it('passes when all metrics are within budget', () => {
    const metrics: Metrics = { lcpMs: 2000, cls: 0.05, inpMs: 150, totalKb: 700 };
    const result = evaluate(metrics, budget);
    expect(result.passed).toBe(true);
    expect(result.violations).toEqual([]);
    expect(result.checked).toHaveLength(4);
  });

  it('flags metrics that exceed the budget', () => {
    const metrics: Metrics = { lcpMs: 3200, cls: 0.02, inpMs: 180, totalKb: 950 };
    const result = evaluate(metrics, budget);
    expect(result.passed).toBe(false);
    const metricsOver = result.violations.map((v) => v.metric).sort();
    expect(metricsOver).toEqual(['lcpMs', 'totalKb']);
  });

  it('reports how far over budget a metric is', () => {
    const result = evaluate({ lcpMs: 5000 }, { lcpMs: 2500 });
    expect(result.violations[0]!.overBy).toBe(2);
  });

  it('treats a value exactly at the budget as passing', () => {
    expect(evaluate({ lcpMs: 2500 }, { lcpMs: 2500 }).passed).toBe(true);
  });

  it('only checks metrics present in both budget and measurement', () => {
    // Budget declares inpMs but metrics omit it; requests measured but not budgeted.
    const result = evaluate({ lcpMs: 2000, requests: 99 }, { lcpMs: 2500, inpMs: 200 });
    expect(result.checked).toEqual(['lcpMs']);
    expect(result.passed).toBe(true);
  });

  it('summarize describes a passing result', () => {
    expect(summarize(evaluate({ lcpMs: 2000 }, { lcpMs: 2500 }))).toContain('Within budget');
  });

  it('summarize lists each violation', () => {
    const text = summarize(evaluate({ lcpMs: 5000 }, { lcpMs: 2500 }));
    expect(text).toContain('over budget');
    expect(text).toContain('lcpMs');
  });

  it('summarize handles no overlapping metrics', () => {
    expect(summarize(evaluate({ requests: 10 }, { lcpMs: 2500 }))).toContain('nothing checked');
  });
});
