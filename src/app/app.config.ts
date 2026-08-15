import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    // useSetInputAPI: without it, ModalController.create()'s componentProps
    // does a raw property assignment onto the created component instance
    // instead of ComponentRef.setInput() — which silently clobbers any
    // Angular signal-based input() field (e.g. UnitConverter's `units`)
    // with a plain value, breaking every later call to that field as a
    // function. Every modal-hosted tool component using input() needs this.
    provideIonicAngular({ mode: 'md', useSetInputAPI: true }),
  ],
};
