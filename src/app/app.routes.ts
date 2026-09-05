import { Routes } from '@angular/router';
import { onboardingGuard } from '@guards/onboarding.guard';

export const routes: Routes = [
  // Onboarding is a first-run-only screen: the guard bounces this straight
  // to /arithmaxa once the user has skipped or finished it.
  { path: '', canActivate: [onboardingGuard], loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  { path: 'arithmaxa', loadComponent: () => import('./pages/calculator/calculator').then((m) => m.Calculator) },
  { path: 'tools', loadComponent: () => import('./pages/tools/tools').then((m) => m.Tools) },
  { path: 'ai', loadComponent: () => import('./pages/ai-chat/ai-chat').then((m) => m.AiChatPage) },
  // No /privacy or /terms routes: both documents are hosted on
  // arithmaxa-website and opened in the system browser instead (see
  // `PRIVACY_POLICY_URL`/`TERMS_OF_SERVICE_URL` in @constants/legal).
  { path: '**', redirectTo: '' },
];
