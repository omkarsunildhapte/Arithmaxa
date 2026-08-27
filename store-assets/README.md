# Play Store assets

Listing artwork for **Arithmaxa** (`com.arithmaxa.app`).

## In this folder

| File | Spec required by Play | Actual |
| --- | --- | --- |
| `play-store-icon-512.png` | 512 × 512, 32-bit PNG, **no alpha** | 512 × 512 PNG, no alpha |
| `play-store-feature-graphic.png` | 1024 × 500, 24-bit PNG or JPEG, **no alpha** | 1024 × 500 PNG, no alpha |
| `screenshots/*.png` | 2–8 per type, 320–3840 px per side, longest side ≤ 2 × shortest | 8 × 1080 × 1920 (`bmi.png` 1080 × 1944) |

All three sets were checked against those specs and pass. Google applies its own
rounded mask to the icon — do not pre-round it, and do not add an alpha channel;
Play rejects icons that have one. Screenshots may keep alpha.

Screenshots cover: home, calculator, converter, currency, discount, bmi, history,
ai-chat.

## Still needed before submission

- **Short description** (80 chars) and **full description** (4000 chars).
- **Privacy policy URL** — Play requires a *publicly reachable* URL. The policy
  currently exists only as an in-app route (`/privacy`, see `app.routes.ts`),
  which does not satisfy this; it needs hosting somewhere public first.
- **Data safety form** — declare what the app collects and what leaves the device.
  Note that AI Chat's cloud path sends conversation content to `arithmaxa-backend`,
  which relays it to OpenRouter.
- **Advertising ID declaration** — answer **no**. The manifest strips the AD_ID and
  ad-services permissions Firebase Analytics injects (see `AndroidManifest.xml`),
  so the app requests no advertising identifier.

## Signing

`android/app/build.gradle` reads `android/keystore.properties`, which is
git-ignored. Create it as:

```properties
storeFile=../arithmaxa-release.jks
storePassword=...
keyAlias=arithmaxa
keyPassword=...
```

Without that file the release build still succeeds but is **unsigned** — Gradle
logs a warning rather than failing, so day-to-day development keeps working.

Generate the upload key once and back it up durably; losing it means losing the
ability to update the listing:

```bash
keytool -genkeypair -v -keystore arithmaxa-release.jks -keyalg RSA \
  -keysize 2048 -validity 10000 -alias arithmaxa
```

Build the upload artifact:

```bash
cd android && ./gradlew bundleRelease   # app/build/outputs/bundle/release/
```

Bump `versionCode` in `android/app/build.gradle` for every upload — Play rejects a
repeat. It is currently `1` / `1.0`.

## Verifying the release build

The merged manifest, not `AndroidManifest.xml` alone, is what Play sees — plugins
and SDKs inject their own permissions. After a release build:

```bash
grep -oE '<uses-permission[^>]*android:name="[^"]*"' \
  android/app/build/intermediates/merged_manifest/release/processReleaseMainManifest/AndroidManifest.xml
```

Expect **no** `AD_ID` and no `ACCESS_ADSERVICES_*` entries.

R8 is on for release (`minifyEnabled` + `shrinkResources`). Reflection-driven code
can only fail at runtime, so test a release build on a real device — not just a
debug one — before uploading.
