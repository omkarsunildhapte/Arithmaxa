/**
 * Modal sheet height (as a fraction of viewport height, matching Ionic's
 * `initialBreakpoint`/`breakpoints` API) that each tool's modal opens to in
 * Tools' selectTool(). Most tools fit comfortably at the default; a tool
 * needing more room overrides it individually rather than the whole app
 * sharing one fixed height regardless of content.
 */
export const DEFAULT_TOOL_MODAL_BREAKPOINT = 0.6;
export const PERCENTAGE_CALC_MODAL_BREAKPOINT = 0.8;
export const AGE_CALC_MODAL_BREAKPOINT = 0.85;
export const DISCOUNT_CALC_MODAL_BREAKPOINT = 0.8;
export const CURRENCY_CONVERTER_MODAL_BREAKPOINT = 0.8;
export const BMI_CALC_MODAL_BREAKPOINT = 0.85;
