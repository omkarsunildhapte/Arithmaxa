import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { shieldCheckmarkOutline } from 'ionicons/icons';
import { ConsentService, ConsentChoices } from '../../../services/consent/consent.service';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [RouterLink, IonIcon],
  templateUrl: './cookie-consent.html',
  styleUrls: ['./cookie-consent.css']
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
    this.showCustomize.update(v => !v);
  }

  setFunctional(checked: boolean): void {
    this.functional.set(checked);
  }

  setAiProcessing(checked: boolean): void {
    this.aiProcessing.set(checked);
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
