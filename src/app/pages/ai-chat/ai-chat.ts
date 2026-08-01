import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonFooter, IonButtons, IonButton, IonBackButton, IonIcon, IonSpinner, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, sendOutline, sparklesOutline, trashOutline, chevronBackOutline, micOutline, micOffOutline } from 'ionicons/icons';
import { AiService } from '../../../services/ai/ai.service';
import { CalculatorService } from '../../../services/calculator/calculator.service';
import { NavigationService } from '../../../services/navigation/navigation.service';

addIcons({ closeOutline, sendOutline, sparklesOutline, trashOutline, chevronBackOutline, micOutline, micOffOutline });

@Component({
  selector: 'app-ai-chat-page',
  standalone: true,
  imports: [
    FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonFooter, IonButtons, IonButton, IonBackButton, IonIcon, IonSpinner
  ],
  templateUrl: './ai-chat.html',
  styleUrls: ['./ai-chat.css']
})
export class AiChatPage implements OnInit, AfterViewChecked {
  protected readonly ai   = inject(AiService);
  protected readonly calc = inject(CalculatorService);
  private readonly navCtrl = inject(NavController);

  protected prompt = '';
  protected isRecording = signal(false);
  private recognition: any;

  @ViewChild('messagesEl') private messagesEl!: ElementRef<HTMLDivElement>;
  private lastCount = 0;

  ngOnInit(): void {
    this.initSpeech();
  }

  private initSpeech(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.prompt += (this.prompt ? ' ' : '') + transcript;
      this.isRecording.set(false);
    };

    this.recognition.onerror = () => this.isRecording.set(false);
    this.recognition.onend   = () => this.isRecording.set(false);
  }

  protected toggleMic(): void {
    if (!this.recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }
    if (this.isRecording()) {
      this.recognition.stop();
    } else {
      this.isRecording.set(true);
      this.recognition.start();
    }
  }

  ngAfterViewChecked(): void {
    const count = this.ai.messages().length + (this.ai.loading() ? 1 : 0);
    if (count !== this.lastCount) {
      this.lastCount = count;
      const el = this.messagesEl?.nativeElement;
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
    if (!text || this.ai.loading()) return;
    this.prompt = '';
    this.ai.ask(text);
  }
}
