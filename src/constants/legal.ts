/**
 * Single source of truth for the "last updated"/"effective" date shown on
 * both legal pages — previously hardcoded identically in privacy-policy.ts
 * and terms-of-service.ts, which could silently drift out of sync if only
 * one file was edited. Update this in one place when the policy text
 * actually changes.
 */
export const LEGAL_LAST_UPDATED = 'August 25, 2026';
