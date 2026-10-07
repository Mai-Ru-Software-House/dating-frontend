/**
 * TextField.tsx
 * Labelled text input (design.md 3.2): 50 pt box, accent border when focused or in error, an
 * optional trailing action ("Show", "Use GPS", "Available"), an error row, and a read-only variant.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { Lock } from "lucide-react-native";
import { forwardRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";

import { colors, fonts, ICON_STROKE, MAX_FONT_SCALE, radius, size, space, type } from "../theme";
import { FieldError } from "./FieldError";

/** A trailing action or status inside the box. */
export interface FieldTrailing {
  label: string;
  /** Pressable when set; plain status text otherwise. */
  onPress?: () => void;
  /** Text color (default accent). */
  color?: string;
  accessibilityLabel?: string;
}

/** Props for TextField. */
export interface TextFieldProps extends Omit<TextInputProps, "style" | "editable"> {
  /** Label above the box. */
  label: string;
  /** Error under the box; also turns the border red. */
  error?: string;
  /** Turn the border red without a message (the password on a wrong login). */
  hasErrorBorder?: boolean;
  /** Action or status inside the box, at the right. */
  trailing?: FieldTrailing;
  /** Read-only variant: chip fill, lock icon, not focusable. */
  isReadOnly?: boolean;
  /** Shown but not editable (while a request runs). */
  isLocked?: boolean;
  /** Helper text under the box. */
  helper?: string;
  /** Helper text color (default muted). */
  helperColor?: string;
  /** Called when the box is tapped and the field is not a text input (pickers). */
  onPressBox?: () => void;
}

/**
 * A labelled text field.
 * @param props See TextFieldProps.
 * @returns The field.
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(props, ref) {
  const {
    label,
    error,
    hasErrorBorder = false,
    trailing,
    isReadOnly = false,
    isLocked = false,
    helper,
    helperColor = colors.muted,
    onPressBox,
    onFocus,
    onBlur,
    value,
    ...inputProps
  } = props;
  const [isFocused, setIsFocused] = useState(false);
  const isRed = isFocused || Boolean(error) || hasErrorBorder;

  if (isReadOnly) {
    return (
      <View
        style={styles.wrap}
        accessible
        accessibilityLabel={`${label}, ${value ?? ""}, can't be changed`}
      >
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.box, styles.readOnlyBox]}>
          <Text style={[styles.input, styles.readOnlyText]} numberOfLines={1}>
            {value}
          </Text>
          <Lock size={18} color={colors.muted} strokeWidth={ICON_STROKE} />
        </View>
        {helper ? <Text style={[styles.helper, { color: helperColor }]}>{helper}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={onPressBox}
        disabled={onPressBox === undefined}
        accessibilityRole={onPressBox ? "button" : undefined}
        accessibilityLabel={onPressBox ? `${label}, ${value || "not set"}` : undefined}
        style={[styles.box, isRed && styles.boxRed]}
      >
        {onPressBox ? (
          <Text
            style={[styles.input, styles.boxText, !value && styles.placeholder]}
            numberOfLines={1}
          >
            {value || inputProps.placeholder}
          </Text>
        ) : (
          <TextInput
            ref={ref}
            {...inputProps}
            value={value}
            editable={!isLocked}
            accessibilityLabel={label}
            placeholderTextColor={colors.muted}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            style={styles.input}
          />
        )}
        {trailing ? (
          <Pressable
            onPress={trailing.onPress}
            disabled={trailing.onPress === undefined}
            hitSlop={12}
            accessibilityRole={trailing.onPress ? "button" : "text"}
            accessibilityLabel={trailing.accessibilityLabel ?? trailing.label}
          >
            <Text
              style={[styles.trailing, { color: trailing.color ?? colors.accent }]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {trailing.label}
            </Text>
          </Pressable>
        ) : null}
      </Pressable>
      <FieldError message={error} />
      {helper && !error ? (
        <Text style={[styles.helper, { color: helperColor }]}>{helper}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    marginBottom: space.lg,
  },
  label: {
    ...type.label,
    color: colors.muted,
    marginBottom: space.sm,
  },
  box: {
    minHeight: size.input,
    borderRadius: radius.field,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingLeft: space.lg,
    paddingRight: space.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  boxRed: {
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  readOnlyBox: {
    backgroundColor: colors.chip,
    borderWidth: 0,
  },
  input: {
    ...type.body,
    flex: 1,
    color: colors.ink,
    paddingVertical: space.md,
  },
  boxText: {
    paddingVertical: 0,
  },
  placeholder: {
    color: colors.muted,
  },
  readOnlyText: {
    color: colors.muted,
  },
  trailing: {
    ...type.label,
    fontFamily: fonts.semibold,
  },
  helper: {
    ...type.label,
    marginTop: space.sm,
  },
});
