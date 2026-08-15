import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AiChatPage } from './ai-chat';
import { AiService } from '@services/ai/ai.service';
import { CalculatorService } from '@services/calculator/calculator.service';
import { NavigationService } from '@services/navigation/navigation.service';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { SpeechRecognition } from '@capgo/capacitor-speech-recognition';
import { Camera, MediaType } from '@capacitor/camera';
import { Keyboard } from '@capacitor/keyboard';
import { Clipboard } from '@capacitor/clipboard';
import { TextRecognition } from '@capacitor-mlkit/text-recognition';

jest.mock('@capgo/capacitor-speech-recognition', () => ({
  SpeechRecognition: {
    available: jest.fn(),
    checkPermissions: jest.fn(),
    requestPermissions: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  },
}));

jest.mock('@capacitor/camera', () => ({
  Camera: { takePhoto: jest.fn() },
  CameraDirection: { Rear: 'REAR', Front: 'FRONT' },
  EncodingType: { JPEG: 0, PNG: 1 },
  MediaType: { Photo: 0, Video: 1 },
}));

jest.mock('@capacitor/keyboard', () => ({
  Keyboard: { addListener: jest.fn() },
}));

jest.mock('@capacitor/clipboard', () => ({
  Clipboard: { write: jest.fn() },
}));

jest.mock('@capacitor-mlkit/text-recognition', () => ({
  TextRecognition: { processImage: jest.fn() },
}));

describe('AiChatPage', () => {
  let component: AiChatPage;
  let fixture: ComponentFixture<AiChatPage>;
  let aiService: AiService;
  let router: Router;

  beforeEach(async () => {
    jest.mocked(SpeechRecognition.available).mockResolvedValue({ available: true });
    jest.mocked(SpeechRecognition.checkPermissions).mockResolvedValue({ speechRecognition: 'granted' });
    jest.mocked(SpeechRecognition.requestPermissions).mockResolvedValue({ speechRecognition: 'granted' });
    jest.mocked(SpeechRecognition.start).mockResolvedValue({ matches: ['hello world'] });
    jest.mocked(SpeechRecognition.stop).mockResolvedValue(undefined);
    jest.mocked(Camera.takePhoto).mockResolvedValue({ type: MediaType.Photo, saved: false, thumbnail: 'abc123' });
    jest.mocked(Keyboard.addListener).mockResolvedValue({ remove: jest.fn() });
    jest.mocked(Clipboard.write).mockResolvedValue(undefined);

    const aiSpy = {
      ask: jest.fn(),
      clearMessages: jest.fn(),
      checkLocalAvailability: jest.fn().mockResolvedValue(undefined),
      downloadLocalModel: jest.fn().mockResolvedValue(undefined),
      messages: signal([]),
      loading: signal(false),
      error: signal(null),
      localAvailable: signal('unavailable'),
      useLocal: signal(false),
    };
    const navSpy = { goBack: jest.fn() };
    const routerSpy = { navigate: jest.fn() };
    const calcSpy = {
      display: signal('123'),
    };

    await TestBed.configureTestingModule({
      imports: [AiChatPage, FormsModule],
      providers: [
        { provide: AiService, useValue: aiSpy },
        { provide: Router, useValue: routerSpy },
        { provide: CalculatorService, useValue: calcSpy },
        { provide: NavigationService, useValue: navSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AiChatPage);
    component = fixture.componentInstance;
    aiService = TestBed.inject(AiService);
    router = TestBed.inject(Router);
    const nav = TestBed.inject(NavigationService);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  it('ngOnInit() checks mic availability via SpeechRecognition.available()', () => {
    expect(SpeechRecognition.available).toHaveBeenCalled();
    expect(component['micAvailable']()).toBe(true);
  });

  it('toggleMic() starts recording, appends the transcript, and clears the recording flag when done', async () => {
    await component['toggleMic']();

    expect(SpeechRecognition.start).toHaveBeenCalledWith({ language: 'en-US' });
    expect(component['prompt']).toBe('hello world');
    expect(component['isRecording']()).toBe(false);
  });

  it('toggleMic() stops an in-progress recording instead of starting a new one', async () => {
    component['isRecording'].set(true);

    await component['toggleMic']();

    expect(SpeechRecognition.stop).toHaveBeenCalled();
    expect(SpeechRecognition.start).not.toHaveBeenCalled();
    expect(component['isRecording']()).toBe(false);
  });

  it('toggleMic() requests permission first when not already granted, then starts', async () => {
    jest.mocked(SpeechRecognition.checkPermissions).mockResolvedValue({ speechRecognition: 'prompt' });

    await component['toggleMic']();

    expect(SpeechRecognition.requestPermissions).toHaveBeenCalled();
    expect(SpeechRecognition.start).toHaveBeenCalled();
  });

  it('toggleMic() alerts and does not start when permission is denied', async () => {
    jest.mocked(SpeechRecognition.checkPermissions).mockResolvedValue({ speechRecognition: 'prompt' });
    jest.mocked(SpeechRecognition.requestPermissions).mockResolvedValue({ speechRecognition: 'denied' });
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    await component['toggleMic']();

    expect(SpeechRecognition.start).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  it('toggleMic() alerts and does not start when speech recognition is unavailable on the device', async () => {
    jest.mocked(SpeechRecognition.available).mockResolvedValue({ available: false });
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    const unavailableFixture = TestBed.createComponent(AiChatPage);
    unavailableFixture.detectChanges();
    await unavailableFixture.whenStable();

    await unavailableFixture.componentInstance['toggleMic']();

    expect(SpeechRecognition.start).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  it('ngOnInit() checks on-device model availability via AiService', () => {
    expect(aiService.checkLocalAvailability).toHaveBeenCalled();
  });

  it('ngOnInit() registers a keyboardDidShow listener that re-scrolls the messages list', () => {
    expect(Keyboard.addListener).toHaveBeenCalledWith('keyboardDidShow', expect.any(Function));
  });

  it('ngOnDestroy() removes the keyboard listener', async () => {
    const handle = { remove: jest.fn() };
    jest.mocked(Keyboard.addListener).mockResolvedValue(handle);

    const f = TestBed.createComponent(AiChatPage);
    f.detectChanges();
    await f.whenStable();

    f.componentInstance.ngOnDestroy();

    expect(handle.remove).toHaveBeenCalled();
  });

  it('attachPhoto() captures a photo and stores it as a data URI', async () => {
    await component['attachPhoto']();

    expect(Camera.takePhoto).toHaveBeenCalled();
    expect(component['attachedPhoto']()).toBe('data:image/jpeg;base64,abc123');
  });

  it('attachPhoto() leaves attachedPhoto unset if the user cancels the capture', async () => {
    jest.mocked(Camera.takePhoto).mockRejectedValue(new Error('cancelled'));

    await component['attachPhoto']();

    expect(component['attachedPhoto']()).toBeNull();
  });

  it('clearAttachedPhoto() clears a pending photo', async () => {
    await component['attachPhoto']();
    component['clearAttachedPhoto']();

    expect(component['attachedPhoto']()).toBeNull();
  });

  it('send() includes the attached photo and clears it afterward', async () => {
    await component['attachPhoto']();
    component['prompt'] = 'What is this?';

    component['send']();

    expect(aiService.ask).toHaveBeenCalledWith('What is this?', 'data:image/jpeg;base64,abc123');
    expect(component['attachedPhoto']()).toBeNull();
  });

  it('send() allows a photo-only message with no text', async () => {
    await component['attachPhoto']();
    component['prompt'] = '';

    component['send']();

    expect(aiService.ask).toHaveBeenCalledWith('', 'data:image/jpeg;base64,abc123');
  });

  it('attachPhoto() runs on-device OCR when a file path is available and appends the recognized text to the prompt', async () => {
    jest.mocked(Camera.takePhoto).mockResolvedValue({ type: MediaType.Photo, saved: false, thumbnail: 'abc123', uri: 'file:///tmp/photo.jpg' });
    jest.mocked(TextRecognition.processImage).mockResolvedValue({ text: '2x + 4 = 14', blocks: [] });

    await component['attachPhoto']();

    expect(TextRecognition.processImage).toHaveBeenCalledWith({ path: 'file:///tmp/photo.jpg' });
    expect(component['prompt']).toBe('2x + 4 = 14');
    expect(component['recognizingText']()).toBe(false);
  });

  it('attachPhoto() appends OCR text after an existing typed prompt instead of overwriting it', async () => {
    component['prompt'] = 'Please solve:';
    jest.mocked(Camera.takePhoto).mockResolvedValue({ type: MediaType.Photo, saved: false, thumbnail: 'abc123', uri: 'file:///tmp/photo.jpg' });
    jest.mocked(TextRecognition.processImage).mockResolvedValue({ text: '2x + 4 = 14', blocks: [] });

    await component['attachPhoto']();

    expect(component['prompt']).toBe('Please solve: 2x + 4 = 14');
  });

  it('attachPhoto() leaves the prompt untouched when OCR fails or finds nothing', async () => {
    jest.mocked(Camera.takePhoto).mockResolvedValue({ type: MediaType.Photo, saved: false, thumbnail: 'abc123', uri: 'file:///tmp/photo.jpg' });
    jest.mocked(TextRecognition.processImage).mockRejectedValue(new Error('no text found'));

    await component['attachPhoto']();

    expect(component['prompt']).toBe('');
    expect(component['recognizingText']()).toBe(false);
  });

  it('attachPhoto() skips OCR entirely when the photo has no local file path (e.g. plain web)', async () => {
    await component['attachPhoto'](); // default mock has thumbnail but no uri

    expect(TextRecognition.processImage).not.toHaveBeenCalled();
  });

  it('toggleLocalLlm() flips useLocal when the on-device model is available', async () => {
    aiService.localAvailable.set('available');

    await component['toggleLocalLlm']();

    expect(aiService.useLocal()).toBe(true);
  });

  it('toggleLocalLlm() downloads the model instead of toggling when status is downloadable', async () => {
    aiService.localAvailable.set('downloadable');

    await component['toggleLocalLlm']();

    expect(aiService.downloadLocalModel).toHaveBeenCalled();
    expect(aiService.useLocal()).toBe(false);
  });

  it('copyMessage() writes to the clipboard and briefly marks the message as copied', async () => {
    jest.useFakeTimers();

    await component['copyMessage'](0, 'The answer is 4.');

    expect(Clipboard.write).toHaveBeenCalledWith({ string: 'The answer is 4.' });
    expect(component['copiedIndex']()).toBe(0);

    jest.advanceTimersByTime(1500);
    expect(component['copiedIndex']()).toBeNull();

    jest.useRealTimers();
  });

  it('copyMessage() leaves copiedIndex unset if the clipboard write fails', async () => {
    jest.mocked(Clipboard.write).mockRejectedValue(new Error('denied'));

    await component['copyMessage'](0, 'The answer is 4.');

    expect(component['copiedIndex']()).toBeNull();
  });
});
