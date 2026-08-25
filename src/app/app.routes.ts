import { Routes } from '@angular/router';
import { onboardingGuard } from '@guards/onboarding.guard';

export const routes: Routes = [
  // Onboarding is a first-run-only screen: the guard bounces this straight
  // to /arithmaxa once the user has skipped or finished it.
  { path: '', canActivate: [onboardingGuard], loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  { path: 'arithmaxa', loadComponent: () => import('./pages/calculator/calculator').then((m) => m.Calculator) },
  { path: 'tools', loadComponent: () => import('./pages/tools/tools').then((m) => m.Tools) },
  { path: 'ai', loadComponent: () => import('./pages/ai-chat/ai-chat').then((m) => m.AiChatPage) },
  { path: 'privacy', loadComponent: () => import('./pages/privacy-policy/privacy-policy').then((m) => m.PrivacyPolicy) },
  { path: 'terms', loadComponent: () => import('./pages/terms-of-service/terms-of-service').then((m) => m.TermsOfService) },
  { path: '**', redirectTo: '' },
];
