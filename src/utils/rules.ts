/**
 * rules.ts
 * Input rules the app checks for instant feedback, with the exact messages from
 * unit-test-plan.md 4.2. The server checks again and its answer wins.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import {
  AGE_SLIDER_MAX,
  DISTANCE_SLIDER_MAX,
  MESSAGE_MAX,
  MIN_AGE,
  NOTE_MAX,
  PASSWORD_MIN,
  USERNAME_MAX,
  USERNAME_MIN,
  USERNAME_PATTERN,
} from "../constants/limits";
import { ALL_GENDERS } from "../constants/profile";
import { ageOn, compareDates, parseWireDate, utcToday } from "./age";

/** Result of a rule. An empty message means "invalid, but nothing to show" (an empty input). */
export type RuleResult = { isValid: true } | { isValid: false; message: string };

/** A failed preferences rule names the field it is about. */
export type PreferencesResult =
  { isValid: true } | { isValid: false; field: string; message: string };

/** User-facing messages (unit-test-plan.md 4.2). */
export const MESSAGES = {
  usernameRequired: "Username is required.",
  usernameFormat: "Use 4 to 20 letters, numbers or underscores.",
  usernameTaken: "That username is already in use. Try another one.",
  password: "Use at least 8 characters, with at least one letter and one number.",
  passwordMismatch: "Passwords don't match.",
  displayNameRequired: "Display name is required.",
  dobFuture: "Date of birth can't be in the future.",
  dobTooYoung: "You must be at least 18 to use Mai Ru.",
  genderRequired: "Choose a gender.",
  photoRequired: "Add a profile photo to continue.",
  photoType: "Use a PNG, JPG or WebP photo.",
  photoSize: "Photo must be 1 MB or smaller.",
  photoSquare: "Photo must be square (same width and height).",
  messageTooLong: "Messages can be up to 1000 characters.",
  noteTooLong: "Notes can be up to 500 characters.",
  loginUsername: "Enter your username.",
  loginPassword: "Enter your password.",
} as const;

const VALID: RuleResult = { isValid: true };

/**
 * Builds a failed result.
 * @param message The message to show ("" for none).
 * @returns The failed result.
 */
function invalid(message: string): RuleResult {
  return { isValid: false, message };
}

/**
 * Username: 4 to 20 of A–Z, a–z, 0–9 and underscore (A1).
 * @param value The typed username.
 * @returns The result.
 */
export function usernameRule(value: string): RuleResult {
  if (value.trim() === "") {
    return invalid(MESSAGES.usernameRequired);
  }
  const isRightLength = value.length >= USERNAME_MIN && value.length <= USERNAME_MAX;
  return isRightLength && USERNAME_PATTERN.test(value) ? VALID : invalid(MESSAGES.usernameFormat);
}

/**
 * Password: at least 8 characters with at least one letter and one digit (A2).
 * @param value The typed password.
 * @returns The result.
 */
export function passwordRule(value: string): RuleResult {
  const isLongEnough = value.length >= PASSWORD_MIN;
  const hasLetter = /[A-Za-z]/.test(value);
  const hasDigit = /[0-9]/.test(value);
  return isLongEnough && hasLetter && hasDigit ? VALID : invalid(MESSAGES.password);
}

/**
 * Confirm password must equal the password.
 * @param password The password.
 * @param confirm The confirmation.
 * @returns The result.
 */
export function confirmPasswordRule(password: string, confirm: string): RuleResult {
  return password === confirm ? VALID : invalid(MESSAGES.passwordMismatch);
}

/**
 * Display name: not empty after trimming. Saved exactly as typed.
 * @param value The typed name.
 * @returns The result.
 */
export function displayNameRule(value: string): RuleResult {
  return value.trim() === "" ? invalid(MESSAGES.displayNameRequired) : VALID;
}

/**
 * Date of birth: a real date, not in the future, at least 18 today (A3, UTC date).
 * @param wire YYYY-MM-DD, or "" when not picked yet.
 * @param now The current time (default: the device clock).
 * @returns The result. An empty value fails with no message.
 */
export function dobRule(wire: string, now: Date = new Date()): RuleResult {
  const date = parseWireDate(wire);
  if (date === null) {
    return invalid("");
  }
  if (compareDates(date, utcToday(now)) > 0) {
    return invalid(MESSAGES.dobFuture);
  }
  const age = ageOn(wire, now) ?? 0;
  return age >= MIN_AGE ? VALID : invalid(MESSAGES.dobTooYoung);
}

/**
 * Gender: one must be chosen.
 * @param value The chosen value, or undefined.
 * @returns The result.
 */
export function genderRule(value: string | undefined | null): RuleResult {
  return value === undefined || value === null || value === ""
    ? invalid(MESSAGES.genderRequired)
    : VALID;
}

/**
 * Preferences: ages at least 18, min not above max, a radius above 0, at least one gender.
 * @param prefs The preferences.
 * @returns The result, naming the failing field as a dotted path.
 */
export function preferencesRule(prefs: {
  minAge: number;
  maxAge: number;
  targetGenders: readonly string[];
  radiusKm: number;
}): PreferencesResult {
  if (!Number.isInteger(prefs.minAge) || prefs.minAge < MIN_AGE) {
    return { isValid: false, field: "preferences.minAge", message: `Minimum age is ${MIN_AGE}.` };
  }
  if (!Number.isInteger(prefs.maxAge) || prefs.maxAge < prefs.minAge) {
    return {
      isValid: false,
      field: "preferences.maxAge",
      message: "The maximum age can't be below the minimum age.",
    };
  }
  if (!Number.isFinite(prefs.radiusKm) || prefs.radiusKm <= 0) {
    return { isValid: false, field: "preferences.radiusKm", message: "Choose a distance." };
  }
  const isKnown = prefs.targetGenders.every((g) => (ALL_GENDERS as string[]).includes(g));
  if (prefs.targetGenders.length === 0 || !isKnown) {
    return { isValid: false, field: "preferences.targetGenders", message: "Choose who to see." };
  }
  return { isValid: true };
}

/**
 * Checks a text against a length limit after trimming, counted with string.length.
 * @param text The typed text.
 * @param max The limit.
 * @param tooLong The message when over the limit.
 * @returns The result. Empty text fails with no message.
 */
function textRule(text: string, max: number, tooLong: string): RuleResult {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return invalid("");
  }
  return trimmed.length > max ? invalid(tooLong) : VALID;
}

/**
 * Message: 1 to 1000 characters after trimming (A6).
 * @param text The typed message.
 * @returns The result.
 */
export function messageRule(text: string): RuleResult {
  return textRule(text, MESSAGE_MAX, MESSAGES.messageTooLong);
}

/**
 * Note: 1 to 500 characters after trimming (A7).
 * @param text The typed note.
 * @returns The result.
 */
export function noteRule(text: string): RuleResult {
  return textRule(text, NOTE_MAX, MESSAGES.noteTooLong);
}

/**
 * Message of a failed result, or undefined when valid or silent.
 * @param result A rule result.
 * @returns The message to show, if any.
 */
export function ruleMessage(result: RuleResult): string | undefined {
  return result.isValid || result.message === "" ? undefined : result.message;
}

/** Slider ends re-exported for the rules' callers. */
export const PREFERENCE_BOUNDS = {
  minAge: MIN_AGE,
  maxAge: AGE_SLIDER_MAX,
  maxRadiusKm: DISTANCE_SLIDER_MAX,
} as const;
