/**
 * Chart design tokens.
 *
 * Categorical slots come from the validated default palette (slots 1, 2, 3 and
 * 7 - blue / orange / aqua / violet). That exact set was checked with the
 * palette validator under `--pairs all`, which is the right gate for a pie
 * because every slice is comparable with every other:
 *
 *   CVD separation      worst pair dE 9.2 (deutan)   >= 8 target   PASS
 *   Normal-vision floor worst pair dE 16.3           >= 15 floor   PASS
 *
 * The obvious slot 4 (yellow #eda100) fails that gate against orange
 * (normal-vision dE 13.7), which is why violet is used instead.
 *
 * Aqua sits below 3:1 contrast on a white surface, so the relief rule applies:
 * every chart here ships visible direct labels AND the dashboard table below
 * doubles as the table view. Identity is never carried by color alone.
 *
 * No dark-mode block on purpose: the surrounding app is light-only (slate-50
 * page, white cards). Flipping just the charts to dark on an OS dark setting
 * would leave them fighting the page around them. The dark steps of these same
 * hues are #3987e5 / #d95926 / #199e70 / #9085e9 when the app gains a dark theme.
 */

export const SERIES = ['#2a78d6', '#eb6834', '#1baf7a', '#4a3aa7']

// Single hue for magnitude comparison (visitor types).
export const MAGNITUDE = '#2a78d6'
export const MAGNITUDE_SOFT = '#dbe6ff'

export const INK = {
  primary: '#0f172a',
  secondary: '#52525b',
  muted: '#94a3b8',
  grid: '#e2e8f0',
  surface: '#ffffff',
}

/** Stable colour per category name, assigned in fixed order - never cycled. */
export function seriesColor(index) {
  return SERIES[index] || INK.muted
}
