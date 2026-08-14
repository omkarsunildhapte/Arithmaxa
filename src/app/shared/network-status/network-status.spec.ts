import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NetworkStatus } from './network-status';
import { NetworkService } from '@services/network/network.service';

describe('NetworkStatus', () => {
  let fixture: ComponentFixture<NetworkStatus>;
  let netSpy: { connected: ReturnType<typeof signal<boolean>> };

  beforeEach(async () => {
    netSpy = { connected: signal(true) };

    await TestBed.configureTestingModule({
      imports: [NetworkStatus],
      providers: [{ provide: NetworkService, useValue: netSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(NetworkStatus);
    fixture.detectChanges();
  });

  it('renders nothing while connected', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.offline-banner')).toBeNull();
  });

  it('shows the offline banner when disconnected', () => {
    netSpy.connected.set(false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.offline-banner')).toBeTruthy();
  });
});
