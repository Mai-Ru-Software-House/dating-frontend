/**
 * AboutYouStep.tsx
 * Create profile step 1 (design.md 6.4): display name, username with a live check, password with
 * confirmation, date of birth and gender.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useState } from "react";

import { ChipGroup } from "../../components/ChipGroup";
import { DateField } from "../../components/DateField";
import { TextField, type FieldTrailing } from "../../components/TextField";
import { MIN_AGE } from "../../constants/limits";
import { GENDERS, type Gender } from "../../constants/profile";
import { colors } from "../../theme";
import type { CreateProfileController } from "./useCreateProfile";

const GENDER_OPTIONS = GENDERS.map((g) => ({ value: g.value as Gender, label: g.label }));

/**
 * The username field's status text.
 * @param status The live check's status.
 * @returns "Available" in green, "Taken" in red, or nothing.
 */
function usernameTrailing(
  status: CreateProfileController["usernameStatus"],
): FieldTrailing | undefined {
  if (status === "available") {
    return { label: "Available", color: colors.ok };
  }
  if (status === "taken") {
    return { label: "Taken", color: colors.accent };
  }
  return undefined;
}

/**
 * Step 1: About you.
 * @param props.form The Create profile controller.
 * @returns The step's fields.
 */
export function AboutYouStep({ form }: { form: CreateProfileController }): React.JSX.Element {
  const { values, set, touch, errorFor, isSubmitting } = form;
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const showHide: FieldTrailing = {
    label: isPasswordShown ? "Hide" : "Show",
    onPress: () => setIsPasswordShown((shown) => !shown),
    accessibilityLabel: isPasswordShown ? "Hide password" : "Show password",
  };

  return (
    <>
      <TextField
        label="Display name"
        value={values.displayName}
        onChangeText={(text) => set("displayName", text)}
        onBlur={() => touch("displayName")}
        error={errorFor("displayName")}
        isLocked={isSubmitting}
      />
      <TextField
        label="Username"
        value={values.username}
        onChangeText={(text) => set("username", text)}
        onBlur={() => touch("username")}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="username"
        error={errorFor("username")}
        trailing={usernameTrailing(form.usernameStatus)}
        isLocked={isSubmitting}
      />
      <TextField
        label="Password"
        value={values.password}
        onChangeText={(text) => set("password", text)}
        onBlur={() => touch("password")}
        secureTextEntry={!isPasswordShown}
        autoCapitalize="none"
        textContentType="newPassword"
        error={errorFor("password")}
        trailing={showHide}
        isLocked={isSubmitting}
      />
      <TextField
        label="Confirm password"
        value={values.confirmPassword}
        onChangeText={(text) => set("confirmPassword", text)}
        onBlur={() => touch("confirmPassword")}
        secureTextEntry={!isPasswordShown}
        autoCapitalize="none"
        textContentType="newPassword"
        error={errorFor("confirmPassword")}
        isLocked={isSubmitting}
      />
      <DateField
        label="Date of birth"
        value={values.dateOfBirth}
        onChange={(wire) => {
          set("dateOfBirth", wire);
          touch("dateOfBirth");
        }}
        defaultYearsAgo={MIN_AGE}
        error={errorFor("dateOfBirth")}
        isLocked={isSubmitting}
      />
      <ChipGroup
        label="Gender"
        options={GENDER_OPTIONS}
        value={values.gender}
        onChange={(gender) => {
          set("gender", gender);
          touch("gender");
        }}
        error={errorFor("gender")}
        isDisabled={isSubmitting}
      />
    </>
  );
}
