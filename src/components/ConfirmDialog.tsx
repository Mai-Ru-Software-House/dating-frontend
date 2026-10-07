/**
 * ConfirmDialog.tsx
 * The app's one confirmation pop-up (design.md 3.22): dimmed backdrop, centered card with an
 * optional icon, title, message, and Cancel / confirm buttons. Tapping the dim or Android back
 * cancels; while the confirm action runs, both buttons are disabled.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { LucideIcon } from "lucide-react-native";
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { colors, dialogWidth, fonts, ICON_STROKE, radius, size, space } from "../theme";
import { Button } from "./Button";

const ICON_CIRCLE = 48;

/** Props for ConfirmDialog. */
export interface ConfirmDialogProps {
  isVisible: boolean;
  title: string;
  message?: string;
  /** Left button (default "Cancel"). */
  cancelLabel?: string;
  /** Right button; names the action ("Delete", "Discard", "Log out"). */
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  /** Confirm is running: spinner in its button, both buttons disabled. */
  isBusy?: boolean;
  icon?: LucideIcon;
}

/**
 * A confirmation dialog.
 * @param props See ConfirmDialogProps.
 * @returns The dialog.
 */
export function ConfirmDialog(props: ConfirmDialogProps): React.JSX.Element {
  const {
    isVisible,
    title,
    message,
    cancelLabel = "Cancel",
    confirmLabel,
    onCancel,
    onConfirm,
  } = props;
  const { isBusy = false, icon: Icon } = props;
  const window = useWindowDimensions();
  const cancel = (): void => {
    if (!isBusy) {
      onCancel();
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={cancel}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={cancel}
          accessibilityLabel={cancelLabel}
        />
        <View style={[styles.card, { width: dialogWidth(window.width) }]} accessibilityViewIsModal>
          {Icon ? (
            <View style={styles.iconCircle}>
              <Icon size={22} color={colors.accent} strokeWidth={ICON_STROKE} />
            </View>
          ) : null}
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {message ? (
            <Text style={styles.message} numberOfLines={3}>
              {message}
            </Text>
          ) : null}
          <View style={styles.buttons}>
            <Button
              label={cancelLabel}
              variant="secondary"
              onPress={cancel}
              isDisabled={isBusy}
              isCompact
              style={styles.button}
            />
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              isLoading={isBusy}
              isCompact
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dim,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.tile,
    padding: space.xxl,
    alignItems: "center",
  },
  iconCircle: {
    width: ICON_CIRCLE,
    height: ICON_CIRCLE,
    borderRadius: ICON_CIRCLE / 2,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.lg,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fonts.semibold,
    color: colors.ink,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: colors.muted,
    textAlign: "center",
    marginTop: space.sm,
  },
  buttons: {
    flexDirection: "row",
    gap: space.md,
    marginTop: space.xl,
    alignSelf: "stretch",
  },
  button: {
    flex: 1,
    height: size.dialogButton,
  },
});
