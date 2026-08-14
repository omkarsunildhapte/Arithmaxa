import { Component, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cloudOfflineOutline } from 'ionicons/icons';
import { NetworkService } from '@services/network/network.service';

addIcons({ cloudOfflineOutline });

@Component({
  selector: 'app-network-status',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './network-status.html',
  styleUrls: ['./network-status.css'],
})
export class NetworkStatus {
  protected readonly net = inject(NetworkService);
}
