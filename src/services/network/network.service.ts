import { Service, signal } from '@angular/core';
import { Network } from '@capacitor/network';
import type { ConnectionType } from '@capacitor/network';
import type { PluginListenerHandle } from '@capacitor/core';

@Service()
export class NetworkService {
  /** Defaults to true — assume online until init() reports otherwise, so
   *  nothing shows an "offline" state during the brief window before the
   *  first real status arrives. */
  readonly connected = signal(true);
  readonly connectionType = signal<ConnectionType>('unknown');

  private listenerHandle: PluginListenerHandle | null = null;

  /** Call once from the app shell (see App.ngOnInit()). Network has a real
   *  web fallback (navigator.onLine + online/offline events), so this
   *  works unguarded on every platform, not just hybrid. */
  async init(): Promise<void> {
    try {
      const status = await Network.getStatus();
      this.connected.set(status.connected);
      this.connectionType.set(status.connectionType);
      this.listenerHandle = await Network.addListener('networkStatusChange', (status) => {
        this.connected.set(status.connected);
        this.connectionType.set(status.connectionType);
      });
    } catch {
      // Network plugin unavailable — leave connected() at its optimistic
      // default rather than incorrectly claiming the device is offline.
    }
  }

  destroy(): void {
    void this.listenerHandle?.remove();
    this.listenerHandle = null;
  }
}
