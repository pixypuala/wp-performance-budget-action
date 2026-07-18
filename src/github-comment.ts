/**
 * PR-comment poster.
 *
 * Create — or update in place — the single performance-budget comment on a pull
 * request. The HTTP client is injected, so the whole create-vs-update decision
 * and request shape are unit-tested with a mock: no real network, no live
 * token. Rendering the Markdown body is `formatComment`'s job; producing a real
 * token and reaching github.com is the still-deferred, environment-dependent
 * part.
 *
 * Idempotency: the poster tags its comment with a hidden {@link COMMENT_MARKER}
 * and, on the next run, finds that tagged comment and edits it rather than
 * stacking a new one every build.
 */

/** Minimal response contract the injected client must satisfy. */
export interface HttpResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

/** Minimal request shape the poster sends to the injected client. */
export interface HttpRequestInit {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

/** An injected HTTP client (a subset of the global `fetch` contract). */
export type HttpClient = (url: string, init: HttpRequestInit) => Promise<HttpResponse>;

export interface PostCommentOptions {
  /** A token authorized to write issue comments on the repository. */
  token: string;
  /** Repository in `owner/name` form. */
  repo: string;
  /** The pull-request (issue) number to comment on. */
  prNumber: number;
  /** The Markdown body to post (typically from `formatComment`). */
  body: string;
  /** API root; defaults to public github.com, overridable for Enterprise. */
  apiBaseUrl?: string;
}

export interface PostCommentResult {
  /** Whether an existing comment was edited or a new one created. */
  action: 'created' | 'updated';
  /** The GitHub comment id that now holds the body. */
  commentId: number;
  /** The comment's HTML URL. */
  url: string;
}

/** Hidden HTML marker that identifies this action's managed comment. */
export const COMMENT_MARKER = '<!-- wp-performance-budget-action -->';

const DEFAULT_API_BASE_URL = 'https://api.github.com';

/** The comment fields the poster reads back from the GitHub API. */
interface GitHubComment {
  id: number;
  body: string;
  html_url: string;
}

function isGitHubComment(value: unknown): value is GitHubComment {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record['id'] === 'number' &&
    typeof record['body'] === 'string' &&
    typeof record['html_url'] === 'string'
  );
}

function splitRepo(repo: string): { owner: string; name: string } {
  const [owner, name, ...rest] = repo.split('/');
  if (!owner || !name || rest.length > 0) {
    throw new Error(`Invalid repo "${repo}": expected "owner/name".`);
  }
  return { owner, name };
}

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'wp-performance-budget-action',
  };
}

async function readJson(response: HttpResponse, context: string): Promise<unknown> {
  if (!response.ok) {
    throw new Error(`GitHub API ${context} failed with status ${response.status}.`);
  }
  return response.json();
}

/**
 * Post the performance-budget comment, or update the existing one in place.
 *
 * @param client  The injected HTTP client used for every request.
 * @param options Token, repo, PR number, and Markdown body.
 * @returns Whether a comment was created or updated, plus its id and URL.
 */
export async function postOrUpdateComment(
  client: HttpClient,
  options: PostCommentOptions,
): Promise<PostCommentResult> {
  const { owner, name } = splitRepo(options.repo);
  const baseUrl = options.apiBaseUrl ?? DEFAULT_API_BASE_URL;
  const headers = { ...authHeaders(options.token), 'Content-Type': 'application/json' };

  const body = options.body.includes(COMMENT_MARKER)
    ? options.body
    : `${COMMENT_MARKER}\n${options.body}`;

  const listUrl = `${baseUrl}/repos/${owner}/${name}/issues/${options.prNumber}/comments?per_page=100`;
  const listed = await readJson(await client(listUrl, { method: 'GET', headers }), 'list comments');
  const existing = Array.isArray(listed)
    ? listed.find(
        (comment): comment is GitHubComment =>
          isGitHubComment(comment) && comment.body.includes(COMMENT_MARKER),
      )
    : undefined;

  if (existing) {
    const patchUrl = `${baseUrl}/repos/${owner}/${name}/issues/comments/${existing.id}`;
    const updated = await readJson(
      await client(patchUrl, { method: 'PATCH', headers, body: JSON.stringify({ body }) }),
      'update comment',
    );
    if (!isGitHubComment(updated)) {
      throw new Error('GitHub API update comment returned an unexpected shape.');
    }
    return { action: 'updated', commentId: updated.id, url: updated.html_url };
  }

  const postUrl = `${baseUrl}/repos/${owner}/${name}/issues/${options.prNumber}/comments`;
  const created = await readJson(
    await client(postUrl, { method: 'POST', headers, body: JSON.stringify({ body }) }),
    'create comment',
  );
  if (!isGitHubComment(created)) {
    throw new Error('GitHub API create comment returned an unexpected shape.');
  }
  return { action: 'created', commentId: created.id, url: created.html_url };
}
