import { Component, inject, signal } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, starOutline, closeOutline, paperPlaneOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { FeedbackService, FeedbackCategory } from '../../../services/feedback/feedback.service';

interface CategoryOption {
  value: FeedbackCategory;
  label: string;
  emoji: string;
}

@Component({
  selector: 'app-feedback-modal',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonContent, IonIcon],
  templateUrl: './feedback-modal.html',
  styleUrls: ['./feedback-modal.css']
})
export class FeedbackModal {
  private feedbackService = inject(FeedbackService);
  private modalCtrl = inject(ModalController);

  readonly rating = signal(0);
  readonly hoveredStar = signal(0);
  readonly category = signal<FeedbackCategory>('general');
  readonly message = signal('');
  readonly submitted = signal(false);
  readonly isSubmitting = signal(false);

  readonly categories: CategoryOption[] = [
    { value: 'general', label: 'General', emoji: '💬' },
    { value: 'bug', label: 'Bug Report', emoji: '🐛' },
    { value: 'feature', label: 'Feature Request', emoji: '✨' },
    { value: 'design', label: 'Design', emoji: '🎨' },
    { value: 'performance', label: 'Performance', emoji: '⚡' },
  ];

  readonly stars = [1, 2, 3, 4, 5];

  constructor() {
    addIcons({ star, starOutline, closeOutline, paperPlaneOutline, checkmarkCircleOutline });
  }

  setRating(r: number): void { this.rating.set(r); }
  setHover(r: number): void { this.hoveredStar.set(r); }
  clearHover(): void { this.hoveredStar.set(0); }
  setCategory(c: FeedbackCategory): void { this.category.set(c); }

  setMessage(val: string): void {
    this.message.set(val);
  }

  isStarFilled(i: number): boolean {
    return i <= (this.hoveredStar() || this.rating());
  }

  canSubmit(): boolean {
    return this.rating() > 0 && this.message().trim().length >= 5;
  }

  submit(): void {
    if (!this.canSubmit()) return;
    this.isSubmitting.set(true);
    this.feedbackService.submit(this.rating(), this.category(), this.message());
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submitted.set(true);
      setTimeout(() => this.close(), 2200);
    }, 600);
  }

  close(): void {
    this.modalCtrl.dismiss();
  }
}
