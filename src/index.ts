/**
 * Public package entry: the pure, network-free building blocks of the action.
 */

export {
  evaluate,
  summarize,
  type Budget,
  type Metrics,
  type Violation,
  type EvaluationResult,
} from './evaluate.js';
export { formatComment } from './format.js';
export { parseLighthouseReport, type LighthouseReport } from './lighthouse.js';
export {
  postOrUpdateComment,
  COMMENT_MARKER,
  type HttpClient,
  type HttpResponse,
  type HttpRequestInit,
  type PostCommentOptions,
  type PostCommentResult,
} from './github-comment.js';
