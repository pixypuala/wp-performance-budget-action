/**
 * Action entrypoint: the end-to-end wiring.
 *
 * This is the seam that ties the pure building blocks into a runnable GitHub
 * Action. It reads inputs from the environment, parses a Lighthouse JSON report
 * into metrics, evaluates them against a declared budget, renders the PR
 * comment, and — behind an injected HTTP client — posts or updates that comment
 * on the pull request. The process exit code carries the pass/fail signal, so a
 * budget breach fails the job.
 *
 * The orchestration lives in {@link run}, which takes its environment, file
 * reader, logger, output sink, and HTTP client as injected dependencies. That
 * keeps the whole pipeline unit-testable offline: a mock client and a fixture
 * report exercise it with no browser, no network, and no live token. Only the
 * bottom of this file binds those seams to the real runtime (global `fetch`,
 * the filesystem, and the Actions output file).
 */

import { appendFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { evaluate, type Budget, type Metrics } from './evaluate.js';
import { formatComment } from './format.js';
import { parseLighthouseReport, type LighthouseReport } from './lighthouse.js';
import {
  postOrUpdateComment,
  type HttpClient,
  type PostCommentOptions,
  type PostCommentResult,
} from './github-comment.js';

/** The injected seams {@link run} depends on, so the pipeline stays testable. */
export interface MainDeps {
  /** HTTP client used for the live GitHub call (real `fetch` in production). */
  client: HttpClient;
  /** Read a UTF-8 file by path. */
  readFile: (path: string) => string;
  /** Emit a line of human-readable log output. */
  log: (message: string) => void;
  /** Record an action output (`name=value`). */
  setOutput: (name: string, value: string) => void;
}

/** The outcome of a run: the pass/fail verdict and the comment result, if any. */
export interface MainResult {
  /** Whether every checked metric was within budget. */
  passed: boolean;
  /** Present only when commenting was enabled and a comment was posted. */
  comment?: PostCommentResult;
}

/** Read a required input, failing loudly when it is absent or blank. */
function requireInput(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key];
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required input: ${key}`);
  }
  return value.trim();
}

/** Read and parse a JSON file, attributing any failure to the labelled input. */
function parseJsonFile<T>(
  readFile: (path: string) => string,
  path: string,
  label: string,
): T {
  let raw: string;
  try {
    raw = readFile(path);
  } catch (error) {
    throw new Error(`Cannot read ${label} at "${path}": ${(error as Error).message}`);
  }
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(`Cannot parse ${label} at "${path}": ${(error as Error).message}`);
  }
}

/** Parse a positive-integer PR number, failing loudly on anything else. */
function parsePrNumber(raw: string): number {
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid PR number "${raw}": expected a positive integer.`);
  }
  return value;
}

/** Post (or update) the budget comment, assembling options from the env. */
async function postComment(
  client: HttpClient,
  env: NodeJS.ProcessEnv,
  body: string,
): Promise<PostCommentResult> {
  const token = requireInput(env, 'INPUT_GITHUB_TOKEN');
  const repo = requireInput(env, 'INPUT_REPO');
  const prNumber = parsePrNumber(requireInput(env, 'INPUT_PR_NUMBER'));
  const apiBaseUrl = env['INPUT_API_BASE_URL']?.trim();

  // exactOptionalPropertyTypes: only include apiBaseUrl when actually provided.
  const options: PostCommentOptions = apiBaseUrl
    ? { token, repo, prNumber, body, apiBaseUrl }
    : { token, repo, prNumber, body };

  return postOrUpdateComment(client, options);
}

/**
 * Run the full pipeline: parse report → evaluate → format → comment.
 *
 * @param env  The input environment (`INPUT_*` variables set by the action).
 * @param deps The injected client, file reader, logger, and output sink.
 * @returns The pass/fail verdict and, when commenting was enabled, the result.
 */
export async function run(env: NodeJS.ProcessEnv, deps: MainDeps): Promise<MainResult> {
  const reportPath = requireInput(env, 'INPUT_LIGHTHOUSE_REPORT');
  const budgetPath = requireInput(env, 'INPUT_BUDGET');

  const report = parseJsonFile<LighthouseReport>(deps.readFile, reportPath, 'Lighthouse report');
  const budget = parseJsonFile<Budget>(deps.readFile, budgetPath, 'budget');

  const metrics: Metrics = parseLighthouseReport(report);
  const result = evaluate(metrics, budget);
  const body = formatComment(result, metrics, budget);

  deps.log(body);
  deps.setOutput('passed', String(result.passed));
  deps.setOutput('violations', String(result.violations.length));

  const commentEnabled = (env['INPUT_COMMENT'] ?? 'true').trim() !== 'false';
  if (!commentEnabled) {
    return { passed: result.passed };
  }

  const comment = await postComment(deps.client, env, body);
  deps.setOutput('comment-url', comment.url);
  deps.log(`Comment ${comment.action}: ${comment.url}`);
  return { passed: result.passed, comment };
}

/** Bind the injected seams to the real runtime and run. */
async function main(): Promise<void> {
  const client: HttpClient = async (url, init) => {
    const response = await fetch(url, init);
    return { ok: response.ok, status: response.status, json: () => response.json() };
  };

  const outputPath = process.env['GITHUB_OUTPUT'];
  const deps: MainDeps = {
    client,
    readFile: (path) => readFileSync(path, 'utf8'),
    log: (message) => process.stdout.write(`${message}\n`),
    setOutput: (name, value) => {
      if (outputPath) {
        appendFileSync(outputPath, `${name}=${value}\n`);
      }
    },
  };

  const result = await run(process.env, deps);
  process.exitCode = result.passed ? 0 : 1;
}

// Run only when executed directly (node dist/main.js), not when imported by a
// test. Under vitest, argv[1] is the runner, so this branch stays dormant.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void main().catch((error) => {
    process.stderr.write(`wp-performance-budget-action failed: ${(error as Error).message}\n`);
    process.exitCode = 1;
  });
}
