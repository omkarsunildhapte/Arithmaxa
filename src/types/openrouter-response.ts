/** Shape of an OpenRouter `/chat/completions` success response body. */
export interface OpenRouterResponse {
  choices: { message: { content: string } }[];
}

/** Shape of an OpenRouter error response body. */
export interface OpenRouterErrorResponse {
  error?: { message?: string };
}
