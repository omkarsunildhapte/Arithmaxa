import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { IonContent, IonIcon, IonButton, IonFooter, NavController, ModalController } from '@ionic/angular/standalone';
import { ONBOARDING_SLIDES, PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@constants/index';
import { addIcons } from 'ionicons';
import { chevronForwardOutline } from 'ionicons/icons';
import { FeedbackModal } from '../../shared/feedback/feedback-modal';
import { OnboardingService } from '@services/onboarding/onboarding.service';
addIcons({ chevronForwardOutline });

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonContent, IonIcon, IonButton, IonFooter],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements AfterViewInit {
  private navCtrl = inject(NavController);
  private modalCtrl = inject(ModalController);
  private onboarding = inject(OnboardingService);
  private readonly swiperEl = viewChild.required<ElementRef>('swiperEl');

  // Opened in the system browser (target="_blank") rather than routed to:
  // both documents are hosted on arithmaxa-website, not bundled in the app.
  readonly privacyPolicyUrl = PRIVACY_POLICY_URL;
  readonly termsOfServiceUrl = TERMS_OF_SERVICE_URL;

  readonly slides = ONBOARDING_SLIDES;

  /** Index of the visible slide, kept in sync by (swiperslidechange). */
  readonly activeIndex = signal(0);

  /** Drives the footer button: "Next" on every slide but the last, which
   *  turns it into the "Explore Now" call to action. */
  readonly isLastSlide = computed(() => this.activeIndex() === this.slides.length - 1);

  ngAfterViewInit(): void {
    const el = this.swiperEl().nativeElement;

    Object.assign(el, {
      injectStyles: [
        `
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.4) !important;
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background: #22ecf3 !important;
          opacity: 1;
          width: 20px !important;
          border-radius: 4px !important;
        }
        `,
      ],
    });
    el.initialize();
  }

  /** Swiper's own `activeIndex` is the source of truth — it covers swipes,
   *  autoplay and pagination-dot taps, not just the Next button. */
  onSlideChange(): void {
    const swiper = this.swiperEl().nativeElement.swiper;
    if (swiper) this.activeIndex.set(swiper.activeIndex);
  }

  /** Footer button: advance while there are slides left, otherwise leave. */
  primaryAction(): void {
    if (this.isLastSlide()) {
      this.goToCalculator();
      return;
    }
    const swiper = this.swiperEl().nativeElement.swiper;
    // Taking manual control cancels the auto-advance, so the carousel
    // doesn't keep sliding out from under the user mid-read.
    swiper?.autoplay?.stop();
    swiper?.slideNext();
  }

  goToCalculator(): void {
    // Every exit from this page — Skip or Explore Now — is what makes
    // onboarding a once-per-install screen (see onboardingGuard).
    this.onboarding.complete();
    // replaceUrl: onboarding is done for good, so it shouldn't sit in
    // history for a back press to land on (where the guard would only
    // bounce straight back here anyway).
    this.navCtrl.navigateRoot(['/arithmaxa'], { replaceUrl: true });
  }

  async openFeedback(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: FeedbackModal,
      cssClass: 'premium-modal',
      initialBreakpoint: 0.88,
      breakpoints: [0, 0.88, 1],
    });
    await modal.present();
  }
}
