/**
 * EditProfileFields.tsx
 * The fields of Edit profile (design.md 6.17): photo, ABOUT YOU, PLACE and PREFERENCES. The state
 * lives in useEditProfile; this component only draws it.
 * Created by Tee (Kittiphon Kijpinyochai), 20 October 2026
 */
import { StyleSheet, View } from "react-native";

import type { OwnProfile } from "../../api/types";
import { ChipGroup } from "../../components/ChipGroup";
import { DateField } from "../../components/DateField";
import { LocationField } from "../../components/LocationField";
import { RangeSlider } from "../../components/RangeSlider";
import { SectionLabel } from "../../components/SectionLabel";
import { Slider } from "../../components/Slider";
import { TextField } from "../../components/TextField";
import {
  AGE_SLIDER_MAX,
  AGE_SLIDER_MIN,
  DISTANCE_SLIDER_MAX,
  DISTANCE_SLIDER_MIN,
  MIN_AGE,
} from "../../constants/limits";
import { GENDERS } from "../../constants/profile";
import type { LocationLookup } from "../../hooks/useLocationLookup";
import { space } from "../../theme";
import { EditPhotoSection } from "./EditPhotoSection";
import { kmLabel, TARGET_OPTIONS } from "./PreferencesStep";
import type { EditProfileController } from "./useEditProfile";

const GENDER_OPTIONS = GENDERS.map((g) => ({ value: g.value, label: g.label }));

/** Props for EditProfileFields. */
export interface EditProfileFieldsProps {
  /** The Edit profile controller. */
  form: EditProfileController;
  /** The saved profile (for the photo and the read-only username). */
  me: OwnProfile;
  /** The GPS lookup behind the Place field. */
  lookup: LocationLookup;
}

/**
 * The Edit profile fields.
 * @param props See EditProfileFieldsProps.
 * @returns The fields.
 */
export function EditProfileFields({ form, me, lookup }: EditProfileFieldsProps): React.JSX.Element {
  const { values, set, errorFor } = form;
  return (
    <>
      <EditPhotoSection
        userId={me.userId}
        photoUrl={me.photoUrl}
        picked={values.photo}
        onPick={(photo) => {
          set("photo", photo);
        }}
        error={errorFor("photo")}
        isLocked={form.isSaving}
      />
      <SectionLabel label="About you" />
      <TextField
        label="Username"
        value={me.username}
        isReadOnly
        helper="Usernames can't be changed."
      />
      <View style={styles.gap} />
      <TextField
        label="Display name"
        value={values.displayName}
        onChangeText={(t) => {
          set("displayName", t);
        }}
        onBlur={() => {
          form.touch("displayName");
        }}
        error={errorFor("displayName")}
        isLocked={form.isSaving}
      />
      <DateField
        label="Date of birth"
        value={values.dateOfBirth}
        onChange={(d) => {
          set("dateOfBirth", d);
          form.touch("dateOfBirth");
        }}
        defaultYearsAgo={MIN_AGE}
        error={errorFor("dateOfBirth")}
        isLocked={form.isSaving}
      />
      <ChipGroup
        label="Gender"
        options={GENDER_OPTIONS}
        value={values.gender}
        onChange={(g) => {
          set("gender", g);
        }}
        error={errorFor("gender")}
        isDisabled={form.isSaving}
      />
      <SectionLabel label="Place" />
      <LocationField
        lookup={lookup}
        coords={values.location}
        placeName={values.placeName}
        helper="Tap Use GPS if you've moved."
        error={errorFor("location")}
      />
      <SectionLabel label="Preferences" />
      <ChipGroup
        label="Interested in"
        options={TARGET_OPTIONS}
        value={values.targetChip}
        onChange={(c) => {
          set("targetChip", c);
        }}
        error={errorFor("targetChip")}
      />
      <RangeSlider
        label="Age range"
        min={AGE_SLIDER_MIN}
        max={AGE_SLIDER_MAX}
        value={[values.minAge, values.maxAge]}
        onChange={([low, high]) => {
          set("minAge", low);
          set("maxAge", high);
        }}
        lowLabel="Minimum age"
        highLabel="Maximum age"
      />
      <Slider
        label="Maximum distance"
        min={DISTANCE_SLIDER_MIN}
        max={DISTANCE_SLIDER_MAX}
        value={values.radiusKm}
        onChange={(km) => {
          set("radiusKm", km);
        }}
        format={kmLabel}
      />
    </>
  );
}

const styles = StyleSheet.create({
  gap: {
    height: space.xs,
  },
});
