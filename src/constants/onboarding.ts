import { OnboardingSlide } from '@appTypes/index';

/**
 * The first-run carousel's content. Copy rather than logic, so it lives here
 * instead of inside Home — the component only needs to know how many slides
 * there are and which one is showing (see its isLastSlide()), never what any
 * of them say.
 *
 * `htmlTitle` carries the line breaks the design calls for and is bound with
 * [innerHTML]; keep it escaped (&amp;, not &) since it is rendered as markup.
 * `title` is the plain-text version, used as the @for track key.
 */
// prettier-ignore
export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  { title: 'Basic Arithmetic', htmlTitle: 'Basic<br>Arithmetic', description: 'Perform essential mathematical operations with lightning speed and unmatched precision.' },
  { title: 'Occupational & Logic', htmlTitle: 'Occupational<br>&amp;<br>Logic', description: 'Handle complex logical grouping and advanced mathematical expressions with absolute ease.' },
  { title: 'Scientific Functions', htmlTitle: 'Scientific<br>Functions', description: 'Access high-level scientific functions: Logarithms, Trigonometry, and Power operations.' },
  { title: 'Calculation History', htmlTitle: 'Calculation<br>History', description: 'Never lose track of your work. Every result is stored and accessible at a single tap.' },
];
