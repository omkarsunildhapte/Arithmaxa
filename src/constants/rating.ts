/** Google Play listing for the app (see capacitor.config.ts's appId). */
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.arithmaxa.app';

/** Calculations performed before the rating prompt is first offered, and
 *  again after "Remind Me Later" each time. */
export const RATING_PROMPT_CALC_THRESHOLD = 15;

/**
 * localStorage keys backing the rating prompt.
 *
 * Renamed from the service-local STORAGE_KEY_* on the way here: these are
 * exported through the shared @constants barrel, where a name like
 * STORAGE_KEY_COUNT says nothing about which feature's count it holds.
 * The stored key strings are unchanged, so existing installs keep their
 * progress.
 *
 * The `arithmaxa` prefix is load-bearing: ConsentService.clearAllData()
 * wipes every localStorage key starting with it, so "Delete My Data" resets
 * the prompt along with everything else. A key without the prefix would
 * silently survive that.
 */
export const RATING_COUNT_KEY = 'arithmaxa_rating_calc_count';
export const RATING_NEXT_THRESHOLD_KEY = 'arithmaxa_rating_next_threshold';
export const RATING_DISMISSED_KEY = 'arithmaxa_rating_dismissed';
