import { Service, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { environment } from '@environments/environment';
import { ChatErrorResponse, ChatMessage, ChatResponse } from '@appTypes/index';
import { AI_CHAT_PATH, AI_ERROR_SENTINEL, AI_LOCAL_FAILED_ERROR, AI_LOCAL_SESSION_ID, AI_OFFLINE_ERROR, AI_REQUEST_FAILED_ERROR, AI_SYSTEM_PROMPT } from '@constants/index';
import { NetworkService } from '@services/network/network.service';
import { LocalLLM, type LLMAvailability } from '@capacitor/local-llm';

@Service()
export class AiService {
  private readonly http = inject(HttpClient);
  private readonly network = inject(NetworkService);

  readonly messages = signal<ChatMessage[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /** Populated by checkLocalAvailability() — see LocalLLM.systemAvailability(). */
  readonly localAvailable = signal<LLMAvailability>('unavailable');
  /** Whether ask() should route to the on-device model instead of the
   *  cloud (arithmaxa-backend, which itself proxies to OpenRouter).
   *  Defaults on — the free/local model is the primary path whenever the
   *  device actually supports it (see localAvailable()); the cloud path is
   *  the fallback for unsupported devices and for photos with no readable
   *  text (see the imageDataUrl/text check in ask() below), not the default. */
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
      this.error.set(AI_OFFLINE_ERROR);
      this.messages.update((m) => m.slice(0, -1));
      return;
    }

    this.askCloud();
  }

  private askCloud(): void {
    // No Authorization header, no API key anywhere in this app — the real
    // OpenRouter key lives only in arithmaxa-backend's own environment now
    // (see its src/services/openrouter.ts). This just forwards the
    // conversation; the backend prepends its own system prompt and picks
    // the model server-side.
    this.http
      .post<ChatResponse>(`${environment.backendUrl}${AI_CHAT_PATH}`, {
        messages: this.messages().map((m) => ({
          role: m.role,
          content: m.imageUrl
            ? [
                { type: 'text', text: m.content },
                { type: 'image_url', image_url: { url: m.imageUrl } },
              ]
            : m.content,
        })),
      })
      .pipe(
        map((res) => res.content),
        catchError((err: HttpErrorResponse) => {
          const body = err.error as ChatErrorResponse | null;
          const msg = body?.error ?? err.message ?? AI_REQUEST_FAILED_ERROR;
          return of(`${AI_ERROR_SENTINEL}${msg}`);
        }),
      )
      .subscribe((content) => {
        this.loading.set(false);
        if (content.startsWith(AI_ERROR_SENTINEL)) {
          this.error.set(content.slice(AI_ERROR_SENTINEL.length));
          this.messages.update((m) => m.slice(0, -1));
        } else {
          this.messages.update((m) => [...m, { role: 'assistant', content }]);
        }
      });
  }

  private async askLocal(text: string): Promise<void> {
    try {
      const { text: reply } = await LocalLLM.prompt({
        sessionId: AI_LOCAL_SESSION_ID,
        instructions: AI_SYSTEM_PROMPT,
        prompt: text,
      });
      this.loading.set(false);
      this.messages.update((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (err) {
      this.loading.set(false);
      const msg = err instanceof Error ? err.message : AI_LOCAL_FAILED_ERROR;
      this.error.set(msg);
      this.messages.update((m) => m.slice(0, -1));
    }
  }
}
