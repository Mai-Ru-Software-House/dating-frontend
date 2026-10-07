/**
 * slider.ts
 * Slider math: values stay inside the ends, move in steps of 1, and the two knobs of a range never
 * cross (design.md 3.5).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */

/**
 * Keeps a value inside two ends.
 * @param value Any number.
 * @param min Lower end.
 * @param max Upper end.
 * @returns The value, clamped.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * The value under a knob at a horizontal offset along the track, in steps of 1.
 * @param offset Distance from the track's start in points.
 * @param trackWidth Usable track width in points.
 * @param min Lower end.
 * @param max Upper end.
 * @returns The whole value, clamped.
 */
export function valueAt(offset: number, trackWidth: number, min: number, max: number): number {
  if (trackWidth <= 0) {
    return min;
  }
  return clamp(Math.round(min + (offset / trackWidth) * (max - min)), min, max);
}

/**
 * Where a value sits along the track.
 * @param value The value.
 * @param trackWidth Usable track width in points.
 * @param min Lower end.
 * @param max Upper end.
 * @returns The offset from the track's start in points.
 */
export function positionOf(value: number, trackWidth: number, min: number, max: number): number {
  if (max === min) {
    return 0;
  }
  return ((clamp(value, min, max) - min) / (max - min)) * trackWidth;
}

/**
 * Moves the lower knob of a range; it stops at the upper knob.
 * @param range The current [low, high].
 * @param low The wanted lower value.
 * @param min The track's lower end.
 * @returns The new range.
 */
export function moveLow(
  range: readonly [number, number],
  low: number,
  min: number,
): [number, number] {
  return [clamp(Math.round(low), min, range[1]), range[1]];
}

/**
 * Moves the upper knob of a range; it stops at the lower knob.
 * @param range The current [low, high].
 * @param high The wanted upper value.
 * @param max The track's upper end.
 * @returns The new range.
 */
export function moveHigh(
  range: readonly [number, number],
  high: number,
  max: number,
): [number, number] {
  return [range[0], clamp(Math.round(high), range[0], max)];
}
