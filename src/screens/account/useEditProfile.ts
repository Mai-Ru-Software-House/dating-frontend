/**
 * useEditProfile.ts
 * State and Save behind Edit profile (design.md 6.17, api-integration.md 6.14): values start from
 * ['me']; Save uploads a new photo first, then PATCHes only the changed fields (preferences whole).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
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
 * The preferences as the form has them. A chip that was never picked keeps the saved genders.
 * @param me The saved profile.
 * @param v The form values.
 * @returns The preferences to send when any part changed.
 */
function preferencesOf(me: OwnProfile, v: EditValues): OwnProfile["preferences"] {
  return {
    minAge: v.minAge,
    maxAge: v.maxAge,
    radiusKm: v.radiusKm,
    targetGenders:
      v.targetChip === null ? me.preferences.targetGenders : chipToTargetGenders(v.targetChip),
  };
}

/**
 * Whether any preference differs from the saved ones.
 * @param prefs The preferences in the form.
 * @param saved The saved preferences.
 * @returns True when any part changed.
 */
function arePreferencesChanged(
  prefs: OwnProfile["preferences"],
  saved: OwnProfile["preferences"],
): boolean {
  return (
    prefs.minAge !== saved.minAge ||
    prefs.maxAge !== saved.maxAge ||
    prefs.radiusKm !== saved.radiusKm ||
    prefs.targetGenders.join() !== saved.targetGenders.join()
  );
}

/**
 * The PATCH body: only what changed; preferences whole when any part changed.
 * @param me The saved profile.
 * @param v The form values.
 * @returns The body (may be empty).
 */
export function changedFields(me: OwnProfile, v: EditValues): UpdateProfileBody {
  const body: UpdateProfileBody = {};
  if (v.displayName !== me.displayName) {
    body.displayName = v.displayName;
  }
  if (v.dateOfBirth !== me.dateOfBirth) {
    body.dateOfBirth = v.dateOfBirth;
  }
  if (v.gender !== me.gender) {
    body.gender = v.gender;
  }
  if (v.location.lat !== me.location.lat || v.location.lon !== me.location.lon) {
    body.location = v.location;
  }
  const prefs = preferencesOf(me, v);
  if (arePreferencesChanged(prefs, me.preferences)) {
    body.preferences = prefs;
  }
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

/** How a failed Save shows: new field errors (null leaves them as they are) and the banner. */
interface SaveFailure {
  serverErrors: FormErrors | null;
  banner: string | null;
}

/**
 * Decides how a failed Save shows.
 * @param error What Save threw.
 * @param isPhotoSaved Whether the photo was saved before the other changes failed.
 * @returns The field errors to set and the banner text.
 */
function describeSaveFailure(error: unknown, isPhotoSaved: boolean): SaveFailure {
  const apiError = toApiError(error);
  const target = apiError.field ? SERVER_FIELDS[normalizeField(apiError.field)] : undefined;
  let serverErrors: FormErrors | null = null;
  if (apiError.code === "GEOCODER_UNAVAILABLE") {
    serverErrors = { location: ERROR_COPY.GEOCODER_UNAVAILABLE };
  } else if (apiError.code === "INVALID_INPUT" && target !== undefined) {
    serverErrors = { [target]: apiError.message || ERROR_COPY.INVALID_INPUT };
  }
  if (isPhotoSaved) {
    return {
      serverErrors,
      banner: "Your photo was saved, but your other changes weren't. Try again.",
    };
  }
  return { serverErrors, banner: target ? null : messageFor(apiError) };
}

/**
 * Sends the changes: the new photo first, then the changed fields.
 * @param queryClient The query client, to update the cached profile and refresh the lists.
 * @param photo The new photo, if one was picked.
 * @param body The changed fields (may be empty).
 * @param onPhotoSaved Called once the photo is saved, before the other changes are sent.
 * @returns After everything is saved.
 * @throws ApiError when the photo upload or the PATCH fails.
 */
async function saveChanges(
  queryClient: QueryClient,
  photo: PickedPhoto | null,
  body: UpdateProfileBody,
  onPhotoSaved: () => void,
): Promise<void> {
  if (photo !== null) {
    const { photoUrl } = await photosApi.replaceMine(photo);
    queryClient.setQueryData<OwnProfile>(keys.me, (old) => (old ? { ...old, photoUrl } : old));
    onPhotoSaved();
  }
  if (Object.keys(body).length > 0) {
    queryClient.setQueryData(keys.me, await profileApi.updateMe(body));
    if (body.preferences || body.location) {
      void queryClient.invalidateQueries({ queryKey: keys.recommendationsAll });
      void queryClient.invalidateQueries({ queryKey: keys.candidatesAll });
    }
  }
}

/**
 * Remembers which fields the user has left, so their messages may show.
 * @returns The touched fields and a function that marks one as touched.
 */
function useTouched(): [ReadonlySet<Field>, (key: Field) => void] {
  const [touched, setTouched] = useState<ReadonlySet<Field>>(new Set());
  return [
    touched,
    (key) => {
      setTouched((prev) => new Set(prev).add(key));
    },
  ];
}

/**
 * The message to show under a field: a server error first, else the client-side message once the
 * field was left.
 * @param key The field.
 * @param serverErrors Errors the server returned.
 * @param clientErrors Errors from the client-side checks.
 * @param touched The fields the user has left.
 * @returns The message, or undefined.
 */
function fieldMessage(
  key: Field,
  serverErrors: FormErrors,
  clientErrors: FormErrors,
  touched: ReadonlySet<Field>,
): string | undefined {
  return serverErrors[key] || (touched.has(key) ? clientErrors[key] || undefined : undefined);
}

/**
 * The Edit profile controller.
 * @param me The saved profile.
 * @returns The controller.
 */
export function useEditProfile(me: OwnProfile): EditProfileController {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<EditValues>(() => startFrom(me));
  const [touched, touch] = useTouched();
  const [serverErrors, setServerErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const clientErrors = errorsOf(aboutYouSchema(new Date()), values);
  const body = changedFields(me, values);

  const set = <K extends Field>(key: K, value: EditValues[K]): void => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setServerErrors((prev) => ({ ...prev, [key]: "" }));
    setBanner(null);
  };

  const save = async (): Promise<boolean> => {
    setIsSaving(true);
    setBanner(null);
    const progress = { isPhotoSaved: false };
    try {
      await saveChanges(queryClient, values.photo, body, () => {
        progress.isPhotoSaved = true;
        setValues((prev) => ({ ...prev, photo: null }));
      });
      return true;
    } catch (error) {
      const failure = describeSaveFailure(
        error,
        progress.isPhotoSaved && Object.keys(body).length > 0,
      );
      if (failure.serverErrors !== null) {
        setServerErrors(failure.serverErrors);
      }
      setBanner(failure.banner);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    values,
    set,
    touch,
    errorFor: (key) => fieldMessage(key, serverErrors, clientErrors, touched),
    isChanged: values.photo !== null || Object.keys(body).length > 0,
    isValid: Object.keys(clientErrors).length === 0,
    isSaving,
    banner,
    save,
  };
}
