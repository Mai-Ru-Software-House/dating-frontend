/**
 * useCreateProfile.ts
 * State and actions behind Create profile (design.md 6.3): one form for all three steps, which
 * fields have been touched, which steps the user tried to leave, server errors, and Submit.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { ERROR_COPY, messageFor, normalizeField, stepForField, toApiError } from "../../api/errors";
import { photosApi } from "../../api/photos";
import { profileApi } from "../../api/profile";
import { UPLOAD_REFRESH_MARGIN_MS } from "../../constants/limits";
import { useUsernameCheck, type UsernameStatus } from "../../hooks/useUsernameCheck";
import { useSession } from "../../session/SessionProvider";
import { MESSAGES } from "../../utils/rules";
import {
  EMPTY_FORM,
  formFieldFor,
  stepErrors,
  toCreateBody,
  type CreateProfileForm,
  type Step,
  type TempPhoto,
} from "./createProfileSchema";

type Field = keyof CreateProfileForm;

/** What the steps and the frame use. */
export interface CreateProfileController {
  step: Step;
  values: CreateProfileForm;
  /** Sets a value and clears its server error. */
  set: <K extends Field>(key: K, value: CreateProfileForm[K]) => void;
  /** Marks a field as left, so its message may show. */
  touch: (key: Field) => void;
  /** The message to show under a field, if any. */
  errorFor: (key: Field) => string | undefined;
  /** Whether the current step passes its checks. */
  isStepValid: boolean;
  usernameStatus: UsernameStatus;
  isSubmitting: boolean;
  /** Form-level error for the banner. */
  banner: string | null;
  /** Moves on, or marks the step as tried when it is not valid. */
  next: () => void;
  /** Goes back one step. */
  back: () => void;
  /** Sends POST /users and logs in. */
  submit: () => Promise<void>;
  /** Deletes the temporary photo (on discard). */
  discardPhoto: () => Promise<void>;
}

/**
 * Re-uploads the photo when its temporary upload is about to expire.
 * @param photo The current photo.
 * @returns The photo with a fresh upload when needed.
 * @throws ApiError when the upload fails.
 */
async function freshPhoto(photo: TempPhoto): Promise<TempPhoto> {
  const expiresIn = Date.parse(photo.upload.expiresAt) - Date.now();
  if (expiresIn > UPLOAD_REFRESH_MARGIN_MS) {
    return photo;
  }
  return { local: photo.local, upload: await photosApi.uploadTemp(photo.local) };
}

/**
 * The Create profile controller.
 * @returns The controller.
 */
export function useCreateProfile(): CreateProfileController {
  const session = useSession();
  const form = useForm<CreateProfileForm>({ defaultValues: EMPTY_FORM });
  const values = useWatch({ control: form.control, defaultValue: EMPTY_FORM }) as CreateProfileForm;
  const [step, setStep] = useState<Step>(1);
  const [touched, setTouched] = useState<ReadonlySet<Field>>(new Set());
  const [attempted, setAttempted] = useState<ReadonlySet<Step>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const usernameStatus = useUsernameCheck(values.username);

  const now = new Date();
  const clientErrors = stepErrors(step, values, now);
  const isTaken = step === 1 && usernameStatus === "taken";
  const isStepValid = Object.keys(clientErrors).length === 0 && !isTaken;

  const set = <K extends Field>(key: K, value: CreateProfileForm[K]): void => {
    form.setValue(key, value as never);
    form.clearErrors(key);
    setBanner(null);
  };
  const touch = (key: Field): void => setTouched((prev) => new Set(prev).add(key));
  const errorFor = (key: Field): string | undefined => {
    const server = form.formState.errors[key]?.message;
    if (server) {
      return server;
    }
    if (key === "username" && isTaken) {
      return MESSAGES.usernameTaken;
    }
    const client = clientErrors[key];
    const mayShow = touched.has(key) || attempted.has(step);
    return client && mayShow ? client : undefined;
  };
  const next = (): void => {
    if (!isStepValid) {
      setAttempted((prev) => new Set(prev).add(step));
      return;
    }
    setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  };
  const back = (): void => setStep((s) => (s > 1 ? ((s - 1) as Step) : s));

  const showServerError = (error: unknown): void => {
    const apiError = toApiError(error);
    const field = apiError.field === undefined ? null : normalizeField(apiError.field);
    const target = field === null ? null : formFieldFor(field);
    const owner = stepForField(field ?? undefined);
    if (apiError.code === "USERNAME_TAKEN") {
      form.setError("username", { message: ERROR_COPY.USERNAME_TAKEN });
      setStep(1);
    } else if (apiError.code === "INVALID_INPUT" && target !== null && owner !== null) {
      form.setError(target, { message: apiError.message || ERROR_COPY.INVALID_INPUT });
      setStep(owner);
    } else {
      setBanner(messageFor(apiError));
    }
  };

  const submit = async (): Promise<void> => {
    if (values.photo === null || !isStepValid) {
      next();
      return;
    }
    setIsSubmitting(true);
    setBanner(null);
    try {
      let photo = await freshPhoto(values.photo);
      let body = toCreateBody({ ...values, photo });
      if (body === null) {
        return;
      }
      try {
        await session.logIn(await profileApi.createProfile(body));
        return;
      } catch (error) {
        const apiError = toApiError(error);
        if (apiError.code !== "INVALID_INPUT" || apiError.field !== "photoUploadId") {
          throw error;
        }
        photo = { local: photo.local, upload: await photosApi.uploadTemp(photo.local) };
        form.setValue("photo", photo);
        body = toCreateBody({ ...values, photo });
        if (body !== null) {
          await session.logIn(await profileApi.createProfile(body));
        }
      }
    } catch (error) {
      showServerError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const discardPhoto = async (): Promise<void> => {
    const photo = form.getValues("photo");
    if (photo === null) {
      return;
    }
    try {
      await photosApi.deleteTemp(photo.upload);
    } catch {
      // Unused uploads expire on their own (api-integration.md 6.2).
    }
  };

  return {
    step,
    values,
    set,
    touch,
    errorFor,
    isStepValid,
    usernameStatus,
    isSubmitting,
    banner,
    next,
    back,
    submit,
    discardPhoto,
  };
}
