import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Home } from './home';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let router: Router;

  beforeEach(async () => {
    const routerSpy = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [{ provide: Router, useValue: routerSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to calculator on goToCalculator', () => {
    component.goToCalculator();
    expect(router.navigate).toHaveBeenCalledWith(['/arithmaxa']);
  });

  it('should have swiper element', () => {
    // Initialized in AfterViewInit
    expect(component['swiperEl']).toBeDefined();
  });
});
