import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild, inject } from '@angular/core';
import { IonContent, IonIcon, NavController, ModalController } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, chatbubbleEllipsesOutline } from 'ionicons/icons';
import { FeedbackModal } from '../../shared/feedback/feedback-modal';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonContent, IonIcon, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements AfterViewInit {
  constructor() {
    addIcons({ chevronForwardOutline, chatbubbleEllipsesOutline });
  }
  private navCtrl = inject(NavController);
  private modalCtrl = inject(ModalController);
  @ViewChild('swiperEl') private swiperEl!: ElementRef;

  slides = [
    { title: 'Basic Arithmetic', htmlTitle: 'Basic<br>Arithmetic', description: 'Perform essential mathematical operations with lightning speed and unmatched precision.', image: 'onboarding/arithmetic.png' },
    { title: 'Occupational & Logic', htmlTitle: 'Occupational<br>&amp;<br>Logic', description: 'Handle complex logical grouping and advanced mathematical expressions with absolute ease.', image: 'onboarding/logic.png' },
    { title: 'Scientific Functions', htmlTitle: 'Scientific<br>Functions', description: 'Access high-level scientific functions: Logarithms, Trigonometry, and Power operations.', image: 'onboarding/scientific.png' },
    { title: 'Calculation History', htmlTitle: 'Calculation<br>History', description: 'Never lose track of your work. Every result is stored and accessible at a single tap.', image: 'onboarding/history.png' }
  ];

  ngAfterViewInit(): void {
    const el = this.swiperEl.nativeElement;

    Object.assign(el, {
      injectStyles: [
        `
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.4) !important;
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background: #fbbf24 !important;
          opacity: 1;
          width: 20px !important;
          border-radius: 4px !important;
        }
        `
      ]
    });
    el.initialize();
  }

  goToCalculator(): void {
    this.navCtrl.navigateRoot(['/arithmaxa']);
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

