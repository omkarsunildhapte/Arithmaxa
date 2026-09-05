/**
 * The legal pages live on the marketing site (`arithmaxa-website`), not in
 * the app bundle — the in-app `privacy-policy`/`terms-of-service` page
 * components were removed in favour of these hosted copies, so there is now
 * exactly one copy of each document to keep current instead of two that
 * could drift apart. Every in-app legal link opens these URLs in the
 * system browser.
 *
 * Keep `WEBSITE_URL` in sync with `arithmaxa-website`'s `SITE_URL`
 * (`src/constants/constants.ts`) and the two paths below with that repo's
 * `app.routes.ts` — a typo here is a dead legal link, which is a Play Store
 * compliance problem, not just a broken hyperlink.
 */
export const WEBSITE_URL = 'https://arithmaxa.vernokasoftwaretechnology.com';

export const PRIVACY_POLICY_URL = `${WEBSITE_URL}/privacy-policy`;
export const TERMS_OF_SERVICE_URL = `${WEBSITE_URL}/terms-of-service`;

/**
 * Copy for the "Delete My Data" flow in the consent sheet. Kept here rather
 * than inline in the component so the wording that promises what gets
 * deleted stays next to the privacy-policy URLs it has to agree with.
 */
export const CLEAR_DATA_CONFIRM_MESSAGE = 'This will delete all locally stored Arithmaxa data including history, settings, and feedback. Continue?';
export const CLEAR_DATA_DONE_MESSAGE = 'All Arithmaxa data has been cleared from this device.';
