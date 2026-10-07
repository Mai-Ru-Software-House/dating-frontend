/**
 * datePicker.ts
 * The date the mocked date picker returns when a test presses "Choose test date".
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */

let picked = new Date(2000, 0, 1, 12);

/**
 * Sets the date the next pick returns.
 * @param wire The date as YYYY-MM-DD.
 */
export function setPickedDate(wire: string): void {
  const [year, month, day] = wire.split("-").map(Number);
  picked = new Date(year, month - 1, day, 12);
}

/**
 * The date the picker returns.
 * @returns The picked date, at noon local time.
 */
export function pickedDate(): Date {
  return picked;
}
