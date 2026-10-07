/**
 * DateField.tsx
 * Date of birth field with the native date picker: Android's dialog, or a spinner in a sheet on
 * iOS. Shows DD / MM / YYYY; the value is YYYY-MM-DD.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";

import { colors, radius, space } from "../theme";
import { parseWireDate, toWireDate, yearsAgo } from "../utils/age";
import { dobFromWire } from "../utils/format";
import { Button } from "./Button";
import { TextField } from "./TextField";

/** Props for DateField. */
export interface DateFieldProps {
  label: string;
  /** YYYY-MM-DD, or "". */
  value: string;
  onChange: (wire: string) => void;
  /** Years back for the picker's first date when empty. */
  defaultYearsAgo: number;
  error?: string;
  isLocked?: boolean;
}

/**
 * A wire date as a local Date for the picker.
 * @param wire YYYY-MM-DD.
 * @returns The date at local noon.
 */
function toPickerDate(wire: string): Date {
  const date = parseWireDate(wire) ?? parseWireDate(yearsAgo(18));
  return date === null ? new Date() : new Date(date.year, date.month - 1, date.day, 12);
}

/**
 * A picker Date as a wire date.
 * @param date The picked date.
 * @returns YYYY-MM-DD from its local calendar day.
 */
function fromPickerDate(date: Date): string {
  return toWireDate({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
}

/**
 * A date field.
 * @param props See DateFieldProps.
 * @returns The field.
 */
export function DateField(props: DateFieldProps): React.JSX.Element {
  const { label, value, onChange, defaultYearsAgo, error, isLocked = false } = props;
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [draft, setDraft] = useState(() => toPickerDate(value || yearsAgo(defaultYearsAgo)));

  const open = (): void => {
    if (isLocked) {
      return;
    }
    const start = toPickerDate(value || yearsAgo(defaultYearsAgo));
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: start,
        mode: "date",
        maximumDate: new Date(),
        onValueChange: (_event, date) => onChange(fromPickerDate(date)),
      });
      return;
    }
    setDraft(start);
    setIsSheetOpen(true);
  };

  return (
    <>
      <TextField
        label={label}
        value={value ? (dobFromWire(value) ?? "") : ""}
        placeholder="DD / MM / YYYY"
        onPressBox={open}
        error={error}
      />
      <Modal
        visible={isSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSheetOpen(false)}
      >
        <Pressable style={styles.dim} onPress={() => setIsSheetOpen(false)} />
        <View style={styles.sheet}>
          <DateTimePicker
            value={draft}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            onValueChange={(_event, date) => setDraft(date)}
          />
          <Button
            label="Done"
            onPress={() => {
              onChange(fromPickerDate(draft));
              setIsSheetOpen(false);
            }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dim: {
    flex: 1,
    backgroundColor: colors.dim,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    padding: space.xl,
    paddingBottom: space.xxxl,
    gap: space.lg,
  },
});
