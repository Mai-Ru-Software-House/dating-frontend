/**
 * photo.test.ts
 * UT-PHO: profile photo checks before upload, A5 (unit-test-plan.md 6.5).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { ANIM_GIF, SQUARE_500, SQUARE_BIG, WIDE_800X600 } from "../../test/fixtures/photos";
import type { PickedPhoto } from "../api/types";
import { checkProfilePhoto, fileNameFor } from "./photo";
import type { RuleResult } from "./rules";

const TYPE_ERROR = "Use a PNG, JPG or WebP photo.";
const SIZE_ERROR = "Photo must be 1 MB or smaller.";

/**
 * The message of a failed check, or "ok".
 * @param result A check result.
 * @returns The message, or "ok".
 */
function outcome(result: RuleResult): string {
  return result.isValid ? "ok" : result.message;
}

describe("checkProfilePhoto", () => {
  it("UT-PHO-01: accepts a valid square photo", () => {
    const result = checkProfilePhoto(SQUARE_500);

    expect(outcome(result)).toBe("ok");
  });

  it("UT-PHO-02: rejects an unsupported format", () => {
    const result = checkProfilePhoto(ANIM_GIF);

    expect(outcome(result)).toBe(TYPE_ERROR);
  });

  it("UT-PHO-03: rejects a photo larger than 1 MB", () => {
    const result = checkProfilePhoto(SQUARE_BIG);

    expect(outcome(result)).toBe(SIZE_ERROR);
  });

  it("UT-PHO-04: rejects a photo that isn't square", () => {
    const result = checkProfilePhoto(WIDE_800X600);

    expect(outcome(result)).toBe("Photo must be square (same width and height).");
  });

  it("UT-PHO-05: allows exactly 1 048 576 bytes and refuses one byte more", () => {
    const png: PickedPhoto = {
      uri: "file:///p.png",
      mimeType: "image/png",
      width: 600,
      height: 600,
    };

    const atLimit = checkProfilePhoto({ ...png, fileSize: 1_048_576 });
    const over = checkProfilePhoto({ ...png, fileSize: 1_048_577 });

    expect(outcome(atLimit)).toBe("ok");
    expect(outcome(over)).toBe(SIZE_ERROR);
  });

  it("UT-PHO-06: uses the file name when the picker leaves mimeType empty", () => {
    const base = { mimeType: undefined, width: 500, height: 500, fileSize: 100_000 };

    const results = ["photo.webp", "photo.JPEG", "photo.heic"].map((uri) =>
      outcome(checkProfilePhoto({ ...base, uri })),
    );

    expect(results).toEqual(["ok", "ok", TYPE_ERROR]);
  });

  it("UT-PHO-06: the upload's file name comes from the picker, the URI, or the type", () => {
    const base = { width: 500, height: 500 };

    const names = [
      fileNameFor({ ...base, uri: "file:///a/x.webp", fileName: "mine.webp" }),
      fileNameFor({ ...base, uri: "file:///a/x.jpeg" }),
      fileNameFor({ ...base, uri: "content://media/42", mimeType: "image/png" }),
      fileNameFor({ ...base, uri: "content://media/43", mimeType: "image/webp" }),
      fileNameFor({ ...base, uri: "content://media/44", mimeType: "image/jpeg" }),
    ];

    expect(names).toEqual(["mine.webp", "photo.jpeg", "photo.png", "photo.webp", "photo.jpg"]);
  });

  it("UT-PHO-07: reports only the first failing rule (format, size, square)", () => {
    const result = checkProfilePhoto({ ...ANIM_GIF, fileSize: 2_000_000, width: 800, height: 600 });

    expect(outcome(result)).toBe(TYPE_ERROR);
  });
});
