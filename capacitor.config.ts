import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.arithmaxa.app',
  appName: 'Arithmaxa',
  webDir: 'www/browser',
  plugins: {
    SplashScreen: {
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
  },
};

export default config;
