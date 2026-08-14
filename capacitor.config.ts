import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.arithmaxa.app',
  appName: 'Arithmaxa',
  webDir: 'www/browser',
  plugins: {
    SplashScreen: {
      // false so the splash stays up until App.ngOnInit()'s explicit
      // `SplashScreen.hide()` call, not a fixed timer — otherwise the
      // splash could auto-dismiss before Angular finishes bootstrapping
      // on a slow cold start, flashing a blank screen in between.
      launchAutoHide: false,
      launchShowDuration: 3000,
      backgroundColor: '#050505',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#6366f1',
      splashFullScreen: true,
      splashImmersive: true,
    },
    SystemBars: {
      // Applied at launch, before App.ngOnInit()'s explicit
      // SystemBars.setStyle() call can run.
      style: 'DARK',
      insetsHandling: 'css',
    },
    CapacitorCookies: {
      // Lets ConsentService (src/services/consent/consent.service.ts) write
      // the cookie-consent decision as a real native cookie, not just
      // localStorage — see its setCookie()/deleteCookie()/clearAllCookies()
      // calls.
      enabled: true,
    },
    Keyboard: {
      // iOS only. "ionic" resizes just <ion-app> — the correct mode for an
      // Ionic app's chat composer to stay pinned above the keyboard instead
      // of the whole native WebView (and its `vh` units) resizing.
      resize: 'ionic',
      style: 'DARK',
    },
    CapacitorHttp: {
      // Patches window.fetch/XMLHttpRequest to route through native
      // networking on hybrid platforms. Every existing HttpClient call
      // (AiService's OpenRouter request, CurrencyConverter's exchange-rate
      // httpResource()) picks this up automatically — no code changes
      // needed. This avoids the native WebView's browser-style CORS
      // handling for those cross-origin API calls and gets proper
      // redirect/cookie handling from the OS network stack instead.
      // No effect on the web build or the Jest test suite — the patch only
      // engages inside the real Capacitor native bridge.
      enabled: true,
    },
  },
};

export default config;
