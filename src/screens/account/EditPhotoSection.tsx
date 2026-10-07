/**
 * EditPhotoSection.tsx
 * PHOTO on Edit profile (design.md 6.17): the square tile with a camera badge, "Change photo" and
 * the photo rules. A picked photo is checked at once but only uploaded on Save.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { PickedPhoto } from "../../api/types";
import { FieldError } from "../../components/FieldError";
import { PhotoTile } from "../../components/PhotoTile";
import { SectionLabel } from "../../components/SectionLabel";
import { usePickPhoto } from "../../hooks/usePickPhoto";
import { colors, fonts, space, type } from "../../theme";
import { PHOTO_HELPER } from "./PhotoPlaceStep";

/** Props for EditPhotoSection. */
export interface EditPhotoSectionProps {
  userId: string;
  photoUrl: string;
  picked: PickedPhoto | null;
  onPick: (photo: PickedPhoto) => void;
  error?: string;
  isLocked: boolean;
}

/**
 * The photo section.
 * @param props See EditPhotoSectionProps.
 * @returns The section.
 */
export function EditPhotoSection(props: EditPhotoSectionProps): React.JSX.Element {
  const { userId, photoUrl, picked, onPick, error, isLocked } = props;
  const pick = usePickPhoto();
  const [refusal, setRefusal] = useState<string | null>(null);
  const choose = async (): Promise<void> => {
    if (isLocked) {
      return;
    }
    try {
      const result = await pick();
      if (result.kind === "refused") {
        setRefusal(result.message);
      } else if (result.kind === "picked") {
        setRefusal(null);
        onPick(result.photo);
      }
    } catch {
      // The picker failed to open; nothing changes.
    }
  };

  return (
    <View style={styles.section}>
      <SectionLabel label="Photo" />
      <View style={styles.row}>
        <PhotoTile
          localUri={picked?.uri}
          saved={{ userId, photoUrl }}
          onPress={() => void choose()}
          hasBadge
        />
        <View style={styles.text}>
          <Pressable onPress={() => void choose()} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.change}>Change photo</Text>
          </Pressable>
          <Text style={styles.helper}>{PHOTO_HELPER}</Text>
        </View>
      </View>
      <FieldError message={refusal ?? error} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: space.lg,
    marginBottom: space.xxl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xl,
  },
  text: {
    flex: 1,
    gap: space.xs,
  },
  change: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: fonts.semibold,
    color: colors.accent,
  },
  helper: {
    ...type.label,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
});
