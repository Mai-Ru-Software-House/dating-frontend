/**
 * LocationField.tsx
 * Read-only location field filled by "Use GPS" (design.md 6.5, 6.17), with the green "Found:" line,
 * the no-place-name state, "Try again", and the permission message with "Open Settings".
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { MapPin } from "lucide-react-native";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import type { Coordinates } from "../api/types";
import type { LocationLookup } from "../hooks/useLocationLookup";
import { colors, fonts, ICON_STROKE, space, type } from "../theme";
import { formatCoordinates, formatPlace } from "../utils/place";
import { FieldError } from "./FieldError";
import { TextField } from "./TextField";

const DENIED = "Location is needed to find people near you. Turn it on in Settings.";
const NO_NAME = "No place name for this spot";

/** Props for LocationField. */
export interface LocationFieldProps {
  lookup: LocationLookup;
  /** The coordinates from the last fix, if any. */
  coords: Coordinates | null;
  /** The place name ("province, district"), or null. */
  placeName: string | null;
  /** Shown before a new fix (Edit profile: "Tap Use GPS if you've moved."). */
  helper?: string;
  error?: string;
}

/**
 * A location field.
 * @param props See LocationFieldProps.
 * @returns The field.
 */
export function LocationField({
  lookup,
  coords,
  placeName,
  helper,
  error,
}: LocationFieldProps): React.JSX.Element {
  const isLocating = lookup.phase === "locating";
  const hasFix = lookup.phase === "found" || lookup.phase === "noName";
  const shown = formatPlace(placeName, "full");
  const locate = (): void => {
    if (!isLocating) {
      void lookup.locate();
    }
  };

  return (
    <View style={styles.wrap}>
      <TextField
        label="Location"
        value={lookup.phase === "noName" ? "" : (shown ?? "")}
        placeholder={lookup.phase === "noName" ? NO_NAME : undefined}
        onPressBox={locate}
        trailing={{ label: "Use GPS", onPress: locate }}
        helper={hasFix || lookup.phase === "denied" ? undefined : helper}
      />
      {hasFix && coords !== null ? (
        <View style={styles.found}>
          <MapPin size={16} color={colors.ok} strokeWidth={ICON_STROKE} />
          <Text style={styles.foundText}>Found: {formatCoordinates(coords.lat, coords.lon)}</Text>
          {lookup.canRetry ? (
            <Pressable onPress={() => void lookup.retry()} hitSlop={8} accessibilityRole="button">
              <Text style={styles.link}>Try again</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {lookup.phase === "denied" ? (
        <View>
          <FieldError message={DENIED} />
          <Pressable
            onPress={() => void Linking.openSettings()}
            hitSlop={8}
            accessibilityRole="link"
          >
            <Text style={[styles.link, styles.settings]}>Open Settings</Text>
          </Pressable>
        </View>
      ) : null}
      <FieldError message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: space.lg,
  },
  found: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: -space.sm,
  },
  foundText: {
    ...type.label,
    color: colors.ok,
  },
  link: {
    ...type.label,
    fontFamily: fonts.semibold,
    color: colors.accent,
    marginLeft: space.sm,
  },
  settings: {
    marginLeft: 0,
    marginTop: space.sm,
  },
});
