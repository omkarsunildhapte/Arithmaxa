export type FeedbackCategory = 'general' | 'bug' | 'feature' | 'design' | 'performance';

/**
 * JSON envelope returned by the feedback relay
 * (arithmaxa-website, worker/routes/feedback.ts). `ok` is the only field the
 * app acts on; `error` carries the server's message for the failure cases —
 * validation rejections (rating out of 1-5, unknown category, message length)
 * and the 500 when the mail provider isn't configured.
 *
 * Shared shape with the contact endpoint in that Worker, so a change to the
 * envelope there breaks both callers.
 */
export interface FeedbackResponse {
  ok: boolean;
  error?: string;
}
