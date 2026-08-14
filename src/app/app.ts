import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { PrivacyScreen } from '@capacitor/privacy-screen';
import { SystemBars, SystemBarsStyle, SystemBarType } from '@capacitor/core';
import { NavigationService } from '@services/navigation/navigation.service';
import { NetworkService } from '@services/network/network.service';
import { CookieConsent } from './shared/cookie-consent/cookie-consent';
import { NetworkStatus } from './shared/network-status/network-status';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, CookieConsent, NetworkStatus],
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {
  private navService = inject(NavigationService);
  private platform = inject(Platform);
  private network = inject(NetworkService);
  async ngOnInit() {
    this.navService.init();
    void this.network.init();
    try {
      if (this.platform.is('hybrid')) {
        await StatusBar.setBackgroundColor({ color: '#050505' });
        await StatusBar.setStyle({ style: Style.Dark });
      }
    } catch (e) {
      console.warn('StatusBar plugin not found or failed to initialize');
    }
    try {
      if (this.platform.is('hybrid')) {
        await ScreenOrientation.lock({ orientation: 'portrait' });
      }
    } catch (e) {
      console.warn('ScreenOrientation plugin not found or failed to lock');
    }
    try {
      if (this.platform.is('hybrid')) {
        // Dims the app in the OS app switcher / recents screen rather than
        // showing calculation history or an in-progress AI chat, matching
        // the app's local-only, privacy-first stance (see privacy-policy).
        await PrivacyScreen.enable({
          android: { dimBackground: true, privacyModeOnActivityHidden: 'dim' },
          ios: { blurEffect: 'dark' },
        });
      }
    } catch (e) {
      console.warn('PrivacyScreen plugin not found or failed to enable');
    }
    try {
      if (this.platform.is('hybrid')) {
        // @capacitor/status-bar above only covers the top status bar — it
        // has no reach into Android's navigation/gesture bar. SystemBars
        // (bundled with @capacitor/core) is the only API that does, so use
        // it just for that, matching the same dark theme.
        await SystemBars.setStyle({ style: SystemBarsStyle.Dark, bar: SystemBarType.NavigationBar });
      }
    } catch (e) {
      console.warn('SystemBars plugin not found or failed to style the navigation bar');
    }
    try {
      await SplashScreen.hide();
    } catch (e) {
      console.warn('SplashScreen failed to hide');
    }
  }

  ngOnDestroy(): void {
    this.network.destroy();
  }
}
