export const environment = {
  production: true,
  // AI Chat's cloud path. The separate Express backend on Render is gone —
  // /ai/chat now lives in arithmaxa-website's Cloudflare Worker
  // (worker/routes/ai-chat.ts), which holds OPENROUTER_API_KEY as a Worker
  // secret. The app still ships no AI provider key of its own.
  backendUrl: 'https://arithmaxa.vernokasoftwaretechnology.com',
};
