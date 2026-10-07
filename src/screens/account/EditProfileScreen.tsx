/**
 * EditProfileScreen.tsx
 * Edit profile (design.md 6.17): one scrolling form with PHOTO, ABOUT YOU, PLACE and PREFERENCES.
 * Nothing is sent until Save; leaving with changes asks first. Behind FEATURES.editProfile.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { usePreventRemove, type NavigationAction } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import type { OwnProfile } from "../../api/types";
import { ActionBar } from "../../components/ActionBar";
import { Banner } from "../../components/Banner";
import { Button } from "../../components/Button";
import { ChipGroup } from "../../components/ChipGroup";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { DateField } from "../../components/DateField";
import { LocationField } from "../../components/LocationField";
import { RangeSlider } from "../../components/RangeSlider";
import { Screen } from "../../components/Screen";
import { SectionLabel } from "../../components/SectionLabel";
import { Slider } from "../../components/Slider";
import { TextField } from "../../components/TextField";
import { useToast } from "../../components/Toast";
import { TopBar } from "../../components/TopBar";
import {
  AGE_SLIDER_MAX,
  AGE_SLIDER_MIN,
  DISTANCE_SLIDER_MAX,
  DISTANCE_SLIDER_MIN,
  MIN_AGE,
} from "../../constants/limits";
import { GENDERS, type Gender } from "../../constants/profile";
import { useLocationLookup, type LocationFix } from "../../hooks/useLocationLookup";
import { useMe } from "../../hooks/useMe";
import type { RootScreenProps } from "../../navigation/types";
import { space } from "../../theme";
import { kmLabel, TARGET_OPTIONS } from "./PreferencesStep";
import { EditPhotoSection } from "./EditPhotoSection";
import { useEditProfile } from "./useEditProfile";

const GENDER_OPTIONS = GENDERS.map((g) => ({ value: g.value as Gender, label: g.label }));

/**
 * The Edit profile screen (waits for the cached profile).
 * @param props Navigation and route.
 * @returns The screen.
 */
export function EditProfileScreen(props: RootScreenProps<"EditProfile">): React.JSX.Element | null {
  const me = useMe().data;
  return me === undefined ? null : <EditProfileForm {...props} me={me} />;
}

/**
 * The form itself.
 * @param props Navigation and the saved profile.
 * @returns The form.
 */
function EditProfileForm({
  navigation,
  me,
}: RootScreenProps<"EditProfile"> & { me: OwnProfile }): React.JSX.Element {
  const form = useEditProfile(me);
  const toast = useToast();
  const { values, set, errorFor } = form;
  const [pendingLeave, setPendingLeave] = useState<NavigationAction | null>(null);
  const [leaveAction, setLeaveAction] = useState<NavigationAction | null>(null);
  const [isDone, setIsDone] = useState(false);
  const onFix = useCallback(
    (fix: LocationFix) => {
      set("location", fix.coords);
      set("placeName", fix.placeName);
    },
    [set],
  );
  const lookup = useLocationLookup(onFix);

  usePreventRemove(form.isChanged && !isDone && leaveAction === null, ({ data }) =>
    setPendingLeave(data.action),
  );
  useEffect(() => {
    if (leaveAction !== null) {
      navigation.dispatch(leaveAction);
    }
  }, [leaveAction, navigation]);
  useEffect(() => {
    if (isDone) {
      navigation.goBack();
    }
  }, [isDone, navigation]);

  const save = async (): Promise<void> => {
    if (await form.save()) {
      toast.show("Profile updated.");
      setIsDone(true);
    }
  };

  return (
    <Screen
      header={<TopBar title="Edit profile" onBack={() => navigation.goBack()} />}
      footer={
        <ActionBar top={<Banner message={form.banner} />}>
          <Button
            label="Cancel"
            variant="secondary"
            onPress={() => navigation.goBack()}
            isDisabled={form.isSaving}
            style={styles.flex}
          />
          <Button
            label="Save"
            onPress={() => void save()}
            isDisabled={!form.isChanged || !form.isValid}
            isLoading={form.isSaving}
            style={styles.flex}
          />
        </ActionBar>
      }
    >
      <EditPhotoSection
        userId={me.userId}
        photoUrl={me.photoUrl}
        picked={values.photo}
        onPick={(photo) => set("photo", photo)}
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
        onChangeText={(t) => set("displayName", t)}
        onBlur={() => form.touch("displayName")}
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
        onChange={(g) => set("gender", g)}
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
        onChange={(c) => set("targetChip", c)}
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
        onChange={(km) => set("radiusKm", km)}
        format={kmLabel}
      />
      <ConfirmDialog
        isVisible={pendingLeave !== null}
        title="Discard changes?"
        message="Your edits will be lost."
        cancelLabel="Keep editing"
        confirmLabel="Discard"
        onCancel={() => setPendingLeave(null)}
        onConfirm={() => {
          setLeaveAction(pendingLeave);
          setPendingLeave(null);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  gap: {
    height: space.xs,
  },
});
