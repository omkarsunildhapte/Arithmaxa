import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { Home } from './home';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { OnboardingService } from '@services/onboarding/onboarding.service';

/**
 * Stand-in for the real <swiper-container>, which main.ts's register() sets
 * up at bootstrap and jsdom therefore never sees. It only needs the surface
 * Home actually touches: initialize(), and the `swiper` instance behind
 * onSlideChange()/primaryAction().
 */
class SwiperContainerStub extends HTMLElement {
  swiper = {
    activeIndex: 0,
    autoplay: { stop: jest.fn() },
    slideNext: jest.fn(),
  };
  initialize = jest.fn();
}

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let router: Router;

  beforeAll(() => {
    if (!customElements.get('swiper-container')) {
      customElements.define('swiper-container', SwiperContainerStub);
    }
  });

  beforeEach(async () => {
    localStorage.clear();

    // A real Router (with mocked Location) rather than a bare spy: Home
    // navigates through Ionic's NavController, which subscribes to
    // router.events in its constructor and would throw on a stub.
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([]), provideLocationMocks(), provideIonicAngular()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  });

  const swiper = () => (fixture.nativeElement.querySelector('swiper-container') as SwiperContainerStub).swiper;

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to calculator on goToCalculator', () => {
    component.goToCalculator();
    expect(router.navigate).toHaveBeenCalledWith(['/arithmaxa'], expect.anything());
  });

  it('should have swiper element', () => {
    // Initialized in AfterViewInit
    expect(component['swiperEl']).toBeDefined();
  });

  it('marks onboarding complete when leaving the page', () => {
    expect(TestBed.inject(OnboardingService).completed()).toBe(false);

    component.goToCalculator();

    expect(TestBed.inject(OnboardingService).completed()).toBe(true);
  });

  it('shows Next until the final slide, where it becomes Explore Now', () => {
    expect(component.isLastSlide()).toBe(false);

    component.activeIndex.set(component.slides.length - 1);

    expect(component.isLastSlide()).toBe(true);
  });

  it('advances the carousel (and stops autoplay) while slides remain', () => {
    component.primaryAction();

    expect(swiper().slideNext).toHaveBeenCalled();
    expect(swiper().autoplay.stop).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('leaves for the calculator when the last slide is showing', () => {
    component.activeIndex.set(component.slides.length - 1);

    component.primaryAction();

    expect(swiper().slideNext).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalled();
  });

  it('tracks the visible slide from swiper on slide change', () => {
    swiper().activeIndex = 2;

    component.onSlideChange();

    expect(component.activeIndex()).toBe(2);
  });
});
