/**
 * layout.ts
 * Layout limits and helpers that make every screen fit any device (design.md 2.6). The helpers are
 * pure functions fed by useWindowDimensions(), so they update on rotation and split screen.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { GUTTER } from "./spacing";

/** Widest content column on tablets and in landscape. */
export const MAX_CONTENT_WIDTH = 600;

/** Widest confirmation dialog. */
export const MAX_DIALOG_WIDTH = 360;

/** Space kept on each side of a dialog (screen width minus 80). */
const DIALOG_SIDE_SPACE = 40;

/** Match card proportion from design 07 (353 × 330) and its height cap. */
const MATCH_CARD_RATIO = 353 / 330;
const MATCH_CARD_MAX_HEIGHT = 420;

/** Photo sizing on the candidate profile (09) and the own profile (19). */
export const CANDIDATE_PHOTO = { share: 0.5, maxRatio: 1.1 } as const;
export const PROFILE_PHOTO = { share: 0.4, maxRatio: 0.9 } as const;

/** How far the profile sheet overlaps the photo above it. */
export const SHEET_OVERLAP = 28;

/** A window size in points. */
export interface WindowSize {
  width: number;
  height: number;
}

/** Style for the centered content column (width 100 %, at most 600, centered). */
export const columnStyle = {
  width: "100%",
  maxWidth: MAX_CONTENT_WIDTH,
  alignSelf: "center",
} as const;

/**
 * Height of a full-bleed photo that scales with the window.
 * @param window The window size.
 * @param share Share of the window height the photo takes (0.5 = half).
 * @param maxRatio Cap as a multiple of the window width.
 * @returns The photo height in points.
 */
export function heroHeight(window: WindowSize, share: number, maxRatio: number): number {
  return Math.min(window.height * share, window.width * maxRatio);
}

/**
 * Width of the content column inside the gutters.
 * @param windowWidth The window width in points.
 * @returns The window width minus both gutters, at most MAX_CONTENT_WIDTH.
 */
export function contentWidth(windowWidth: number): number {
  return Math.min(windowWidth - 2 * GUTTER, MAX_CONTENT_WIDTH);
}

/**
 * Height of the top match card, keeping the design's proportion.
 * @param width The card width (the content column width).
 * @returns The card height, at most 420.
 */
export function matchCardHeight(width: number): number {
  return Math.min(width / MATCH_CARD_RATIO, MATCH_CARD_MAX_HEIGHT);
}

/**
 * Width of a confirmation dialog.
 * @param windowWidth The window width in points.
 * @returns The window width minus 80, at most MAX_DIALOG_WIDTH.
 */
export function dialogWidth(windowWidth: number): number {
  return Math.min(windowWidth - 2 * DIALOG_SIDE_SPACE, MAX_DIALOG_WIDTH);
}
