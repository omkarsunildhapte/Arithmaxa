import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon, IonButton, IonToggle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { shieldCheckmarkOutline } from 'ionicons/icons';
import { ConsentService } from '@services/consent/consent.service';
import { ConsentChoices } from '@appTypes/index';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [RouterLink, IonIcon, IonButton, IonToggle],
  templateUrl: './cookie-consent.html',
  styleUrls: ['./cookie-consent.css'],
})
export class CookieConsent {
  private consent = inject(ConsentService);

  readonly isVisible = computed(() => !this.consent.hasConsented());
  readonly showCustomize = signal(false);
  readonly functional = signal(true);
  readonly aiProcessing = signal(true);

  constructor() {
    addIcons({ shieldCheckmarkOutline });
  }

  toggleCustomize(): void {
    this.showCustomize.update((v) => !v);
  }

  setFunctional(checked: boolean): void {
    this.functional.set(checked);
  }

  setAiProcessing(checked: boolean): void {
    this.aiProcessing.set(checked);
  }

  onFunctionalChange(event: Event): void {
    const custom = event as CustomEvent<{ checked: boolean }>;
    this.setFunctional(custom.detail.checked);
  }

  onAiProcessingChange(event: Event): void {
    const custom = event as CustomEvent<{ checked: boolean }>;
    this.setAiProcessing(custom.detail.checked);
  }

  acceptAll(): void {
    this.consent.acceptAll();
  }

  acceptEssentialOnly(): void {
    this.consent.acceptEssentialOnly();
  }

  saveCustom(): void {
    const choices: ConsentChoices = {
      essential: true,
      functional: this.functional(),
      aiProcessing: this.aiProcessing(),
    };
    this.consent.save(choices);
  }
}
