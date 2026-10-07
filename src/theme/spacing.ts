/**
 * spacing.ts
 * Spacing, radii and fixed sizes from design.md 2.4.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */

/** Left and right screen padding. */
export const GUTTER = 20;

/** The spacing scale: use only these values. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Corner radii. Pills use half their height. */
export const radius = {
  small: 12,
  field: 14,
  card: 16,
  photoTile: 18,
  tile: 20,
  hero: 24,
  sheet: 28,
} as const;

/** Fixed control sizes in points. */
export const size = {
  button: 52,
  buttonSmall: 36,
  dialogButton: 44,
  input: 50,
  chip: 34,
  chipSmall: 28,
  listRow: 76,
  accountRow: 68,
  infoRow: 52,
  avatarRow: 52,
  tabBar: 50,
  topBar: 56,
  backButton: 40,
  icon: 24,
  iconSmall: 20,
  touch: 44,
  photoTile: 120,
  composerInput: 46,
} as const;

/** Stroke width of the line icons (design.md 2.5). */
export const ICON_STROKE = 1.8;

/** Opacity of a pressed control, and of a disabled one. */
export const PRESSED_OPACITY = 0.85;
export const DISABLED_OPACITY = 0.4;
