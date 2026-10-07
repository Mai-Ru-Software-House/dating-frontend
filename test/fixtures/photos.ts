/**
 * photos.ts
 * Image picker results for the photo tests (unit-test-plan.md 5, Fixtures sheet). No real files
 * are read.
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import type { PickedPhoto } from "../../src/api/types";

export const SQUARE_500: PickedPhoto = {
  uri: "file:///photos/square_500.jpg",
  fileName: "square_500.jpg",
  mimeType: "image/jpeg",
  width: 500,
  height: 500,
  fileSize: 300_000,
};

export const SQUARE_BIG: PickedPhoto = {
  uri: "file:///photos/square_big.jpg",
  fileName: "square_big.jpg",
  mimeType: "image/jpeg",
  width: 1500,
  height: 1500,
  fileSize: 1_200_000,
};

export const WIDE_800X600: PickedPhoto = {
  uri: "file:///photos/wide_800x600.jpg",
  fileName: "wide_800x600.jpg",
  mimeType: "image/jpeg",
  width: 800,
  height: 600,
  fileSize: 200_000,
};

export const ANIM_GIF: PickedPhoto = {
  uri: "file:///photos/anim.gif",
  fileName: "anim.gif",
  mimeType: "image/gif",
  width: 400,
  height: 400,
  fileSize: 100_000,
};
