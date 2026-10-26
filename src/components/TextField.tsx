/**
 * TextField.tsx
 * Labelled text input (design.md 3.2): 50 pt box, accent border when focused or in error, an
 * optional trailing action ("Show", "Use GPS", "Available"), an error row, and a read-only variant.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { Lock } from "lucide-react-native";
import { forwardRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type TextInputProps,
} from "react-native";

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
 * The read-only variant: chip fill, lock icon, announced as one element.
 * @param label The label above the box.
 * @param value The value shown.
 * @param helper Helper text under the box.
 * @param helperColor Helper text color.
 * @returns The field.
 */
function renderReadOnly(
  label: string,
  value: string | undefined,
  helper: string | undefined,
  helperColor: string,
): React.JSX.Element {
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

/**
 * The action or status inside the box, at the right.
 * @param trailing The action, if any.
 * @returns The pressable label, or null.
 */
function renderTrailing(trailing: FieldTrailing | undefined): React.JSX.Element | null {
  if (!trailing) {
    return null;
  }
  return (
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
  );
}

/**
 * The helper line under the box, hidden while an error is shown.
 * @param helper Helper text.
 * @param error The error message, if any.
 * @param color Helper text color.
 * @returns The helper line, or null.
 */
function renderHelper(
  helper: string | undefined,
  error: string | undefined,
  color: string,
): React.JSX.Element | null {
  if (!helper || error) {
    return null;
  }
  return <Text style={[styles.helper, { color }]}>{helper}</Text>;
}

/**
 * Whether a field value counts as set (neither missing nor empty).
 * @param value The value.
 * @returns True when there is text.
 */
function hasText(value: string | undefined): value is string {
  return value !== undefined && value !== "";
}

/**
 * How a picker box is announced: as a button, e.g. "Location, Siam, Bangkok" or "Location, not set".
 * @param label The field label.
 * @param value The value, if one is set.
 * @param isPicker Whether tapping the box opens a picker (otherwise it is a text input).
 * @returns The accessibility props for the box.
 */
function pickerAccessibility(
  label: string,
  value: string | undefined,
  isPicker: boolean,
): Pick<PressableProps, "accessibilityRole" | "accessibilityLabel"> {
  if (!isPicker) {
    return {};
  }
  return {
    accessibilityRole: "button",
    accessibilityLabel: `${label}, ${hasText(value) ? value : "not set"}`,
  };
}

/**
 * What the box shows when tapping it opens a picker: the value or the placeholder.
 * @param value The value, if one is set.
 * @param placeholder The text shown when there is no value.
 * @returns The text.
 */
function renderPickerText(
  value: string | undefined,
  placeholder: string | undefined,
): React.JSX.Element {
  const isSet = hasText(value);
  return (
    <Text style={[styles.input, styles.boxText, !isSet && styles.placeholder]} numberOfLines={1}>
      {isSet ? value : placeholder}
    </Text>
  );
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
    return renderReadOnly(label, value, helper, helperColor);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={onPressBox}
        disabled={onPressBox === undefined}
        {...pickerAccessibility(label, value, onPressBox !== undefined)}
        style={[styles.box, isRed && styles.boxRed]}
      >
        {onPressBox ? (
          renderPickerText(value, inputProps.placeholder)
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
        {renderTrailing(trailing)}
      </Pressable>
      <FieldError message={error} />
      {renderHelper(helper, error, helperColor)}
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
