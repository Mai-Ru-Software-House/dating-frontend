/**
 * EditProfileForm.tsx
 * Edit profile (design.md 6.17) once the saved profile is known: a scrolling form with a Cancel and
 * Save bar. Nothing is sent until Save; leaving with changes asks first.
 * Created by Tee (Kittiphon Kijpinyochai), 20 October 2026
 */
import { usePreventRemove, type NavigationAction } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";

import type { OwnProfile } from "../../api/types";
import { ActionBar } from "../../components/ActionBar";
import { Banner } from "../../components/Banner";
import { Button } from "../../components/Button";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { Screen } from "../../components/Screen";
import { useToast } from "../../components/Toast";
import { TopBar } from "../../components/TopBar";
import { useLocationLookup, type LocationFix } from "../../hooks/useLocationLookup";
import type { RootScreenProps } from "../../navigation/types";
import { EditProfileFields } from "./EditProfileFields";
import { useEditProfile } from "./useEditProfile";

/**
 * The Edit profile form: the save bar, the fields and the discard dialog.
 * @param props Navigation, route and the saved profile.
 * @returns The form.
 */
export function EditProfileForm({
  navigation,
  me,
}: RootScreenProps<"EditProfile"> & { me: OwnProfile }): React.JSX.Element {
  const form = useEditProfile(me);
  const toast = useToast();
  const { set } = form;
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

  usePreventRemove(form.isChanged && !isDone && leaveAction === null, ({ data }) => {
    setPendingLeave(data.action);
  });
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
      header={
        <TopBar
          title="Edit profile"
          onBack={() => {
            navigation.goBack();
          }}
        />
      }
      footer={
        <ActionBar top={<Banner message={form.banner} />}>
          <Button
            label="Cancel"
            variant="secondary"
            onPress={() => {
              navigation.goBack();
            }}
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
      <EditProfileFields form={form} me={me} lookup={lookup} />
      <ConfirmDialog
        isVisible={pendingLeave !== null}
        title="Discard changes?"
        message="Your edits will be lost."
        cancelLabel="Keep editing"
        confirmLabel="Discard"
        onCancel={() => {
          setPendingLeave(null);
        }}
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
});
