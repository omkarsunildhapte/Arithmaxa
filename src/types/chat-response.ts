/** Shape of a successful response body from arithmaxa-backend's
 *  POST /ai/chat — see arithmaxa-backend/src/types/index.ts's
 *  ChatResponse, which this mirrors from the client side. */
export interface ChatResponse {
  content: string;
}

/** Shape of an error response body from arithmaxa-backend — every 4xx/5xx
 *  it returns uses this same one-field shape. */
export interface ChatErrorResponse {
  error: string;
}
