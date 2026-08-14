import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonContent, IonBackButton, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import { LEGAL_LAST_UPDATED } from '@constants/index';
addIcons({ arrowBackOutline });

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonContent, IonBackButton, IonButtons, RouterLink],
  templateUrl: './terms-of-service.html',
  styleUrls: ['./terms-of-service.css'],
})
export class TermsOfService {
  readonly effectiveDate = LEGAL_LAST_UPDATED;
  readonly currentYear = new Date().getFullYear();
}
