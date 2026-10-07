/**
 * ChipGroup.tsx
 * A wrapping row of single-choice chips with a label above (design.md 3.3).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { StyleSheet, Text, View } from "react-native";

import { colors, space, type } from "../theme";
import { Chip } from "./Chip";
import { FieldError } from "./FieldError";

/** One option. */
export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

/** Props for ChipGroup. */
export interface ChipGroupProps<T extends string> {
  /** Label above the chips. */
  label: string;
  /** The options. */
  options: readonly ChipOption<T>[];
  /** The chosen value, or null. */
  value: T | null | undefined;
  /** Called with the chosen value. */
  onChange: (value: T) => void;
  /** Error under the chips. */
  error?: string;
  /** Not pressable. */
  isDisabled?: boolean;
}

/**
 * A single-choice chip group.
 * @param props See ChipGroupProps.
 * @returns The group.
 */
export function ChipGroup<T extends string>(props: ChipGroupProps<T>): React.JSX.Element {
  const { label, options, value, onChange, error, isDisabled = false } = props;
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            isSelected={option.value === value}
            onPress={() => onChange(option.value)}
            isDisabled={isDisabled}
          />
        ))}
      </View>
      <FieldError message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: space.xl,
  },
  label: {
    ...type.label,
    color: colors.muted,
    marginBottom: space.md,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
});
