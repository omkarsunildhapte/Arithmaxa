import { bootstrapApplication } from '@angular/platform-browser';
import { register } from 'swiper/element/bundle';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Registers the <swiper-container>/<swiper-slide> custom elements used by
// the home page's onboarding carousel — without this, home.ts's
// `el.initialize()` call throws "el.initialize is not a function" since
// the elements are still plain, undefined HTMLElements.
register();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
