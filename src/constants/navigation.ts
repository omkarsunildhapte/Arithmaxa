/**
 * Hardware back-button behaviour on the app's root screens.
 *
 * Note this only runs at all because `@capacitor/app` is installed: Ionic's
 * `Platform.backButton` is fed by the Cordova-style `backbutton` document
 * event, and on Capacitor nothing dispatches that unless the App plugin is
 * present. Without it Android's default back closes the activity outright
 * and none of the code below is ever reached.
 */

/** Routes where back means "leave the app" rather than "go up a screen". */
export const ROOT_ROUTES = ['/', '/arithmaxa'];

/** How long the second back press has to arrive to count as a double-tap.
 *  Matches EXIT_TOAST_DURATION_MS so the window closes as the toast does —
 *  the toast is the only thing telling the user the window is open. */
export const EXIT_CONFIRM_WINDOW_MS = 2000;

export const EXIT_TOAST_MESSAGE = 'Press back again to exit';
export const EXIT_TOAST_DURATION_MS = 2000;

/** Styled globally in styles.css — Ionic renders toasts at the app root,
 *  outside any component's encapsulated CSS. */
export const EXIT_TOAST_CSS_CLASS = 'exit-toast';
