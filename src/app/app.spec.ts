import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideIonicAngular, Platform } from '@ionic/angular/standalone';
import { provideRouter } from '@angular/router';
import { APP_SPLASH_ELEMENT_ID, APP_SPLASH_HIDE_CLASS } from '@constants/index';
import { NavigationService } from '@services/navigation/navigation.service';

describe('App', () => {
  let navServiceSpy: Partial<NavigationService>;
  let platformSpy: Partial<Platform>;

  beforeEach(async () => {
    navServiceSpy = { init: jest.fn() };
    platformSpy = { is: jest.fn().mockReturnValue(false) };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideIonicAngular(), provideRouter([]), { provide: NavigationService, useValue: navServiceSpy }, { provide: Platform, useValue: platformSpy }],
    }).compileComponents();
  });

  afterEach(() => {
    // dismissWebSplash() operates on the real document, outside Angular's
    // fixture — clean up manually so a splash element created by one test
    // can't leak into the next.
    document.getElementById(APP_SPLASH_ELEMENT_ID)?.remove();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should initialize navigation service on init', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(navServiceSpy.init).toHaveBeenCalled();
  });

  it('should fade out and remove the pre-bootstrap splash element on init', () => {
    jest.useFakeTimers();
    const splash = document.createElement('div');
    splash.id = APP_SPLASH_ELEMENT_ID;
    document.body.appendChild(splash);

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(splash.classList.contains(APP_SPLASH_HIDE_CLASS)).toBe(true);
    jest.runAllTimers();
    expect(document.getElementById(APP_SPLASH_ELEMENT_ID)).toBeNull();

    jest.useRealTimers();
  });

  it('should do nothing on init if no splash element is present', () => {
    expect(document.getElementById(APP_SPLASH_ELEMENT_ID)).toBeNull();
    const fixture = TestBed.createComponent(App);
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
