/**
 * errors.test.ts
 * UT-ERR: error codes to the app's copy, and server fields to Create profile steps
 * (unit-test-plan.md 6.8, api-integration.md 4.2 and 4.3).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import {
  ApiError,
  messageFor,
  photoUploadMessage,
  stepForField,
  type ApiErrorCode,
} from "./errors";

/** The copy from api-integration.md 4.2, word for word. "" means no message is shown. */
const COPY: [ApiErrorCode, number, string][] = [
  ["UNAUTHENTICATED", 401, "You've been logged out. Log in again."],
  ["INVALID_CREDENTIALS", 401, "Wrong username or password."],
  ["USER_NOT_FOUND", 404, "This profile isn't available anymore."],
  ["MESSAGE_NOT_FOUND", 404, "That message isn't available anymore."],
  ["NOTE_NOT_FOUND", 404, "This note isn't available anymore."],
  ["PLACE_NOT_FOUND", 404, "No place name for this spot"],
  ["PHOTO_NOT_FOUND", 404, ""],
  ["UPLOAD_NOT_FOUND", 404, ""],
  ["USERNAME_TAKEN", 409, "That username is already in use. Try another one."],
  ["GEOCODER_UNAVAILABLE", 500, "Location lookup is down. Try again in a minute."],
  ["MATCH_ENGINE_UNAVAILABLE", 500, "Couldn't load your matches."],
  ["INTERNAL_ERROR", 500, "Something went wrong on our side. Try again."],
  ["NETWORK_ERROR", 0, "Can't reach the server. Check your connection and try again."],
];

describe("messageFor", () => {
  it.each(COPY)("UT-ERR-01: %s (%i) has the app's copy", (code, status, copy) => {
    const message = messageFor(new ApiError(status, code, "server text"));

    expect(message).toBe(copy);
  });

  it("UT-ERR-01: INVALID_INPUT without a field shows the server's message", () => {
    const message = messageFor(new ApiError(400, "INVALID_INPUT", "Age range is not valid"));

    expect(message).toBe("Age range is not valid");
  });

  it("UT-ERR-01: a failed fetch (TypeError) or a timeout (AbortError) is a network failure", () => {
    const timeout = new Error("aborted");
    timeout.name = "AbortError";
    const expected = "Can't reach the server. Check your connection and try again.";

    expect(messageFor(new TypeError("Network request failed"))).toBe(expected);
    expect(messageFor(timeout)).toBe(expected);
  });

  it("UT-ERR-01: Expo's fetch reports a lost connection as an Error that starts with 'fetch failed'", () => {
    const refused = new Error(
      "fetch failed: java.net.ConnectException: Failed to connect to /10.0.2.2:3000",
    );

    expect(messageFor(refused)).toBe(
      "Can't reach the server. Check your connection and try again.",
    );
  });

  it("UT-ERR-01: any other thrown error is an unknown error, not a network failure", () => {
    expect(messageFor(new Error("bug"))).toBe("Something went wrong. Try again.");
    expect(messageFor("offline")).toBe("Something went wrong. Try again.");
  });

  it("UT-ERR-01: a photo upload keeps network and server copy, else its own message", () => {
    expect(photoUploadMessage(new Error("bug"))).toBe(
      "Something went wrong uploading the photo. Try again.",
    );
    expect(photoUploadMessage(new TypeError("Network request failed"))).toBe(
      "Can't reach the server. Check your connection and try again.",
    );
    expect(photoUploadMessage(new ApiError(400, "INVALID_INPUT", "Photo is too large"))).toBe(
      "Photo is too large",
    );
  });

  it("UT-ERR-02: a wrong password and an unknown user look the same", () => {
    const wrongPassword = messageFor(new ApiError(401, "INVALID_CREDENTIALS", "alice/wrongpass1"));
    const unknownUser = messageFor(new ApiError(401, "INVALID_CREDENTIALS", "nobody_here"));

    expect(wrongPassword).toBe("Wrong username or password.");
    expect(unknownUser).toBe(wrongPassword);
  });
});

describe("stepForField", () => {
  it("UT-ERR-03: finds the Create profile step for a server field", () => {
    const fields = [
      "username",
      "photoUploadId",
      "location.lat",
      "preferences.minAge",
      "preferences.targetGenders.1",
      "nope",
    ];

    const steps = fields.map(stepForField);

    expect(steps).toEqual([1, 2, 2, 3, 3, null]);
  });
});
