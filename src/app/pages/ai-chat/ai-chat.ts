import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonSpinner, IonTextarea, IonTitle, IonToolbar, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cameraOutline,
  checkmarkOutline,
  chevronBackOutline,
  closeOutline,
  copyOutline,
  hardwareChipOutline,
  micOffOutline,
  micOutline,
  sendOutline,
  sparklesOutline,
  trashOutline,
} from 'ionicons/icons';
import { AiService } from '@services/ai/ai.service';
import { CalculatorService } from '@services/calculator/calculator.service';
import { SpeechRecognition } from '@capgo/capacitor-speech-recognition';
import { Camera, CameraDirection, EncodingType } from '@capacitor/camera';
import { Keyboard } from '@capacitor/keyboard';
import { Clipboard } from '@capacitor/clipboard';
import { TextRecognition } from '@capacitor-mlkit/text-recognition';
import type { PluginListenerHandle } from '@capacitor/core';

addIcons({ closeOutline, sendOutline, sparklesOutline, trashOutline, chevronBackOutline, micOutline, micOffOutline, cameraOutline, hardwareChipOutline, copyOutline, checkmarkOutline });

@Component({
  selector: 'app-ai-chat-page',
  standalone: true,
  imports: [FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonFooter, IonButtons, IonButton, IonBackButton, IonIcon, IonSpinner, IonTextarea],
  templateUrl: './ai-chat.html',
  styleUrls: ['./ai-chat.css'],
})
export class AiChatPage implements OnInit, OnDestroy, AfterViewChecked {
  protected readonly ai = inject(AiService);
  protected readonly calc = inject(CalculatorService);
  private readonly navCtrl = inject(NavController);
  protected prompt: string = '';
  protected isRecording = signal(false);
  /** Set from `SpeechRecognition.available()` in ngOnInit — lets the mic
   *  button disable itself upfront instead of only failing on tap. */
  protected micAvailable = signal(true);
  /** Data URI of a photo taken via attachPhoto(), pending send(). */
  protected attachedPhoto = signal<string | null>(null);
  /** True while on-device OCR is reading text out of a just-taken photo. */
  protected recognizingText = signal(false);
  /** Index of the message whose copy button most recently succeeded, for a
   *  brief checkmark confirmation — cleared automatically after 1.5s. */
  protected copiedIndex = signal<number | null>(null);
  private readonly messagesEl = viewChild<ElementRef<HTMLDivElement>>('messagesEl');
  private lastCount: number = 0;
  private keyboardListeners: PluginListenerHandle[] = [];

  async ngOnInit(): Promise<void> {
    try {
      const { available } = await SpeechRecognition.available();
      this.micAvailable.set(available);
    } catch {
      this.micAvailable.set(false);
    }

    void this.ai.checkLocalAvailability();

    // The keyboard opening shrinks the viewport without changing the
    // message count, so ngAfterViewChecked's count-based auto-scroll below
    // never fires for it on its own — re-scroll to bottom explicitly here.
    try {
      this.keyboardListeners = [
        await Keyboard.addListener('keyboardDidShow', () => {
          const el = this.messagesEl()?.nativeElement;
          if (el) el.scrollTop = el.scrollHeight;
        }),
      ];
    } catch {
      // Keyboard plugin unavailable (e.g. plain web) — no-op, nothing to scroll for.
    }
  }

  ngOnDestroy(): void {
    this.keyboardListeners.forEach((l) => void l.remove());
  }

  /** Snaps a photo (e.g. of a math problem) to attach to the next message.
   *  Also runs on-device OCR (free, no OpenRouter) and appends whatever
   *  text it finds into the prompt — same "append, don't overwrite"
   *  behavior as toggleMic()'s transcript, so a typed prompt and OCR'd text
   *  can combine. If OCR finds nothing (unavailable, or the photo genuinely
   *  has no readable text — a diagram, say), the prompt is left as-is and
   *  AiService.ask() falls back to sending the raw photo to the cloud
   *  vision model instead of the free local one. */
  protected async attachPhoto(): Promise<void> {
    try {
      const photo = await Camera.takePhoto({
        quality: 70,
        encodingType: EncodingType.JPEG,
        cameraDirection: CameraDirection.Rear,
        saveToGallery: false,
      });
      if (photo.thumbnail) {
        this.attachedPhoto.set(`data:image/jpeg;base64,${photo.thumbnail}`);
      }
      if (photo.uri) {
        this.recognizingText.set(true);
        try {
          const { text } = await TextRecognition.processImage({ path: photo.uri });
          const recognized = text.trim();
          if (recognized) {
            this.prompt += (this.prompt ? ' ' : '') + recognized;
          }
        } catch {
          // OCR plugin unavailable/failed on this device — nothing to append.
        } finally {
          this.recognizingText.set(false);
        }
      }
    } catch {
      // User cancelled the capture or denied camera permission — nothing to attach.
    }
  }

  protected clearAttachedPhoto(): void {
    this.attachedPhoto.set(null);
  }

  /** Copies a message's text to the clipboard and briefly swaps its icon
   *  to a checkmark for feedback. */
  protected async copyMessage(index: number, content: string): Promise<void> {
    try {
      await Clipboard.write({ string: content });
      this.copiedIndex.set(index);
      setTimeout(() => {
        if (this.copiedIndex() === index) this.copiedIndex.set(null);
      }, 1500);
    } catch {
      // Clipboard plugin unavailable — nothing to confirm.
    }
  }

  /** Toggles between on-device and cloud AI processing, downloading the
   *  on-device model first if it's present but not yet fetched. */
  protected async toggleLocalLlm(): Promise<void> {
    if (this.ai.localAvailable() === 'downloadable') {
      await this.ai.downloadLocalModel();
      return;
    }
    this.ai.useLocal.update((v) => !v);
  }

  protected async toggleMic(): Promise<void> {
    if (this.isRecording()) {
      await SpeechRecognition.stop();
      this.isRecording.set(false);
      return;
    }

    if (!this.micAvailable()) {
      alert('Speech recognition is not available on this device.');
      return;
    }

    const status = await SpeechRecognition.checkPermissions();
    if (status.speechRecognition !== 'granted') {
      const requested = await SpeechRecognition.requestPermissions();
      if (requested.speechRecognition !== 'granted') {
        alert('Microphone permission is required for voice input.');
        return;
      }
    }

    this.isRecording.set(true);
    try {
      // partialResults defaults to false — the promise itself resolves with
      // the final transcript once the user stops talking, matching the
      // one-shot (non-continuous, non-interim) behavior this replaced.
      const { matches } = await SpeechRecognition.start({ language: 'en-US' });
      const transcript = matches?.[0];
      if (transcript) {
        this.prompt += (this.prompt ? ' ' : '') + transcript;
      }
    } catch {
      // User cancelled, no match, or a recognizer error — nothing to
      // append; just fall through to clear the recording indicator below.
    } finally {
      this.isRecording.set(false);
    }
  }

  ngAfterViewChecked(): void {
    const count = this.ai.messages().length + (this.ai.loading() ? 1 : 0);
    if (count !== this.lastCount) {
      this.lastCount = count;
      const el = this.messagesEl()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }

  protected goBack(): void {
    this.navCtrl.navigateBack(['/calculator']);
  }

  protected useExpression(): void {
    const expr = this.calc.display();
    if (!expr || expr === 'Error') return;
    this.prompt = `Explain or solve: ${expr}`;
  }

  protected onEnter(event: Event): void {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey) {
      ke.preventDefault();
      this.send();
    }
  }

  protected send(): void {
    const text = this.prompt.trim();
    const photo = this.attachedPhoto();
    if ((!text && !photo) || this.ai.loading()) return;
    this.prompt = '';
    this.attachedPhoto.set(null);
    if (photo) {
      this.ai.ask(text, photo);
    } else {
      this.ai.ask(text);
    }
  }
}
