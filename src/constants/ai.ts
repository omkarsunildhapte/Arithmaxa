export const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const OPENROUTER_REFERER = 'https://arithmaxa.app';

export const AI_MODELS = [
  { id: 'mistralai/mistral-7b-instruct:free', label: 'Mistral 7B (Free)' },
  { id: 'meta-llama/llama-3.2-3b-instruct:free', label: 'Llama 3.2 3B (Free)' },
  { id: 'google/gemma-3-4b-it:free', label: 'Gemma 3 4B (Free)' },
  { id: 'deepseek/deepseek-r1:free', label: 'DeepSeek R1 (Free)' },
  { id: 'microsoft/phi-3-mini-128k-instruct:free', label: 'Phi-3 Mini (Free)' },
] as const;
