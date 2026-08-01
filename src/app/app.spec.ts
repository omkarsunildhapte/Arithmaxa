import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideIonicAngular, Platform } from '@ionic/angular/standalone';
import { provideRouter } from '@angular/router';
import { NavigationService } from '../services/navigation/navigation.service';

describe('App', () => {
  let navServiceSpy: any;
  let platformSpy: any;

  beforeEach(async () => {
    navServiceSpy = { init: jest.fn() };
    platformSpy = { is: jest.fn().mockReturnValue(false) };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideIonicAngular(),
        provideRouter([]),
        { provide: NavigationService, useValue: navServiceSpy },
        { provide: Platform, useValue: platformSpy }
      ]
    }).compileComponents();
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
});
