# Arithmaxa App — Frontend Architecture & Style Rules

These rules must be followed by all agents working on `arithmaxa-app`. For Play Store /
release-readiness rules, see `release-readiness-rules.md`.

## 1. Import Paths
Path aliases are configured in `tsconfig.json` (`baseUrl` + `paths`) — use them for new/touched
imports instead of relative paths:

- `@shared/*` → `src/app/shared/*`
- `@pages/*` → `src/app/pages/*`
- `@app/*` → `src/app/*`
- `@services/*` → `src/services/*`
- `@constants/*` → `src/constants/*`
- `@appTypes/*` → `src/types/*`
- `@guards/*` → `src/guards/*`
- `@interceptors/*` → `src/interceptors/*`
- `@environments/*` → `src/environments/*`
- `@directives/*` → `src/directives/*` (reserved — no `src/directives/` folder exists yet)

Existing relative imports (`../../services/ai/ai.service`) still resolve and don't need a
drive-by rewrite just to switch style — but any file you're already touching for another reason,
and every new file, should use the `@` alias form. Do not introduce a one-off alias for a single
import without updating `tsconfig.json` for the whole project — that produces inconsistent
resolution between the IDE and the build.

## 2. Import Formatting
Keep imports on a single line — avoid multi-line destructured imports that eat vertical space.
Prettier's `printWidth` is 200 (`.prettierrc`), raised from the original 100 specifically so
`@ionic/angular/standalone` import lists (routinely 8-11 named imports) and similar long-but-flat
import statements don't force-wrap. This is a deliberate, repo-specific tradeoff — it also raises
the wrap threshold for everything else Prettier formats (object literals, function calls, etc.),
not just imports, since Prettier has no per-statement-kind printWidth. Don't lower it back to 100
to "fix" a long non-import line; that reintroduces the wrapping this was raised to avoid.

## 3. Strict Typing
`any` is prohibited — use `unknown` or a proper interface/type from `src/types/`. Template
`$any()` casts are prohibited: for DOM event handlers, type the handler parameter as `Event` and
cast `event.target` to the correct HTML element type inside the `.ts` file, never inline in the
template.

## 4. CSS Optimization
Component-specific styles belong in that component's own `.css` file. `src/styles.css` is
reserved for the brand tokens (`--brand-primary`, `--brand-surface`, etc.), the Outfit font
import, Ionic CSS variable overrides, and truly global utility classes (`.animate-fade-in`,
scrollbar styling) — not one-off component styling.

## 5. Modern Templates & Control Flow
Do not import `CommonModule`. Use standalone components with explicit imports and the built-in
`@if`/`@for`/`@switch` control flow. `@for` requires a `track` expression — prefer a stable id
over array index for any list backed by user data (history entries, chat messages).

## 6. Signals-First Reactivity
Prefer Signals over manual RxJS `BehaviorSubject`/plain class fields for component and service
state. Use `input()`/`input.required()`/`output()`/`model()` over legacy decorators in new or
touched components. HTTP calls that stream/accumulate (AI chat responses) are a legitimate case
for RxJS — don't force-fit those into signals just for the sake of it.

## 7. Dependency Injection
Use `inject()` over constructor-parameter injection; reserve constructors for actual
initialization logic.

## 8. Data Fetching
Use Angular's `resource()`/`rxResource()`/`httpResource()` for new HTTP-backed state
(`services/ai`, `services/tools` currency/exchange-rate calls) instead of manual
`.subscribe()` chains — auto-cancellation matters here since users can navigate away from AI
Chat mid-request. There is no SSR/Transfer State in this app — resource results are purely
client-fetched, nothing to reuse across a server/client boundary.

## 9. Service Layer Typings
Services must not declare data models inline. Interfaces (`ChatMessage`, calculator result
shapes, tool input/output types) belong in `src/types/` and get imported from there — including
the ones currently declared inline in `services/ai/ai.service.ts` and friends; move them the
next time that file is touched.

## 10. Function Formatting
Single-parameter functions stay on one line where reasonable; let Prettier's 200-column width
(Rule 2) decide the rest — don't hand-wrap short signatures.

## 11. Loading State
Prefer a `resource()`'s own `isLoading()`/`error()`/`status()` over a hand-rolled boolean
`isLoading` flag once a call site is migrated to the Resource API (see Rule 8). Existing
`.subscribe()`-based services may keep manual flags until migrated — don't do a drive-by
rewrite unrelated to the task at hand.

## 12. Testing
Every service (`services/*`) must have a corresponding `.spec.ts` with real coverage, including
mocked `HttpClient` calls where relevant — as of the audit-remediation pass, all 6 services and
every component have one; keep it that way for any new file. Components already generally have
`.spec.ts` siblings (see `src/app/pages/**`, `src/app/shared/**`) — keep that pattern for any new
component.

Test runner is **Jest** (`npm test` → `jest`), not Vitest, despite `vitest` appearing in
`devDependencies` — write specs using Jest's API (`jest.fn()`, `jest.mock()`), not Vitest's.

`jest.config.ts` uses `jest-preset-angular`'s `createCjsPreset()`, not `createEsmPreset()` — do
not switch it back. The ESM preset (run via `node --experimental-vm-modules`) hits real Node
dual-package hazards on this dependency tree: `@ionic/angular`'s `"./standalone"` export and
`rxjs`'s `esm5` subpath exports resolve inconsistently between Jest's loader and Node's own ESM
loader, surfacing as an opaque `Unexpected export statement in CJS module` with no file context.
The CJS preset avoids all of that by transforming everything (including `@angular/*`'s `.mjs`
fesm2022 bundles and `@ionic/core`'s Stencil-compiled `.js` runtime) through ts-jest to
CommonJS — see the comments in `jest.config.ts` and `transformIgnorePatterns` there for exactly
which packages need transforming and why. Relatedly, `setup-jest.ts` must call
`setupZonelessTestEnv()` explicitly (`jest-preset-angular/setup-env/zoneless` only exports the
function, it doesn't run on import) — a bare side-effect `import` there silently skips
`TestBed.initTestEnvironment()` and every test fails with "Need to call
TestBed.initTestEnvironment() first".

`jest.config.ts` also has a `moduleNameMapper` mirroring every alias in `tsconfig.json`'s `paths`
(Rule 1) — keep the two in sync. Jest's runtime resolver doesn't read tsconfig `paths` on its own;
without the mapper, a *type-only* aliased import (an interface/type, erased by TypeScript at
compile time) happens to work by accident, while a *value* import (an actual class/const/function
via the same alias) fails with "Cannot find module" — easy to miss since the type-only case gives
no signal anything's wrong.

## 13. No SSR, No Hydration
This app has no `@angular/ssr`, no `provideClientHydration()`, and is bootstrapped as a plain
CSR Capacitor webview app (`bootstrapApplication` in `main.ts`). Do not add SSR-only patterns
(`RESPONSE` token, `withEventReplay()`, hydration mismatches guidance, edge/CDN caching) — none
of it applies to a bundle that ships inside an APK/IPA.

## 14. State Encapsulation
Services expose state via private writable `signal()`s and public `computed()` views rather than
raw public mutable fields. Avoid pulling in NgRx or similar for what a couple of signals and
computed values already solve.

## 15. Functional Routing
Class-based guards/interceptors are legacy — use functional `HttpInterceptorFn`/`CanActivateFn`.
`src/guards/` and `src/interceptors/` exist as scaffolding for this; keep new guards/interceptors
functional from the start.

## 16. Ionic Components
This app uses `@ionic/angular/standalone` (`IonHeader`, `IonToolbar`, `IonContent`,
`IonBackButton`, etc.) — import only the specific Ionic components used per file, matching the
existing pattern in `tools.ts`/`cookie-consent.ts`. Register icons via `addIcons()` in the
component constructor as already done, rather than importing the full `ionicons` set.

**Prefer the Ionic component over the raw HTML element wherever one exists**, rather than reaching
for plain `<button>`/`<input>`/`<textarea>`/a hand-rolled checkbox-as-toggle:

| Raw HTML | Use instead |
|---|---|
| `<button>` | `<ion-button fill="clear">` (or `expand="block"` for full-width) |
| `<input>` (text/number/date/etc.) | `<ion-input>` — `type` still passes through to the native input, so `<ion-input type="date">` keeps the same native date-picker UX as `<input type="date">` |
| `<textarea>` | `<ion-textarea>` |
| a `<label><input type="checkbox" class="sr-only">` toggle hack | `<ion-toggle>` |
| a manually-toggled button pair acting as tabs | `<ion-segment>` / `<ion-segment-button>` |

The gotcha this creates: Ionic components render their visible surface inside shadow DOM, so a
plain CSS class that painted a raw `<button>` (`background`, `border`, `border-radius`, `padding`)
won't reach the Ionic version's actual paintable surface — it has to go through the component's
documented CSS custom properties instead (`--background`, `--border-radius`, `--padding-start`,
etc.), scoped to the same class name as before. Properties that are natively *inherited* CSS
(`color`, `font-size`, `font-weight`) still cascade through the shadow boundary and don't need a
`--` var. For layout that Ionic's CSS vars don't expose (e.g. arranging a button's projected
content as a column instead of a row), use `::part(native)` — see `.cat-btn` in
`feedback-modal.css` or `.tool-tile` in `tools.css` for worked examples. When the same class is
shared between a real `<a>`/anchor and an `<ion-button>` styled to match it (a common pattern for
link-styled action rows), define both the plain CSS property and its `--` var equivalent on the
same rule — see `.legal-link` in `home.css` or `.legal-footer-link` in `tools.css`. Events also
change name: native `(input)`/`(change)` become `(ionInput)`/`(ionChange)`, and the payload is
`event.detail` (e.g. `.value` or `.checked`), not `event.target` — type the handler as
`CustomEvent<{ value?: string | null }>` (or the relevant detail shape), not `any`.

Component-body text (`<p>`, `<span>`, `<label>`, `<strong>`) and generic layout containers
(`<div>`) have no Ionic equivalent and should stay as plain HTML — this rule is about interactive
form/action controls, not everything in a template.

## 17. Animations & Assets
Prefer CSS keyframes/transitions (see `.animate-fade-in` in `styles.css`) over `@angular/animations`
to keep the shipped bundle lean — bundle size matters more here than on a desktop web app, since
users download this over a mobile connection via Play Store.

## 18. Strict Template Diagnostics
`tsconfig.json` already sets `strictInjectionParameters` and `strictInputAccessModifiers` in
`angularCompilerOptions` — keep these enabled; don't relax them to work around a template error,
fix the underlying type issue instead.

## 19. Mandatory File Structure
Every component gets its own `.ts`, `.html`, `.css`, and `.spec.ts` — no inline templates or
inline styles in the `.ts` file. This matches the existing convention throughout
`src/app/pages/**` and `src/app/shared/**`; keep it for every new component.

## 20. No Hardcoded Values in TypeScript
API endpoints (OpenRouter URL, exchange-rate API), model ids, magic thresholds, and status
strings belong in `const`s/enums — ideally in `src/constants/` once that folder has content —
not inlined ad hoc in a service. Hardcoded display strings in `.html` templates are fine.
