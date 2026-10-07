/**
 * createProfileSchema.ts
 * Create profile form values, one Zod schema per step (built from utils/rules.ts), and the map
 * from server fields to form fields (api-integration.md 4.3).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { z } from "zod";

import type { Coordinates, CreateProfileBody, PhotoUpload, PickedPhoto } from "../../api/types";
import { DEFAULT_MAX_AGE, DEFAULT_MIN_AGE, DEFAULT_RADIUS_KM } from "../../constants/limits";
import { chipToTargetGenders, type Gender, type TargetChip } from "../../constants/profile";
import { confirmPasswordRule, MESSAGES, passwordRule, usernameRule } from "../../utils/rules";
import { aboutYouSchema, addRule, errorsOf, type FormErrors } from "./profileFieldRules";

/** A picked photo and its temporary upload. */
export interface TempPhoto {
  local: PickedPhoto;
  upload: PhotoUpload;
}

/** Every value of the three steps. */
export interface CreateProfileForm {
  displayName: string;
  username: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender: Gender | null;
  photo: TempPhoto | null;
  location: Coordinates | null;
  placeName: string | null;
  targetChip: TargetChip;
  minAge: number;
  maxAge: number;
  radiusKm: number;
}

/** Starting values. */
export const EMPTY_FORM: CreateProfileForm = {
  displayName: "",
  username: "",
  password: "",
  confirmPassword: "",
  dateOfBirth: "",
  gender: null,
  photo: null,
  location: null,
  placeName: null,
  targetChip: "Women",
  minAge: DEFAULT_MIN_AGE,
  maxAge: DEFAULT_MAX_AGE,
  radiusKm: DEFAULT_RADIUS_KM,
};

/** Create profile step numbers. */
export type Step = 1 | 2 | 3;

/** Step labels for StepProgress and the step titles. */
export const STEP_TITLES = ["About you", "Photo & place", "Preferences"] as const;

/**
 * The checks for one step.
 * @param step The step.
 * @param values The form values.
 * @param now The current time, for the age check.
 * @returns The failing fields of that step.
 */
export function stepErrors(step: Step, values: CreateProfileForm, now: Date): FormErrors {
  if (step === 1) {
    const account = z
      .object({ username: z.string(), password: z.string(), confirmPassword: z.string() })
      .superRefine((v, ctx) => {
        addRule(ctx, "username", usernameRule(v.username));
        addRule(ctx, "password", passwordRule(v.password));
        addRule(ctx, "confirmPassword", confirmPasswordRule(v.password, v.confirmPassword));
      });
    return { ...errorsOf(aboutYouSchema(now), values), ...errorsOf(account, values) };
  }
  if (step === 2) {
    const errors: FormErrors = {};
    if (values.photo === null) {
      errors.photo = MESSAGES.photoRequired;
    }
    if (values.location === null) {
      errors.location = "";
    }
    return errors;
  }
  return {};
}

/** Server field (dotted path) to form field. */
const SERVER_FIELDS: Record<string, keyof CreateProfileForm> = {
  displayName: "displayName",
  username: "username",
  password: "password",
  dateOfBirth: "dateOfBirth",
  gender: "gender",
  photoUploadId: "photo",
  location: "location",
  "location.lat": "location",
  "location.lon": "location",
  "preferences.minAge": "minAge",
  "preferences.maxAge": "maxAge",
  "preferences.radiusKm": "radiusKm",
  "preferences.targetGenders": "targetChip",
};

/**
 * The form field a server error is about.
 * @param field The error's field, without a list index.
 * @returns The form field, or null when unknown.
 */
export function formFieldFor(field: string): keyof CreateProfileForm | null {
  return SERVER_FIELDS[field] ?? null;
}

/**
 * Builds the POST /users body. The confirmation is never sent.
 * @param values Complete form values.
 * @returns The body, or null when the photo or location is missing.
 */
export function toCreateBody(values: CreateProfileForm): CreateProfileBody | null {
  if (values.photo === null || values.location === null || values.gender === null) {
    return null;
  }
  return {
    username: values.username,
    password: values.password,
    displayName: values.displayName,
    dateOfBirth: values.dateOfBirth,
    gender: values.gender,
    location: values.location,
    photoUploadId: values.photo.upload.uploadId,
    preferences: {
      minAge: values.minAge,
      maxAge: values.maxAge,
      targetGenders: chipToTargetGenders(values.targetChip),
      radiusKm: values.radiusKm,
    },
  };
}
