import { Component, OnInit, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SplashScreen } from '@capacitor/splash-screen';
import { NavigationService } from '../services/navigation/navigation.service';
import { Platform } from '@ionic/angular/standalone';
import { CookieConsent } from './shared/cookie-consent/cookie-consent';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, CookieConsent],
  templateUrl: './app.html'
})
export class App implements OnInit {
  private navService = inject(NavigationService);
  private platform = inject(Platform);
  async ngOnInit() {
    this.navService.init();
    try {
      if (this.platform.is('hybrid')) {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setBackgroundColor({ color: '#050505' });
        await StatusBar.setStyle({ style: Style.Dark });
      }
    } catch (e) {
      console.warn('StatusBar plugin not found or failed to initialize');
    }
    try {
      await SplashScreen.hide();
    } catch (e) {
      console.warn('SplashScreen failed to hide');
    }
  }
}
