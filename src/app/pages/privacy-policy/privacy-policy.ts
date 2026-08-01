import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonContent, IonBackButton, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import { ConsentService } from '../../../services/consent/consent.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonContent, IonBackButton, IonButtons, RouterLink],
  templateUrl: './privacy-policy.html',
  styleUrls: ['./privacy-policy.css']
})
export class PrivacyPolicy {
  readonly consent = inject(ConsentService);
  readonly lastUpdated = 'January 1, 2025';
  readonly currentYear = new Date().getFullYear();

  constructor() {
    addIcons({ arrowBackOutline });
  }

  clearAllData(): void {
    if (confirm('This will delete all locally stored Arithmaxa data including history, settings, and feedback. Continue?')) {
      this.consent.clearAllData();
      alert('All Arithmaxa data has been cleared from this device.');
    }
  }
}
