import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonContent, IonBackButton, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, documentTextOutline, warningOutline, mailOutline, globeOutline, lockClosedOutline } from 'ionicons/icons';
import { LEGAL_LAST_UPDATED } from '@constants/index';
addIcons({ arrowBackOutline, documentTextOutline, warningOutline, mailOutline, globeOutline, lockClosedOutline });

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonContent, IonBackButton, IonButtons, RouterLink, IonIcon],
  templateUrl: './terms-of-service.html',
  styleUrls: ['./terms-of-service.css'],
})
export class TermsOfService {
  readonly effectiveDate = LEGAL_LAST_UPDATED;
  readonly currentYear = new Date().getFullYear();
}
