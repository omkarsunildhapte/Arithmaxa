import { Service, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const AI_MODELS = [
  { id: 'mistralai/mistral-7b-instruct:free',       label: 'Mistral 7B (Free)' },
  { id: 'meta-llama/llama-3.2-3b-instruct:free',    label: 'Llama 3.2 3B (Free)' },
  { id: 'google/gemma-3-4b-it:free',                label: 'Gemma 3 4B (Free)' },
  { id: 'deepseek/deepseek-r1:free',                label: 'DeepSeek R1 (Free)' },
  { id: 'microsoft/phi-3-mini-128k-instruct:free',  label: 'Phi-3 Mini (Free)' },
] as const;

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const HARDCODED_MODEL = 'deepseek/deepseek-r1:free';

const SYSTEM_PROMPT =
  'You are a helpful math assistant inside Arithmaxa, a scientific calculator app. ' +
  'Answer concisely. Use plain-text math notation (e.g. sqrt(x), x^2).';

@Service()
export class AiService {
  private readonly http = inject(HttpClient);

  readonly messages     = signal<ChatMessage[]>([]);
  readonly loading      = signal(false);
  readonly error        = signal<string | null>(null);
  readonly apiKey       = signal<string>(environment.openRouterApiKey);
  readonly selectedModel = signal<string>(HARDCODED_MODEL);

  clearMessages(): void {
    this.messages.set([]);
    this.error.set(null);
  }

  ask(userText: string): void {
    const text = userText.trim();
    if (!text) return;

    this.messages.update(m => [...m, { role: 'user', content: text }]);
    this.error.set(null);
    this.loading.set(true);

    this.http.post<any>(OPENROUTER_URL, {
      model: this.selectedModel(),
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...this.messages()]
    }, {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${this.apiKey()}`,
        'HTTP-Referer':  'https://arithmaxa.app',
        'X-Title':       'Arithmaxa Calculator'
      })
    }).pipe(
      map(res => res.choices[0].message.content as string),
      catchError(err => {
        const msg = err.error?.error?.message ?? err.message ?? 'Request failed check your API key.';
        return of(`\0${msg}`);
      })
    ).subscribe(content => {
      this.loading.set(false);
      if (content.startsWith('\0')) {
        this.error.set(content.slice(1));
        this.messages.update(m => m.slice(0, -1));
      } else {
        this.messages.update(m => [...m, { role: 'assistant', content }]);
      }
    });
  }
}
