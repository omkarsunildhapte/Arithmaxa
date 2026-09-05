import { CategoryOption } from '@appTypes/index';

/**
 * arithmaxa-website's feedback relay, now a Cloudflare Worker route that
 * emails submissions through Resend — see worker/routes/feedback.ts in that
 * repo. Previously a Vercel serverless function on vernoka-sand.vercel.app;
 * repointed here so the app depends on one origin, the same one serving
 * /ai/chat.
 */
export const FEEDBACK_URL = 'https://arithmaxa.vernokasoftwaretechnology.com/api/feedback';

/**
 * The category picker in FeedbackModal.
 *
 * `value` is not free text — the receiving Worker validates it against its
 * own CATEGORIES list (arithmaxa-website, worker/routes/feedback.ts) and
 * rejects anything else with 400 "Invalid feedback category". Adding or
 * renaming an entry here therefore needs the matching change deployed there
 * first, or the new option fails for every user on the current build. The
 * FeedbackCategory union in @appTypes keeps the two in step on this side.
 *
 * Labels mirror that Worker's CATEGORY_LABELS so the email subject line
 * matches what the user picked.
 */
export const FEEDBACK_CATEGORIES: CategoryOption[] = [
  { value: 'general', label: 'General', emoji: '💬' },
  { value: 'bug', label: 'Bug Report', emoji: '🐛' },
  { value: 'feature', label: 'Feature Request', emoji: '✨' },
  { value: 'design', label: 'Design', emoji: '🎨' },
  { value: 'performance', label: 'Performance', emoji: '⚡' },
];

/** Star ratings offered, low to high. The Worker rejects anything outside 1-5. */
export const FEEDBACK_STARS: number[] = [1, 2, 3, 4, 5];
