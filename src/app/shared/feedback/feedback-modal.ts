import { Component, inject, signal } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, IonIcon, IonButton, IonTextarea, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, starOutline, closeOutline, paperPlaneOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { FEEDBACK_CATEGORIES, FEEDBACK_STARS } from '@constants/index';
import { FeedbackService } from '@services/feedback/feedback.service';
import { FeedbackCategory } from '@appTypes/index';
addIcons({ star, starOutline, closeOutline, paperPlaneOutline, checkmarkCircleOutline });

@Component({
  selector: 'app-feedback-modal',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonContent, IonIcon, IonButton, IonTextarea],
  templateUrl: './feedback-modal.html',
  styleUrls: ['./feedback-modal.css'],
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
  readonly submitError = signal(false);
  readonly categories = FEEDBACK_CATEGORIES;
  readonly stars = FEEDBACK_STARS;

  setRating(r: number): void {
    this.rating.set(r);
  }
  setHover(r: number): void {
    this.hoveredStar.set(r);
  }
  clearHover(): void {
    this.hoveredStar.set(0);
  }
  setCategory(c: FeedbackCategory): void {
    this.category.set(c);
  }

  setMessage(val: string): void {
    this.message.set(val);
  }

  onMessageInput(event: Event): void {
    const custom = event as CustomEvent<{ value?: string | null }>;
    this.setMessage(custom.detail?.value ?? '');
  }

  isStarFilled(i: number): boolean {
    return i <= (this.hoveredStar() || this.rating());
  }

  canSubmit(): boolean {
    return this.rating() > 0 && this.message().trim().length >= 5;
  }

  async submit(): Promise<void> {
    if (!this.canSubmit() || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.submitError.set(false);

    const ok = await this.feedbackService.submit(this.rating(), this.category(), this.message());

    this.isSubmitting.set(false);
    if (ok) {
      this.submitted.set(true);
      setTimeout(() => this.close(), 2200);
    } else {
      // Leave the form filled in so the user can just tap Submit again.
      this.submitError.set(true);
    }
  }

  close(): void {
    this.modalCtrl.dismiss();
  }
}
