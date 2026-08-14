import { TestBed } from '@angular/core/testing';
import { NetworkService } from './network.service';
import { Network } from '@capacitor/network';

jest.mock('@capacitor/network', () => ({
  Network: {
    getStatus: jest.fn(),
    addListener: jest.fn(),
  },
}));

describe('NetworkService', () => {
  let service: NetworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NetworkService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('defaults to connected before init() resolves', () => {
    expect(service.connected()).toBe(true);
  });

  it('init() sets connected/connectionType from Network.getStatus()', async () => {
    jest.mocked(Network.getStatus).mockResolvedValue({ connected: false, connectionType: 'none' });
    jest.mocked(Network.addListener).mockResolvedValue({ remove: jest.fn() });

    await service.init();

    expect(service.connected()).toBe(false);
    expect(service.connectionType()).toBe('none');
  });

  it('init() updates state when the plugin reports a networkStatusChange', async () => {
    jest.mocked(Network.getStatus).mockResolvedValue({ connected: true, connectionType: 'wifi' });
    let changeListener: (status: { connected: boolean; connectionType: string }) => void = () => {};
    jest.mocked(Network.addListener).mockImplementation(async (_event, listener) => {
      changeListener = listener;
      return { remove: jest.fn() };
    });

    await service.init();
    changeListener({ connected: false, connectionType: 'none' });

    expect(service.connected()).toBe(false);
    expect(service.connectionType()).toBe('none');
  });

  it('init() leaves connected() at its optimistic default when the plugin throws', async () => {
    jest.mocked(Network.getStatus).mockRejectedValue(new Error('unavailable'));

    await service.init();

    expect(service.connected()).toBe(true);
  });

  it('destroy() removes the status-change listener', async () => {
    const handle = { remove: jest.fn() };
    jest.mocked(Network.getStatus).mockResolvedValue({ connected: true, connectionType: 'wifi' });
    jest.mocked(Network.addListener).mockResolvedValue(handle);

    await service.init();
    service.destroy();

    expect(handle.remove).toHaveBeenCalled();
  });
});
