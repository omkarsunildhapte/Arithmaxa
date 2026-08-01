import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AiChatPage } from './ai-chat';
import { AiService } from '../../../services/ai/ai.service';
import { CalculatorService } from '../../../services/calculator/calculator.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

describe('AiChatPage', () => {
  let component: AiChatPage;
  let fixture: ComponentFixture<AiChatPage>;
  let aiService: any;
  let router: any;

  beforeEach(async () => {
    const aiSpy = {
      ask: jest.fn(),
      clearMessages: jest.fn(),
      messages: signal([]),
      loading: signal(false),
      error: signal(null),
      apiKey: signal('test-key'),
      selectedModel: signal('test-model')
    };
    const navSpy = { goBack: jest.fn() };
    const routerSpy = { navigate: jest.fn() };
    const calcSpy = {
      display: signal('123')
    };

    await TestBed.configureTestingModule({
      imports: [AiChatPage, FormsModule],
      providers: [
        { provide: AiService, useValue: aiSpy },
        { provide: Router, useValue: routerSpy },
        { provide: CalculatorService, useValue: calcSpy },
        { provide: NavigationService, useValue: navSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AiChatPage);
    component = fixture.componentInstance;
    aiService = TestBed.inject(AiService);
    router = TestBed.inject(Router);
    const nav = TestBed.inject(NavigationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call aiService.ask on send', () => {
    component['prompt'] = 'hello';
    component['send']();
    expect(aiService.ask).toHaveBeenCalledWith('hello');
    expect(component['prompt']).toBe('');
  });

  it('should navigate back using NavigationService', () => {
    const nav = TestBed.inject(NavigationService);
    component['goBack']();
    expect(nav.goBack).toHaveBeenCalled();
  });

  it('should use expression from calculator service', () => {
    component['useExpression']();
    expect(component['prompt']).toBe('Explain or solve: 123');
  });

  it('should toggle mic recording state', () => {
    (component as any).recognition = { start: jest.fn(), stop: jest.fn() };    

    component['toggleMic']();
    expect(component['isRecording']()).toBe(true);
    

    component['toggleMic']();
    expect(component['isRecording']()).toBe(false);
  });
});
