import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { IonContent, IonIcon, IonButton, IonFooter, NavController, ModalController } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { chevronForwardOutline } from 'ionicons/icons';
import { FeedbackModal } from '../../shared/feedback/feedback-modal';
import { OnboardingService } from '@services/onboarding/onboarding.service';
import { OnboardingSlide } from '@appTypes/index';
addIcons({ chevronForwardOutline });

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonContent, IonIcon, RouterLink, IonButton, IonFooter],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements AfterViewInit {
  private navCtrl = inject(NavController);
  private modalCtrl = inject(ModalController);
  private onboarding = inject(OnboardingService);
  private readonly swiperEl = viewChild.required<ElementRef>('swiperEl');

  // prettier-ignore
  slides: OnboardingSlide[] = [
    { title: 'Basic Arithmetic', htmlTitle: 'Basic<br>Arithmetic', description: 'Perform essential mathematical operations with lightning speed and unmatched precision.' },
    { title: 'Occupational & Logic', htmlTitle: 'Occupational<br>&amp;<br>Logic', description: 'Handle complex logical grouping and advanced mathematical expressions with absolute ease.' },
    { title: 'Scientific Functions', htmlTitle: 'Scientific<br>Functions', description: 'Access high-level scientific functions: Logarithms, Trigonometry, and Power operations.' },
    { title: 'Calculation History', htmlTitle: 'Calculation<br>History', description: 'Never lose track of your work. Every result is stored and accessible at a single tap.' },
  ];

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
