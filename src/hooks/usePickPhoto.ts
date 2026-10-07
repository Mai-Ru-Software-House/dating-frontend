/**
 * usePickPhoto.ts
 * Opens the photo library and checks the picked photo against A5 before anything is uploaded
 * (api-integration.md 6.2). Missing size or dimensions are read from the file first.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useCallback } from "react";
import { Image } from "react-native";

import type { PickedPhoto } from "../api/types";
import { checkProfilePhoto } from "../utils/photo";

/** What picking gave. */
export type PickResult =
  | { kind: "cancelled" }
  | { kind: "refused"; message: string }
  | { kind: "picked"; photo: PickedPhoto };

/**
 * Reads an image's real dimensions.
 * @param uri The local URI.
 * @returns Width and height, or zeros when unreadable.
 */
async function readSize(uri: string): Promise<{ width: number; height: number }> {
  try {
    return await Image.getSize(uri);
  } catch {
    return { width: 0, height: 0 };
  }
}

/**
 * Fills in what the picker left empty.
 * @param asset The picker's asset.
 * @returns The photo with its size and dimensions.
 */
async function completeAsset(asset: ImagePicker.ImagePickerAsset): Promise<PickedPhoto> {
  let fileSize = asset.fileSize ?? null;
  if (fileSize === null || fileSize === 0) {
    try {
      fileSize = new File(asset.uri).size;
    } catch {
      fileSize = null;
    }
  }
  let { width, height } = asset;
  if (!width || !height) {
    ({ width, height } = await readSize(asset.uri));
  }
  return {
    uri: asset.uri,
    mimeType: asset.mimeType,
    fileName: asset.fileName,
    fileSize,
    width,
    height,
  };
}

/**
 * The photo picker.
 * @returns pick(): opens the library and returns the checked photo, a refusal, or a cancel.
 */
export function usePickPhoto(): () => Promise<PickResult> {
  return useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    });
    if (result.canceled || result.assets.length === 0) {
      return { kind: "cancelled" };
    }
    const photo = await completeAsset(result.assets[0]);
    const check = checkProfilePhoto(photo);
    return check.isValid ? { kind: "picked", photo } : { kind: "refused", message: check.message };
  }, []);
}
