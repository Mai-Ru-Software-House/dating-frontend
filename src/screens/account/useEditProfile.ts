/**
 * useEditProfile.ts
 * State and Save behind Edit profile (design.md 6.17, api-integration.md 6.14): values start from
 * ['me']; Save uploads a new photo first, then PATCHes only the changed fields (preferences whole).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { ERROR_COPY, messageFor, normalizeField, toApiError } from "../../api/errors";
import { photosApi } from "../../api/photos";
import { profileApi } from "../../api/profile";
import type { Coordinates, OwnProfile, PickedPhoto, UpdateProfileBody } from "../../api/types";
import {
  chipToTargetGenders,
  targetGendersToChip,
  type Gender,
  type TargetChip,
} from "../../constants/profile";
import { keys } from "../../session/queryClient";
import { aboutYouSchema, errorsOf, type FormErrors } from "./profileFieldRules";

/** Every editable value. */
export interface EditValues {
  displayName: string;
  dateOfBirth: string;
  gender: Gender;
  location: Coordinates;
  placeName: string | null;
  targetChip: TargetChip | null;
  minAge: number;
  maxAge: number;
  radiusKm: number;
  photo: PickedPhoto | null;
}

type Field = keyof EditValues;

/** What the screen uses. */
export interface EditProfileController {
  values: EditValues;
  set: <K extends Field>(key: K, value: EditValues[K]) => void;
  touch: (key: Field) => void;
  errorFor: (key: Field) => string | undefined;
  isChanged: boolean;
  isValid: boolean;
  isSaving: boolean;
  banner: string | null;
  /** Saves; resolves true on success. */
  save: () => Promise<boolean>;
}

/**
 * Starting values from the profile.
 * @param me The own profile.
 * @returns The form values.
 */
function startFrom(me: OwnProfile): EditValues {
  return {
    displayName: me.displayName,
    dateOfBirth: me.dateOfBirth,
    gender: me.gender,
    location: me.location,
    placeName: me.placeName,
    targetChip: targetGendersToChip(me.preferences.targetGenders),
    minAge: me.preferences.minAge,
    maxAge: me.preferences.maxAge,
    radiusKm: me.preferences.radiusKm,
    photo: null,
  };
}

/**
 * The PATCH body: only what changed; preferences whole when any part changed.
 * @param me The saved profile.
 * @param v The form values.
 * @returns The body (may be empty).
 */
export function changedFields(me: OwnProfile, v: EditValues): UpdateProfileBody {
  const body: UpdateProfileBody = {};
  if (v.displayName !== me.displayName) body.displayName = v.displayName;
  if (v.dateOfBirth !== me.dateOfBirth) body.dateOfBirth = v.dateOfBirth;
  if (v.gender !== me.gender) body.gender = v.gender;
  if (v.location.lat !== me.location.lat || v.location.lon !== me.location.lon)
    body.location = v.location;
  const prefs = {
    minAge: v.minAge,
    maxAge: v.maxAge,
    radiusKm: v.radiusKm,
    targetGenders:
      v.targetChip === null ? me.preferences.targetGenders : chipToTargetGenders(v.targetChip),
  };
  const p = me.preferences;
  const isPrefsChanged =
    prefs.minAge !== p.minAge ||
    prefs.maxAge !== p.maxAge ||
    prefs.radiusKm !== p.radiusKm ||
    prefs.targetGenders.join() !== p.targetGenders.join();
  if (isPrefsChanged) body.preferences = prefs;
  return body;
}

const SERVER_FIELDS: Record<string, Field> = {
  displayName: "displayName",
  dateOfBirth: "dateOfBirth",
  gender: "gender",
  location: "location",
  "location.lat": "location",
  "location.lon": "location",
  "preferences.minAge": "minAge",
  "preferences.maxAge": "maxAge",
  "preferences.radiusKm": "radiusKm",
  "preferences.targetGenders": "targetChip",
  photo: "photo",
};

/**
 * The Edit profile controller.
 * @param me The saved profile.
 * @returns The controller.
 */
export function useEditProfile(me: OwnProfile): EditProfileController {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<EditValues>(() => startFrom(me));
  const [touched, setTouched] = useState<ReadonlySet<Field>>(new Set());
  const [serverErrors, setServerErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const clientErrors = errorsOf(aboutYouSchema(new Date()), values);
  const body = changedFields(me, values);
  const isChanged = values.photo !== null || Object.keys(body).length > 0;

  const set = <K extends Field>(key: K, value: EditValues[K]): void => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setServerErrors((prev) => ({ ...prev, [key]: "" }));
    setBanner(null);
  };
  const errorFor = (key: Field): string | undefined =>
    serverErrors[key] || (touched.has(key) ? clientErrors[key] || undefined : undefined);

  const showError = (error: unknown, isPhotoSaved: boolean): void => {
    const apiError = toApiError(error);
    const target = apiError.field ? SERVER_FIELDS[normalizeField(apiError.field)] : undefined;
    if (apiError.code === "GEOCODER_UNAVAILABLE") {
      setServerErrors({ location: ERROR_COPY.GEOCODER_UNAVAILABLE });
    } else if (apiError.code === "INVALID_INPUT" && target !== undefined) {
      setServerErrors({ [target]: apiError.message || ERROR_COPY.INVALID_INPUT });
    }
    setBanner(
      isPhotoSaved
        ? "Your photo was saved, but your other changes weren't. Try again."
        : target
          ? null
          : messageFor(apiError),
    );
  };

  const save = async (): Promise<boolean> => {
    setIsSaving(true);
    setBanner(null);
    let isPhotoSaved = false;
    try {
      if (values.photo !== null) {
        const { photoUrl } = await photosApi.replaceMine(values.photo);
        queryClient.setQueryData<OwnProfile>(keys.me, (old) => (old ? { ...old, photoUrl } : old));
        isPhotoSaved = true;
        setValues((prev) => ({ ...prev, photo: null }));
      }
      if (Object.keys(body).length > 0) {
        queryClient.setQueryData(keys.me, await profileApi.updateMe(body));
        if (body.preferences || body.location) {
          void queryClient.invalidateQueries({ queryKey: keys.recommendationsAll });
          void queryClient.invalidateQueries({ queryKey: keys.candidatesAll });
        }
      }
      return true;
    } catch (error) {
      showError(error, isPhotoSaved && Object.keys(body).length > 0);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    values,
    set,
    touch: (key) => setTouched((prev) => new Set(prev).add(key)),
    errorFor,
    isChanged,
    isValid: Object.keys(clientErrors).length === 0,
    isSaving,
    banner,
    save,
  };
}
