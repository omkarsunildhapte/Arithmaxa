/**
 * DOM id of the static pre-bootstrap splash markup in index.html (the
 * `#app-splash` block, rendered before any Angular JS has run so it paints
 * on the very first frame). App.ngOnInit() removes it once Angular has
 * bootstrapped and app-root has real content to show.
 */
export const APP_SPLASH_ELEMENT_ID = 'app-splash';

/**
 * Class toggled on the splash element to trigger its fade-out transition.
 * Must match the `.app-splash--hide` selector in index.html.
 */
export const APP_SPLASH_HIDE_CLASS = 'app-splash--hide';

/**
 * Fade-out duration, in ms, before the splash element is removed from the
 * DOM. Must match the `transition` duration on `#app-splash` in index.html.
 */
export const APP_SPLASH_FADE_MS = 250;
