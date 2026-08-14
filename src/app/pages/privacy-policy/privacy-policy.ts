import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonContent, IonBackButton, IonButtons, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import { ConsentService } from '@services/consent/consent.service';
import { LEGAL_LAST_UPDATED } from '@constants/index';
addIcons({ arrowBackOutline });
@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonContent, IonBackButton, IonButtons, RouterLink, IonButton],
  templateUrl: './privacy-policy.html',
  styleUrls: ['./privacy-policy.css'],
})
export class PrivacyPolicy {
  readonly consent = inject(ConsentService);
  readonly lastUpdated = LEGAL_LAST_UPDATED;
  readonly currentYear = new Date().getFullYear();

  clearAllData(): void {
    if (confirm('This will delete all locally stored Arithmaxa data including history, settings, and feedback. Continue?')) {
      this.consent.clearAllData();
      alert('All Arithmaxa data has been cleared from this device.');
    }
  }
}
