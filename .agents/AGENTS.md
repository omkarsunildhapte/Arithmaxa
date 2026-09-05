# Arithmaxa App — Agent Rules

These rules must be followed by all agents working on the `arithmaxa-app` project — the real
Arithmaxa product: an Angular 22 + Ionic + Capacitor app packaged for Android (and iOS via
Capacitor, though Google Play is the only store currently targeted for release — see
`release-readiness-rules.md`).

This is a **client-only, packaged mobile app** — there is no server, no SSR, and no public web
crawling of its own. Rules from web projects that assume an SSR server, edge cache, or search
crawler (CSP nonces issued by a server, hydration, `RESPONSE` tokens, edge caching, sitemap
submission, etc.) do not apply here and must not be copied in.

- **Code architecture, style, testing:** see `frontend-rules.md`.
- **Play Store submission, native permissions, performance, offline behavior:** see
  `release-readiness-rules.md`.

## Sibling project: arithmaxa-website

`d:\arithmaxa\arithmaxa-website` is the public marketing/landing site whose sole purpose is
driving Google Play installs of *this* app. Two things must stay in sync across both repos —
treat this as a hard rule, not a suggestion:

1. **Privacy Policy / Terms of Service content.** The website's `/privacy-policy` and
   `/terms-of-service` pages are now the **only** copy of each document — the app's own
   `src/app/pages/privacy-policy/` and `src/app/pages/terms-of-service/` components were
   removed, and every in-app legal link opens the hosted page in the system browser via
   `PRIVACY_POLICY_URL`/`TERMS_OF_SERVICE_URL` (`src/constants/legal.ts`). There is deliberately
   no second copy to keep in sync, but the flip side is that the website repo is now load-bearing
   for this app's compliance: if you change what data this app collects, what permissions it
   requests, or what third-party services it calls (its own backend, OpenRouter, Firebase
   Analytics, exchange-rate APIs, etc.), you must update `arithmaxa-website`'s policy in the same
   PR/session — a stale public privacy policy is a Play Store compliance risk, not just a docs
   nit. Keep `WEBSITE_URL` in `src/constants/legal.ts` matching the website's `SITE_URL`, and the
   two paths matching that repo's `app.routes.ts`; a typo there is a dead legal link.
2. **Play Store package id.** `com.arithmaxa.app` (from `capacitor.config.ts`) is referenced by
   the website's Play Store download button. If this ever changes, the website's
   `src/app/shared/constants.ts` (`PLAY_STORE_URL`) must be updated in the same change.

---

## Coding Rules & Guidelines

These general rules must be followed by all agents working on this project.

### 1. Import Paths
See `frontend-rules.md` § 1 for the authoritative version of this rule and the full alias list —
it takes precedence over this section if the two ever disagree. Summary: use the `@` alias form
for new/touched imports; existing relative imports don't need a drive-by rewrite.

### 2. Import Formatting
Imports must be kept on a single line, no exceptions for length — see `frontend-rules.md` § 2 for
why `printWidth` is 200 here (not the generic 100) and what that tradeoff means project-wide.
Example:
```typescript
// NOT ALLOWED:
import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  inject,
  signal,
  viewChild,
} from '@angular/core';

// ALLOWED:
import { AfterViewChecked, Component, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
```

### 3. Strict Typing
The use of `any` is strictly prohibited. Use `unknown` or create proper interfaces/types. Server-side data must be properly typed when received.
This also applies to templates: the `$any()` template cast is prohibited. For DOM event handlers (e.g. `(input)`, `(change)`), pass the raw `$event` to a component method typed to accept `Event`, then cast `event.target` to the correct HTML element type (e.g. `event.target as HTMLSelectElement`) inside the `.ts` file — never inline in the template.

### 4. CSS Optimization
Avoid dumping component-specific styles into the global styles.css. If a CSS class is only used by one specific component, it must be placed in that component's respective .css file. Global styles.css should only contain design tokens, generic utility classes and base resets.

### 5. Modern Templates & Control Flow
Do not import CommonModule. Use Angular 14+ standalone components and specific imports. Use the built-in `@if`, `@for`, and `@switch` control flow syntax exclusively. When using `@for`, a unique tracking key is **mandatory** (e.g., `@for (item of items(); track item.id)`) to ensure optimal DOM reconciliation.

### 6. Signals-First Reactivity
Use Angular Signals exclusively for reactivity and state management instead of traditional RxJS `BehaviorSubjects` or standard properties.
- **Component I/O:** Use `input()`, `input.required()`, `output()`, and `model()` instead of legacy `@Input`/`@Output` decorators.
- **Dependent State:** Use `linkedSignal()` for state that needs to reset based on a source signal, rather than manual `effect()` logic.
- **Queries:** Use signal-based `viewChild`, `viewChildren`, `contentChild`, and `contentChildren` instead of `@ViewChild`/`@ContentChild`.

### 7. Dependency Injection
Prefer using the inject() function for dependency injection over traditional constructor parameter injection. Constructors should primarily be used for initialization logic, not for declaring dependencies.

### 8. Data Fetching (Resource APIs)
Angular services and components must use the built-in `resource()`, `rxResource()`, or `httpResource()` APIs for asynchronous operations and API calls, rather than manual RxJS subscriptions or returning raw Promises. This ensures declarative, auto-canceling async data fetching. **Exception:** imperative, non-reactive actions (e.g. a POST triggered by a user action, not a reactive data read) may use a plain `fetch()`/async method instead — forcing those into `resource()` fights the API rather than using it.

### 9. Service Layer Typings
The service layer must **never** declare its own data models/interfaces inline. All interfaces must be declared in the `types/` folder and imported using the `@appTypes/` alias.

### 10. Function Formatting
Functions with a single parameter should be kept on a single line where possible, avoiding multi-line formatting for single arguments.

### 11. State Management (Loading States)
Do not maintain generic UI loading states (like `isLoading`) manually within components or services via boolean flags. Components should rely on the reactive getters provided by Resource APIs (`resource.isLoading()`, `resource.error()`) to automatically manage their loading states when fetching data.

### 12. Service Testing
Whenever a service is created or updated, you must write or update the corresponding unit test cases for it. Ensure full coverage of the service's logic, including mock HTTP calls if it's a data service.

### 13. App Shell & Native Behavior
**Important**: This is a client-only Capacitor app — there is no server, no SSR, and no crawler-facing concerns (see the top of this doc). The web-project SEO/hydration rules from other projects' templates (SSR TTFB, `NgOptimizedImage` for crawler LCP, robots meta, canonical/OG tags, crawlable pagination) do not apply here and must not be copied in.

- Every page component that reads route params should use signal-based route input binding (`withComponentInputBinding()`) rather than manually subscribing to `ActivatedRoute`.
- Avoid using HashLocationStrategy; HTML5 pushState routing is required for in-app navigation.
- **Semantic HTML & Links**: Do not use `(click)` handlers on `div` or `button` for in-app navigation. Use `<a [routerLink]="...">` or `Router.navigate()` as appropriate. Use proper semantic tags and ensure only one `<h1>` per page.
- **@defer Traps**: Do NOT use client-triggered `@defer (on interaction/hover)` for content the user needs immediately on screen. Only use it for below-the-fold or non-critical UI elements.

### 14. Zero-Dependency State Encapsulation
Services must manage state using private writable signals (`signal()`) exposed to components via public read-only views (`computed()`), avoiding heavy external libraries like NgRx unless absolutely necessary.

### 15. Functional Routing & Interceptors
Class-based guards and interceptors are legacy. Use functional `HttpInterceptorFn`, `CanActivateFn`, and `ResolveFn`. Enable `withComponentInputBinding()` in router config to automatically map route params to component signal inputs.

### 16. Signal-Driven Forms
Use `@angular/forms/signals` (`formGroup`, `formControl`) or bridge legacy Reactive Forms with `toSignal(control.valueChanges)`. Avoid manual RxJS form subscriptions in the UI.

### 17. Fine-Grained Hydration & Zoneless
- Applications must aim to be Zoneless (`provideExperimentalZonelessChangeDetection()`).
- Use `@defer (on ...)` for granular client-side deferral (e.g., `viewport`, `hover`, `idle`) to minimize JS payload execution and startup time — important on lower-end Android devices, not just a web-perf nicety.

### 18. Security & Trusted Types
- Enforce Trusted Types (`require-trusted-types-for 'script'`) where the WebView shell allows it, to reduce DOM-based XSS surface. CSP nonce generation is an SSR-server concern and does not apply here (see Rule 13).

### 19. Animations & Assets
Prefer Web Animations API and CSS keyframes bound to component host classes over `@angular/animations` to save on bundle size and keep the app snappy on Android.

### 20. Strict Template Diagnostics
Enforce strict template checks (`strictTemplates`, `strictInputAccessModifiers`, `invalidBananaInBox`) in `tsconfig.json` to catch unhandled signals or missing control flows at build time.

### 21. Mandatory File Structure & Testing
- **Components:** Every Angular component MUST have its own dedicated `.ts`, `.html`, `.css`, and `.spec.ts` file. Inline templates or inline styles within the `.ts` file are strictly prohibited.
- **Other Elements:** All other architectural pieces (Services, Directives, Pipes, Guards, Interceptors, Utils) MUST have a `.ts` file and an accompanying `.spec.ts` file for unit testing.

### 22. No Hardcoded Values in TypeScript
Never use magic numbers or hardcoded string values directly in TypeScript (`.ts`) files.
- All configuration values, API endpoints, status strings, or numeric thresholds must be extracted into constants (`const`), `enum`s, or environment variables.
- *Exception:* Hardcoded string values are permitted in HTML template (`.html`) files for direct UI display purposes.
