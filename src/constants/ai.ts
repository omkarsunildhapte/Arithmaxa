// The app no longer talks to OpenRouter directly, or picks a model —
// arithmaxa-backend owns both now (see its src/services/openrouter.ts and
// OPENROUTER_MODEL env var). This is just the path on that backend;
// environment.backendUrl (see src/environments) supplies the host.
export const AI_CHAT_PATH = '/ai/chat';

// Used only for the on-device path — arithmaxa-backend's own openrouter.ts
// prepends its own system prompt server-side for the cloud path, so sending
// one from here too would just duplicate it.
/**
 * Scope guard for the on-device model. Must stay in sync with the copy in
 * arithmaxa-website's worker/routes/ai-chat.ts — that path handles most
 * requests (local is preferred whenever the device supports it), so guarding
 * only the cloud relay would leave the common case wide open.
 *
 * The old prompt merely called the assistant a math helper, which is not an
 * instruction to refuse anything: asked for code, it wrote code.
 */
export const AI_SYSTEM_PROMPT = `You are Arithmaxa's assistant, built into a scientific calculator app. You answer ONLY mathematics and science questions.

In scope: arithmetic, algebra, geometry, trigonometry, calculus, statistics and probability, unit and currency conversion, physics, chemistry, biology, and earth or space science — including the formulas and reasoning behind them.

Out of scope: everything else. That includes programming and code of any kind, general knowledge, history, current events, medical, legal or financial advice, opinions, creative writing, translation, and questions about yourself or how you work.

If a request is out of scope, do not answer it even partially and do not write code. Reply with exactly this one sentence and nothing else: "I can only help with maths and science questions." If a request mixes topics, answer only the maths or science part and ignore the rest.

Answer concisely, show the working when it aids understanding, and use plain-text maths notation (e.g. sqrt(x), x^2).`;

/**
 * Keeps every ask() call in one on-device conversation, so LocalLLM.prompt()
 * retains context the same way the cloud path does via the full messages
 * array. Ended/restarted whenever the on-device path is torn down.
 */
export const AI_LOCAL_SESSION_ID = 'arithmaxa-ai-chat';

/**
 * Marks a value flowing down the askCloud() stream as an error rather than an
 * answer. catchError has to emit *something* on the same channel as a real
 * reply, and a NUL prefix can't collide with model output. Read back with
 * `startsWith`/`slice(AI_ERROR_SENTINEL.length)`, never a bare `1`.
 */
export const AI_ERROR_SENTINEL = '\0';

/** Shown instead of letting a request hang when the device is offline. */
export const AI_OFFLINE_ERROR = "You're offline. Check your connection and try again.";

/** Fallback when the backend returns neither an error body nor an HTTP message. */
export const AI_REQUEST_FAILED_ERROR = 'Request failed. Please try again.';

/** Fallback when LocalLLM.prompt() rejects with a non-Error value. */
export const AI_LOCAL_FAILED_ERROR = 'The on-device model failed to respond.';
