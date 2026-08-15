// The app no longer talks to OpenRouter directly, or picks a model —
// arithmaxa-backend owns both now (see its src/services/openrouter.ts and
// OPENROUTER_MODEL env var). This is just the path on that backend;
// environment.backendUrl (see src/environments) supplies the host.
export const AI_CHAT_PATH = '/ai/chat';
