# Arithmaxa App — Release Readiness Rules (Play Store & Native)

These rules must be followed by all agents working on `arithmaxa-app`. For coding style and
architecture, see `frontend-rules.md`. This document is the mobile-app analog of a web project's
"SEO rules" — instead of search-crawler readiness, it covers Play Store listing readiness,
native permissions, and on-device performance. **Google Play is currently the only distribution
target** — do not add App Store–specific work (iOS-only permission strings, App Store Connect
metadata, etc.) unless the user explicitly asks; `capacitor add ios` support existing in the repo
does not mean iOS release work is in scope.

## 1. Permissions Must Match the Privacy Policy
Every native permission requested (currently: microphone, for AI Chat voice input) must have a
corresponding, accurate entry in `src/app/pages/privacy-policy/privacy-policy.html` — and in the
mirrored copy on `arithmaxa-website` (see `AGENTS.md`). Adding a new permission (camera, storage,
location, etc.) without updating both privacy policy copies first is a Play Store policy
violation risk, not just an oversight — do the policy-copy update in the same change.

## 2. Local-First Data Handling
The app's stated privacy posture is "calculations and history never leave your device" except
for two explicit, disclosed exceptions: AI Chat messages (sent to OpenRouter) and currency
exchange-rate lookups (sent to a financial data API). Any new feature that transmits
user-entered data to a third party must either avoid doing so, or be added as a new disclosed
exception in both privacy policy copies before merging.

## 3. Icon & Splash Asset Pipeline
Run `npm run assets` (`capacitor-assets generate --assetPath public`) after changing
`public/logo.png` or `public/onboarding/*` before running `android:run`/`ios:run` — stale
generated icons in `android/app/src/main/res` are a common source of "why didn't my icon
update" confusion. `arithmaxa-website` uses `public/logo.png` directly (nav, footer, hero,
favicon) rather than the generated `icons/icon-*.webp` launcher-icon sizes — if `logo.png`
changes, copy the updated file into the website's `public/logo.png` too so both stay in sync.

## 4. Offline-First Behavior
Core features (scientific calculator, unit/age/BMI/discount calculators, calculation history)
must work fully offline — they must never silently fail or spin forever waiting on a network
call. Only AI Chat and the currency converter's live-rate lookup require connectivity; both must
degrade gracefully (a clear "you're offline" state, not a hung request or an uncaught HTTP
error) rather than crashing or freezing the UI.

## 5. Accessibility & Tap Targets
This is a calculator — tap-target size and contrast matter more than on a typical content app.
Keypad buttons and any new interactive control must meet a minimum ~44×44dp tap target and
sufficient contrast against the dark theme background (`--brand-dark: #050505`).

## 6. Version Discipline
Bump `android/app/build.gradle`'s `versionCode`/`versionName` (and the equivalent iOS project
setting, if iOS is ever actually shipped) for every release build — never ship the same
`versionCode` twice to Google Play, it will be rejected outright.

## 7. Pre-Release Smoke Test
Before considering a build release-ready:
- [ ] `npm run build && npm run assets && npx cap sync android` completes without errors.
- [ ] App launches and the calculator performs a basic calculation correctly on-device/emulator.
- [ ] AI Chat and currency converter both handle the "no network" case without crashing.
- [ ] Privacy Policy and Terms of Service open correctly from within the app and match the
      hosted copies on `arithmaxa-website`.
- [ ] No new permission was added without a matching privacy policy update (Rule 1).
- [ ] `versionCode` was bumped (Rule 6).

## 8. Bundle Size
Watch APK size growth from new dependencies — this ships over a mobile connection via Play
Store, where install-conversion drops noticeably as download size grows. Prefer tree-shakable,
narrowly-scoped libraries; question any new dependency that pulls in more than a few dozen KB
for a small feature.
