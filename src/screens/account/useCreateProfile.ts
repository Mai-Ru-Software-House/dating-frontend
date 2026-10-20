/**
 * useCreateProfile.ts
 * State and actions behind Create profile (design.md 6.3): one form for all three steps, which
 * fields have been touched, which steps the user tried to leave, server errors, and Submit.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useState } from "react";
import { useForm, useWatch, type UseFormReturn } from "react-hook-form";

import { ERROR_COPY } from "../../api/errors";
import { photosApi } from "../../api/photos";
import { LAST_PROFILE_STEP } from "../../constants/limits";
import { useUsernameCheck, type UsernameStatus } from "../../hooks/useUsernameCheck";
import { useSession } from "../../session/SessionProvider";
import { MESSAGES } from "../../utils/rules";
import { createAccount, describeFailure, type ServerFailure } from "./createAccount";
import {
  EMPTY_FORM,
  stepErrors,
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
 * The current step, and the steps the user tried to leave while they were not valid.
 * @returns The step, the tried steps, and the actions that change them.
 */
function useStepState(): {
  step: Step;
  attempted: ReadonlySet<Step>;
  setStep: (step: Step) => void;
  markAttempted: () => void;
  advance: () => void;
  back: () => void;
} {
  const [step, setStep] = useState<Step>(1);
  const [attempted, setAttempted] = useState<ReadonlySet<Step>>(new Set());
  return {
    step,
    attempted,
    setStep,
    markAttempted: () => {
      setAttempted((prev) => new Set(prev).add(step));
    },
    advance: () => {
      setStep((s) => (s < LAST_PROFILE_STEP ? ((s + 1) as Step) : s));
    },
    back: () => {
      setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
    },
  };
}

/**
 * The message to show under a field: the server's first, then the username-taken hint, then the
 * client-side message once the field was left or the step was tried.
 * @param serverMessage The server error set on the field, if any.
 * @param clientMessage The client-side message for the field, if any.
 * @param isTakenUsername Whether this is the username field and the name is taken.
 * @param isShown Whether the field was touched or the step was tried.
 * @returns The message, or undefined.
 */
function fieldMessage(
  serverMessage: string | undefined,
  clientMessage: string | undefined,
  isTakenUsername: boolean,
  isShown: boolean,
): string | undefined {
  if (serverMessage) {
    return serverMessage;
  }
  if (isTakenUsername) {
    return MESSAGES.usernameTaken;
  }
  return clientMessage && isShown ? clientMessage : undefined;
}

/**
 * Shows a server error where it belongs and jumps to the step that owns it.
 * @param form The form, to set the field error on.
 * @param failure Where the error shows.
 * @param setStep Jumps to a step.
 * @param setBanner Sets the banner text.
 */
function showFailure(
  form: UseFormReturn<CreateProfileForm>,
  failure: ServerFailure,
  setStep: (step: Step) => void,
  setBanner: (message: string) => void,
): void {
  if (failure.kind === "username") {
    form.setError("username", { message: ERROR_COPY.USERNAME_TAKEN });
    setStep(1);
  } else if (failure.kind === "field") {
    form.setError(failure.field, { message: failure.message });
    setStep(failure.step);
  } else {
    setBanner(failure.message);
  }
}

/**
 * Deletes the temporary photo upload. Failures are ignored: unused uploads expire on their own
 * (api-integration.md 6.2).
 * @param photo The photo, if one was chosen.
 * @returns After the delete was tried.
 */
async function discardTempPhoto(photo: TempPhoto | null): Promise<void> {
  try {
    if (photo !== null) {
      await photosApi.deleteTemp(photo.upload);
    }
  } catch {
    // Unused uploads expire on their own.
  }
}

/**
 * Submit and its server errors: sends the form, shows a failure where it belongs, and keeps the
 * banner and the busy flag.
 * @param form The form.
 * @param values The current form values.
 * @param step The current step's validity, what Submit does when the step is not valid, and how to jump to a step.
 * @param step.isStepValid Whether the current step passes its checks.
 * @param step.next Moves on, or marks the step as tried.
 * @param step.setStep Jumps to a step (to the one that owns a server error).
 * @returns The banner, whether Submit is running, and Submit itself.
 */
function useSubmit(
  form: UseFormReturn<CreateProfileForm>,
  values: CreateProfileForm,
  step: { isStepValid: boolean; next: () => void; setStep: (step: Step) => void },
): {
  banner: string | null;
  clearBanner: () => void;
  isSubmitting: boolean;
  submit: () => Promise<void>;
} {
  const session = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const submit = async (): Promise<void> => {
    if (values.photo === null || !step.isStepValid) {
      step.next();
      return;
    }
    setIsSubmitting(true);
    setBanner(null);
    try {
      await createAccount(values, values.photo, session, (photo) => {
        form.setValue("photo", photo);
      });
    } catch (error) {
      showFailure(form, describeFailure(error), step.setStep, setBanner);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    banner,
    clearBanner: () => {
      setBanner(null);
    },
    isSubmitting,
    submit,
  };
}

/**
 * The Create profile controller.
 * @returns The controller.
 */
export function useCreateProfile(): CreateProfileController {
  const form = useForm<CreateProfileForm>({ defaultValues: EMPTY_FORM });
  const values = useWatch({ control: form.control, defaultValue: EMPTY_FORM }) as CreateProfileForm;
  const { step, attempted, setStep, markAttempted, advance, back } = useStepState();
  const [touched, setTouched] = useState<ReadonlySet<Field>>(new Set());
  const usernameStatus = useUsernameCheck(values.username);

  const clientErrors = stepErrors(step, values, new Date());
  const isTaken = step === 1 && usernameStatus === "taken";
  const isStepValid = Object.keys(clientErrors).length === 0 && !isTaken;

  const next = (): void => {
    if (isStepValid) {
      advance();
    } else {
      markAttempted();
    }
  };

  const { banner, clearBanner, isSubmitting, submit } = useSubmit(form, values, {
    isStepValid,
    next,
    setStep,
  });

  return {
    step,
    values,
    set: (key, value) => {
      form.setValue(key, value as never);
      form.clearErrors(key);
      clearBanner();
    },
    touch: (key) => {
      setTouched((prev) => new Set(prev).add(key));
    },
    errorFor: (key) =>
      fieldMessage(
        form.formState.errors[key]?.message,
        clientErrors[key],
        key === "username" && isTaken,
        touched.has(key) || attempted.has(step),
      ),
    isStepValid,
    usernameStatus,
    isSubmitting,
    banner,
    next,
    back,
    submit,
    discardPhoto: () => discardTempPhoto(form.getValues("photo")),
  };
}
