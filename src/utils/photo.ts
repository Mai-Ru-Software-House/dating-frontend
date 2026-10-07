/**
 * photo.ts
 * Profile photo checks before upload (A5, api-integration.md 6.2) and the file details the upload
 * needs. The first failing rule wins, in a fixed order: type, size, square.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { PickedPhoto } from "../api/types";
import {
  PROFILE_PHOTO_EXTENSIONS,
  PROFILE_PHOTO_MAX_BYTES,
  PROFILE_PHOTO_TYPES,
} from "../constants/limits";
import { MESSAGES, type RuleResult } from "./rules";

const MIME_BY_EXTENSION: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

/**
 * File extension from a URI or file name, lower case.
 * @param name A URI or file name.
 * @returns The extension without the dot, or "".
 */
function extensionOf(name: string): string {
  const clean = name.split(/[?#]/)[0];
  const dotAt = clean.lastIndexOf(".");
  return dotAt === -1 ? "" : clean.slice(dotAt + 1).toLowerCase();
}

/**
 * The photo's MIME type: the picker's mimeType, else from the file extension.
 * @param photo The picked photo.
 * @returns The MIME type, or "" when unknown.
 */
export function photoMimeType(photo: PickedPhoto): string {
  if (photo.mimeType) {
    return photo.mimeType.toLowerCase();
  }
  const ext = extensionOf(photo.fileName ?? photo.uri);
  return MIME_BY_EXTENSION[ext] ?? "";
}

/**
 * A file name for the upload's multipart part.
 * @param photo The picked photo.
 * @returns The picker's file name, or "photo.<ext>" from the type.
 */
export function fileNameFor(photo: PickedPhoto): string {
  if (photo.fileName) {
    return photo.fileName;
  }
  const ext = extensionOf(photo.uri);
  if ((PROFILE_PHOTO_EXTENSIONS as readonly string[]).includes(ext)) {
    return `photo.${ext}`;
  }
  const type = photoMimeType(photo);
  return type === "image/png" ? "photo.png" : type === "image/webp" ? "photo.webp" : "photo.jpg";
}

/**
 * Checks a picked photo against A5.
 * @param photo The picked photo, with its real size and dimensions.
 * @returns Valid, or the first failing rule's message.
 */
export function checkProfilePhoto(photo: PickedPhoto): RuleResult {
  const type = photoMimeType(photo);
  if (!(PROFILE_PHOTO_TYPES as readonly string[]).includes(type)) {
    return { isValid: false, message: MESSAGES.photoType };
  }
  if (typeof photo.fileSize === "number" && photo.fileSize > PROFILE_PHOTO_MAX_BYTES) {
    return { isValid: false, message: MESSAGES.photoSize };
  }
  if (photo.width !== photo.height) {
    return { isValid: false, message: MESSAGES.photoSquare };
  }
  return { isValid: true };
}
