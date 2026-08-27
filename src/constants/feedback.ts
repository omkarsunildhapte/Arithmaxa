/**
 * arithmaxa-website's feedback relay, now a Cloudflare Worker route that
 * emails submissions through Resend — see worker/routes/feedback.ts in that
 * repo. Previously a Vercel serverless function on vernoka-sand.vercel.app;
 * repointed here so the app depends on one origin, the same one serving
 * /ai/chat.
 */
export const FEEDBACK_URL = 'https://arithmaxa.vernokasoftwaretechnology.com/api/feedback';
