/**
 * PhotoPlaceStep.tsx
 * Create profile step 2 (design.md 6.5): the profile photo, checked before upload and uploaded
 * right after picking, and the location from GPS. No bio (dropped 6 October).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { messageFor } from "../../api/errors";
import { photosApi } from "../../api/photos";
import { FieldError } from "../../components/FieldError";
import { LocationField } from "../../components/LocationField";
import { PhotoTile } from "../../components/PhotoTile";
import { useLocationLookup, type LocationFix } from "../../hooks/useLocationLookup";
import { usePickPhoto } from "../../hooks/usePickPhoto";
import { colors, space, type } from "../../theme";
import type { CreateProfileController } from "./useCreateProfile";

/** Photo rules shown under the tile (A5). */
export const PHOTO_HELPER = "PNG, JPG or WebP. Square, up to 1 MB.";

/**
 * Step 2: Photo & place.
 * @param props.form The Create profile controller.
 * @returns The step's fields.
 */
export function PhotoPlaceStep({ form }: { form: CreateProfileController }): React.JSX.Element {
  const { values, set, errorFor } = form;
  const pick = usePickPhoto();
  const [isUploading, setIsUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const onFix = useCallback(
    (fix: LocationFix) => {
      set("location", fix.coords);
      set("placeName", fix.placeName);
    },
    [set],
  );
  const lookup = useLocationLookup(onFix);

  const choosePhoto = async (): Promise<void> => {
    try {
      const result = await pick();
      if (result.kind === "cancelled") {
        return;
      }
      if (result.kind === "refused") {
        setPhotoError(result.message);
        return;
      }
      setPhotoError(null);
      setIsUploading(true);
      const upload = await photosApi.uploadTemp(result.photo);
      const previous = values.photo;
      set("photo", { local: result.photo, upload });
      if (previous !== null) {
        photosApi.deleteTemp(previous.upload).catch(() => undefined);
      }
    } catch (error) {
      setPhotoError(messageFor(error));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Text style={styles.label}>Profile photo</Text>
      <PhotoTile localUri={values.photo?.local.uri} isBusy={isUploading} onPress={choosePhoto} />
      <View style={styles.photoNotes}>
        <Text style={styles.helper}>{PHOTO_HELPER}</Text>
        <FieldError message={photoError ?? errorFor("photo")} />
      </View>
      <LocationField
        lookup={lookup}
        coords={values.location}
        placeName={values.placeName}
        error={errorFor("location")}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    ...type.label,
    color: colors.muted,
    marginBottom: space.sm,
  },
  photoNotes: {
    marginTop: space.md,
    marginBottom: space.xl,
  },
  helper: {
    ...type.label,
    color: colors.muted,
  },
});
