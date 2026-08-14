import { Service, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChatMessage, OpenRouterErrorResponse, OpenRouterResponse } from '@appTypes/index';
import { AI_MODELS, OPENROUTER_URL, OPENROUTER_REFERER } from '@constants/index';
import { NetworkService } from '@services/network/network.service';
import { LocalLLM, type LLMAvailability } from '@capacitor/local-llm';

const HARDCODED_MODEL = 'deepseek/deepseek-r1:free';

const SYSTEM_PROMPT = 'You are a helpful math assistant inside Arithmaxa, a scientific calculator app. ' + 'Answer concisely. Use plain-text math notation (e.g. sqrt(x), x^2).';

// Keeps every ask() call in one on-device conversation, so LocalLLM.prompt()
// retains context the same way the cloud path does via the full messages
// array. Ended/restarted whenever the on-device path is torn down.
const LOCAL_SESSION_ID = 'arithmaxa-ai-chat';

@Service()
export class AiService {
  private readonly http = inject(HttpClient);
  private readonly network = inject(NetworkService);

  readonly messages = signal<ChatMessage[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly apiKey = signal<string>(environment.openRouterApiKey);
  readonly selectedModel = signal<string>(HARDCODED_MODEL);

  /** Populated by checkLocalAvailability() — see LocalLLM.systemAvailability(). */
  readonly localAvailable = signal<LLMAvailability>('unavailable');
  /** Whether ask() should route to the on-device model instead of OpenRouter.
   *  Defaults on — the free/local model is the primary path whenever the
   *  device actually supports it (see localAvailable()); OpenRouter is the
   *  fallback for unsupported devices and for photos with no readable text
   *  (see the imageDataUrl/text check in ask() below), not the default. */
  readonly useLocal = signal(true);

  clearMessages(): void {
    this.messages.set([]);
    this.error.set(null);
  }

  /** Checks whether an on-device LLM (Apple Intelligence / Gemini Nano) is
   *  usable on this device. Call once, e.g. from the chat page's ngOnInit. */
  async checkLocalAvailability(): Promise<void> {
    try {
      const { status } = await LocalLLM.systemAvailability();
      this.localAvailable.set(status);
    } catch {
      this.localAvailable.set('unavailable');
    }
  }

  /** Triggers the on-device model download (Android/Gemini Nano only — the
   *  model isn't bundled with the app) and refreshes localAvailable(). */
  async downloadLocalModel(): Promise<void> {
    try {
      await LocalLLM.download();
    } catch {
      // Fall through to the re-check below regardless — if the download
      // genuinely failed, the status will still read as downloadable/
      // unavailable rather than available.
    }
    await this.checkLocalAvailability();
  }

  ask(userText: string, imageDataUrl?: string): void {
    const text = userText.trim();
    if (!text && !imageDataUrl) return;

    const userMessage: ChatMessage = imageDataUrl ? { role: 'user', content: text, imageUrl: imageDataUrl } : { role: 'user', content: text };
    this.messages.update((m) => [...m, userMessage]);
    this.error.set(null);
    this.loading.set(true);

    // The on-device model only accepts text (no vision input) — but a photo
    // usually arrives with OCR'd text already merged into `text` by the
    // caller (see AiChatPage.attachPhoto()/send()), so it's only a photo
    // with *no* readable text at all that actually needs the cloud's vision
    // model. Everything else (typed, spoken, or OCR'd text) can go local.
    if ((!imageDataUrl || text) && this.useLocal() && this.localAvailable() === 'available') {
      void this.askLocal(text);
      return;
    }

    if (!this.network.connected()) {
      // Fail fast with a clear message instead of letting the request hang
      // and time out — NetworkService.connected() is kept live by App's
      // networkStatusChange listener.
      this.loading.set(false);
      this.error.set("You're offline. Check your connection and try again.");
      this.messages.update((m) => m.slice(0, -1));
      return;
    }

    this.askCloud();
  }

  private askCloud(): void {
    this.http
      .post<OpenRouterResponse>(
        OPENROUTER_URL,
        {
          model: this.selectedModel(),
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...this.messages().map((m) => ({
              role: m.role,
              content: m.imageUrl
                ? [
                    { type: 'text', text: m.content },
                    { type: 'image_url', image_url: { url: m.imageUrl } },
                  ]
                : m.content,
            })),
          ],
        },
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey()}`,
            'HTTP-Referer': OPENROUTER_REFERER,
            'X-Title': 'Arithmaxa Calculator',
          }),
        },
      )
      .pipe(
        map((res) => res.choices[0].message.content),
        catchError((err: HttpErrorResponse) => {
          const body = err.error as OpenRouterErrorResponse | null;
          const msg = body?.error?.message ?? err.message ?? 'Request failed check your API key.';
          return of(`\0${msg}`);
        }),
      )
      .subscribe((content) => {
        this.loading.set(false);
        if (content.startsWith('\0')) {
          this.error.set(content.slice(1));
          this.messages.update((m) => m.slice(0, -1));
        } else {
          this.messages.update((m) => [...m, { role: 'assistant', content }]);
        }
      });
  }

  private async askLocal(text: string): Promise<void> {
    try {
      const { text: reply } = await LocalLLM.prompt({
        sessionId: LOCAL_SESSION_ID,
        instructions: SYSTEM_PROMPT,
        prompt: text,
      });
      this.loading.set(false);
      this.messages.update((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (err) {
      this.loading.set(false);
      const msg = err instanceof Error ? err.message : 'The on-device model failed to respond.';
      this.error.set(msg);
      this.messages.update((m) => m.slice(0, -1));
    }
  }
}
