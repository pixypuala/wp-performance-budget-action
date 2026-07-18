#!/usr/bin/env node
/**
 * CLI / action entry: compare a metrics JSON file against a budget JSON file.
 *
 * Usage: wp-perf-budget <metrics.json> <budget.json>
 * Exit 0 when within budget, 1 when over budget, 2 on bad input. This is what
 * lets it double as a GitHub Action step (a non-zero exit fails the job).
 */

import { readFileSync } from 'node:fs';
import { evaluate, summarize, type Budget, type Metrics } from './evaluate.js';

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    process.stderr.write(`Cannot read/parse ${path}: ${(error as Error).message}\n`);
    process.exit(2);
  }
}

const [metricsPath, budgetPath] = process.argv.slice(2);
if (!metricsPath || !budgetPath) {
  process.stderr.write('Usage: wp-perf-budget <metrics.json> <budget.json>\n');
  process.exit(2);
}

const result = evaluate(readJson(metricsPath) as Metrics, readJson(budgetPath) as Budget);
process.stdout.write(summarize(result) + '\n');
process.exit(result.passed ? 0 : 1);
