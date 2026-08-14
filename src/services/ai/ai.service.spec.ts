import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { AiService } from './ai.service';
import { OPENROUTER_URL } from '@constants/index';
import { LocalLLM } from '@capacitor/local-llm';
import { NetworkService } from '@services/network/network.service';

jest.mock('@capacitor/local-llm', () => ({
  LocalLLM: {
    systemAvailability: jest.fn(),
    download: jest.fn(),
    prompt: jest.fn(),
  },
}));

describe('AiService', () => {
  let service: AiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  it('pushes the user message and sets loading immediately on ask()', () => {
    service.ask('What is 2+2?');

    expect(service.loading()).toBe(true);
    expect(service.messages()).toEqual([{ role: 'user', content: 'What is 2+2?' }]);

    httpMock.expectOne(OPENROUTER_URL).flush({ choices: [{ message: { content: '4' } }] });
  });

  it('ignores an empty (whitespace-only) prompt', () => {
    service.ask('   ');
    expect(service.messages()).toEqual([]);
    httpMock.expectNone(OPENROUTER_URL);
  });

  it('appends the assistant reply and clears loading on a successful response', () => {
    service.ask('What is 2+2?');
    httpMock.expectOne(OPENROUTER_URL).flush({ choices: [{ message: { content: '4' } }] });

    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
    expect(service.messages()).toEqual([
      { role: 'user', content: 'What is 2+2?' },
      { role: 'assistant', content: '4' },
    ]);
  });

  it('on an error response, sets the error message and rolls back the just-added user message', () => {
    service.ask('What is 2+2?');
    httpMock.expectOne(OPENROUTER_URL).flush({ error: { message: 'Invalid API key' } }, { status: 401, statusText: 'Unauthorized' });

    expect(service.loading()).toBe(false);
    expect(service.error()).toBe('Invalid API key');
    expect(service.messages()).toEqual([]);
  });

  it('clearMessages() empties the conversation and clears any error', () => {
    service.ask('hi');
    httpMock.expectOne(OPENROUTER_URL).flush({ choices: [{ message: { content: 'hello' } }] });

    service.clearMessages();

    expect(service.messages()).toEqual([]);
    expect(service.error()).toBeNull();
  });

  it('attaches the image and sends it as multimodal content, even without text', () => {
    service.ask('', 'data:image/jpeg;base64,abc123');

    expect(service.messages()).toEqual([{ role: 'user', content: '', imageUrl: 'data:image/jpeg;base64,abc123' }]);

    const req = httpMock.expectOne(OPENROUTER_URL);
    const userPart = req.request.body.messages[1];
    expect(userPart.content).toEqual([
      { type: 'text', text: '' },
      { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,abc123' } },
    ]);
    req.flush({ choices: [{ message: { content: 'That looks like 2 + 2.' } }] });
  });

  it('checkLocalAvailability() reflects LocalLLM.systemAvailability()', async () => {
    jest.mocked(LocalLLM.systemAvailability).mockResolvedValue({ status: 'available' });

    await service.checkLocalAvailability();

    expect(service.localAvailable()).toBe('available');
  });

  it('checkLocalAvailability() falls back to unavailable when the plugin throws', async () => {
    jest.mocked(LocalLLM.systemAvailability).mockRejectedValue(new Error('unsupported'));

    await service.checkLocalAvailability();

    expect(service.localAvailable()).toBe('unavailable');
  });

  it('downloadLocalModel() calls download() then refreshes availability', async () => {
    jest.mocked(LocalLLM.download).mockResolvedValue(undefined);
    jest.mocked(LocalLLM.systemAvailability).mockResolvedValue({ status: 'available' });

    await service.downloadLocalModel();

    expect(LocalLLM.download).toHaveBeenCalled();
    expect(service.localAvailable()).toBe('available');
  });

  it('ask() routes to the on-device model instead of OpenRouter when useLocal is on and the model is available', async () => {
    service.localAvailable.set('available');
    service.useLocal.set(true);
    jest.mocked(LocalLLM.prompt).mockResolvedValue({ text: 'On-device answer' });

    service.ask('What is 2+2?');
    await new Promise((resolve) => setTimeout(resolve, 0));

    httpMock.expectNone(OPENROUTER_URL);
    expect(LocalLLM.prompt).toHaveBeenCalledWith(expect.objectContaining({ prompt: 'What is 2+2?' }));
    expect(service.loading()).toBe(false);
    expect(service.messages()).toEqual([
      { role: 'user', content: 'What is 2+2?' },
      { role: 'assistant', content: 'On-device answer' },
    ]);
  });

  it('useLocal() defaults to true — the free on-device model is the primary path, not an opt-in', () => {
    expect(service.useLocal()).toBe(true);
  });

  it('ask() with a photo AND readable text (e.g. from OCR) still uses the free local model', async () => {
    service.localAvailable.set('available');
    jest.mocked(LocalLLM.prompt).mockResolvedValue({ text: 'x = 5' });

    service.ask('2x + 4 = 14', 'data:image/jpeg;base64,abc123');
    await new Promise((resolve) => setTimeout(resolve, 0));

    httpMock.expectNone(OPENROUTER_URL);
    expect(LocalLLM.prompt).toHaveBeenCalledWith(expect.objectContaining({ prompt: '2x + 4 = 14' }));
  });

  it('ask() with a photo and NO readable text falls back to the cloud vision model', () => {
    service.localAvailable.set('available');

    service.ask('', 'data:image/jpeg;base64,abc123');

    httpMock.expectOne(OPENROUTER_URL).flush({ choices: [{ message: { content: 'A math problem.' } }] });
    expect(LocalLLM.prompt).not.toHaveBeenCalled();
  });

  it('on a LocalLLM error, sets the error message and rolls back the just-added user message', async () => {
    service.localAvailable.set('available');
    service.useLocal.set(true);
    jest.mocked(LocalLLM.prompt).mockRejectedValue(new Error('LOCAL_LLM_NOT_READY'));

    service.ask('What is 2+2?');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(service.loading()).toBe(false);
    expect(service.error()).toBe('LOCAL_LLM_NOT_READY');
    expect(service.messages()).toEqual([]);
  });

  it('ask() fails fast with an offline message instead of hitting the network when disconnected', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: NetworkService, useValue: { connected: signal(false) } }],
    });
    const offlineService = TestBed.inject(AiService);
    const offlineHttpMock = TestBed.inject(HttpTestingController);

    offlineService.ask('What is 2+2?');

    offlineHttpMock.expectNone(OPENROUTER_URL);
    expect(offlineService.loading()).toBe(false);
    expect(offlineService.error()).toBe("You're offline. Check your connection and try again.");
    expect(offlineService.messages()).toEqual([]);
  });
});
