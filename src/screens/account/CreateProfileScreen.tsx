/**
 * CreateProfileScreen.tsx
 * Create profile frame (design.md 6.3): top bar, step progress, the current step, and the action
 * bar. Leaving from step 1 (Cancel, back, Android back, swipe) asks before throwing the input away;
 * back on steps 2 and 3 returns to the previous step.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { usePreventRemove, type NavigationAction } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ActionBar } from "../../components/ActionBar";
import { Banner } from "../../components/Banner";
import { Button } from "../../components/Button";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { Screen } from "../../components/Screen";
import { StepProgress } from "../../components/StepProgress";
import { TopBar } from "../../components/TopBar";
import type { RootScreenProps } from "../../navigation/types";
import { colors, space, type } from "../../theme";
import { AboutYouStep } from "./AboutYouStep";
import { STEP_TITLES } from "./createProfileSchema";
import { PhotoPlaceStep } from "./PhotoPlaceStep";
import { PreferencesStep } from "./PreferencesStep";
import { useCreateProfile } from "./useCreateProfile";

/**
 * The Create profile screen.
 * @param props.navigation The root stack navigation.
 * @returns The screen.
 */
export function CreateProfileScreen({
  navigation,
}: RootScreenProps<"CreateProfile">): React.JSX.Element {
  const form = useCreateProfile();
  const [pendingLeave, setPendingLeave] = useState<NavigationAction | null>(null);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [leaveAction, setLeaveAction] = useState<NavigationAction | null>(null);

  usePreventRemove(leaveAction === null && !form.isSubmitting, ({ data }) => {
    if (form.step > 1) {
      form.back();
    } else {
      setPendingLeave(data.action);
    }
  });

  useEffect(() => {
    if (leaveAction !== null) {
      navigation.dispatch(leaveAction);
    }
  }, [leaveAction, navigation]);

  const discard = async (): Promise<void> => {
    setIsDiscarding(true);
    await form.discardPhoto();
    setLeaveAction(pendingLeave);
    setPendingLeave(null);
    setIsDiscarding(false);
  };
  const isLast = form.step === 3;
  // A tap on the dimmed Next still counts as trying to move on, so the messages show (CP22).
  const onPrimaryTouch = form.isStepValid ? undefined : () => form.next();

  return (
    <Screen
      header={<TopBar title="Create profile" onBack={() => navigation.goBack()} />}
      footer={
        <ActionBar top={<Banner message={form.banner} />}>
          <Button
            label={form.step === 1 ? "Cancel" : "Back"}
            variant="secondary"
            onPress={() => (form.step === 1 ? navigation.goBack() : form.back())}
            isDisabled={form.isSubmitting}
            style={styles.flex}
          />
          <View style={styles.flex} onTouchStart={onPrimaryTouch}>
            <Button
              label={isLast ? "Submit" : "Next"}
              onPress={isLast ? () => void form.submit() : form.next}
              isDisabled={!form.isStepValid}
              isLoading={form.isSubmitting}
            />
          </View>
        </ActionBar>
      }
    >
      <View style={styles.progress}>
        <StepProgress steps={STEP_TITLES} current={form.step} />
      </View>
      <Text style={styles.heading} accessibilityRole="header">
        {STEP_TITLES[form.step - 1]}
      </Text>
      {form.step === 1 ? <AboutYouStep form={form} /> : null}
      {form.step === 2 ? <PhotoPlaceStep form={form} /> : null}
      {form.step === 3 ? <PreferencesStep form={form} /> : null}
      <ConfirmDialog
        isVisible={pendingLeave !== null}
        title="Discard your profile?"
        message="What you've entered will be lost."
        cancelLabel="Keep editing"
        confirmLabel="Discard"
        onCancel={() => setPendingLeave(null)}
        onConfirm={() => void discard()}
        isBusy={isDiscarding}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  progress: {
    marginTop: space.sm,
    marginBottom: space.xxl,
  },
  heading: {
    ...type.heading,
    color: colors.ink,
    marginBottom: space.xl,
  },
});
