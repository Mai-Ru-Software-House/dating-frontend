/**
 * CreateProfileScreen.test.tsx
 * UT-SCR-04 to 11: the three Create profile steps, the username check, photo and location, Cancel
 * and Submit (unit-test-plan.md 6.19). The profile, photos and places APIs are mocked; GPS and the
 * photo library are the mocks from test/setup.tsx.
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { act, fireEvent, screen, userEvent, waitFor } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import { setPickedDate } from "../../../test/datePicker";
import { ANIM_GIF, SQUARE_500, SQUARE_BIG, WIDE_800X600 } from "../../../test/fixtures/photos";
import { MINT, ownProfileOf } from "../../../test/fixtures/seed";
import { currentRoute, renderScreen, type Rendered } from "../../../test/renderWithProviders";
import { ApiError } from "../../api/errors";
import { photosApi } from "../../api/photos";
import { placesApi } from "../../api/places";
import { profileApi } from "../../api/profile";
import type { PickedPhoto } from "../../api/types";
import { CreateProfileScreen } from "./CreateProfileScreen";

jest.mock("../../api/profile");
jest.mock("../../api/photos");
jest.mock("../../api/places");

const profile = jest.mocked(profileApi);
const photos = jest.mocked(photosApi);
const places = jest.mocked(placesApi);
const picker = jest.mocked(ImagePicker.launchImageLibraryAsync);
const location = jest.mocked(Location);

const UPLOAD = { uploadId: "upl_1", expiresAt: "2099-01-01T00:00:00Z", deleteToken: "del_1" };

type User = ReturnType<typeof userEvent.setup>;

/** Step 1 values. */
interface AboutYou {
  displayName: string;
  username: string;
  password: string;
  dateOfBirth: string;
  genderLabel: string;
}

const MINT_ABOUT: AboutYou = {
  displayName: MINT.displayName,
  username: MINT.username,
  password: MINT.password,
  dateOfBirth: MINT.dateOfBirth,
  genderLabel: "Woman",
};

/**
 * Fills step 1. An empty string leaves that field alone.
 * @param user The user event instance.
 * @param values The values.
 */
async function fillAboutYou(user: User, values: AboutYou): Promise<void> {
  if (values.displayName)
    await user.type(screen.getByLabelText("Display name"), values.displayName);
  if (values.username) await user.type(screen.getByLabelText("Username"), values.username);
  if (values.password) {
    await user.type(screen.getByLabelText("Password"), values.password);
    await user.type(screen.getByLabelText("Confirm password"), values.password);
  }
  if (values.dateOfBirth) {
    setPickedDate(values.dateOfBirth);
    await user.press(screen.getByRole("button", { name: /^Date of birth/ }));
    await user.press(screen.getByRole("button", { name: "Choose test date" }));
    await user.press(screen.getByRole("button", { name: "Done" }));
  }
  if (values.genderLabel) await user.press(screen.getByRole("radio", { name: values.genderLabel }));
}

/**
 * Picks a photo from the (mocked) library.
 * @param user The user event instance.
 * @param photo The picker's result.
 */
async function pickPhoto(user: User, photo: PickedPhoto): Promise<void> {
  picker.mockResolvedValueOnce({
    canceled: false,
    assets: [{ ...photo, fileName: photo.fileName ?? null }],
  } as unknown as ImagePicker.ImagePickerResult);
  await user.press(screen.getByRole("button", { name: /photo$/ }));
}

/**
 * Presses Use GPS with the (mocked) GPS at a point.
 * @param user The user event instance.
 * @param lat Latitude.
 * @param lon Longitude.
 */
async function pressUseGps(user: User, lat: number, lon: number): Promise<void> {
  location.requestForegroundPermissionsAsync.mockResolvedValueOnce({
    granted: true,
  } as Location.LocationPermissionResponse);
  location.getCurrentPositionAsync.mockResolvedValueOnce({
    coords: { latitude: lat, longitude: lon },
  } as Location.LocationObject);
  await user.press(screen.getByRole("button", { name: "Use GPS" }));
}

/**
 * Presses Next and waits for the next step's heading.
 * @param user The user event instance.
 * @param heading The next step's title.
 */
async function next(user: User, heading: string): Promise<void> {
  await user.press(screen.getByRole("button", { name: "Next" }));
  expect(await screen.findByRole("header", { name: heading })).toBeOnTheScreen();
}

/**
 * Fills all three steps for mint_01 and stops on step 3 (preferences 24–32, Men, 30 km).
 * @param user The user event instance.
 * @param about Step 1 values.
 */
async function fillAllSteps(user: User, about: AboutYou = MINT_ABOUT): Promise<void> {
  await fillAboutYou(user, about);
  await next(user, "Photo & place");
  await pickPhoto(user, SQUARE_500);
  await pressUseGps(user, MINT.location.lat, MINT.location.lon);
  await screen.findByText(/^Found:/);
  await next(user, "Preferences");
  await user.press(screen.getByRole("radio", { name: "Men" }));
  await stepKnob("Minimum age", "increment", 6);
  await stepKnob("Maximum age", "increment", 7);
  await stepKnob("Maximum distance", "decrement", 20);
}

/**
 * Moves a slider knob with screen reader actions.
 * @param label The knob's label.
 * @param action "increment" or "decrement".
 * @param times How many steps.
 */
async function stepKnob(label: string, action: string, times: number): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await fireEvent(screen.getByLabelText(label), "accessibilityAction", {
      nativeEvent: { actionName: action },
    });
  }
}

/**
 * Renders Create profile on top of Landing.
 * @returns The render result.
 */
function renderCreateProfile(): Promise<Rendered> {
  return renderScreen(CreateProfileScreen, "CreateProfile", undefined, { below: "Landing" });
}

beforeEach(() => {
  jest.clearAllMocks();
  profile.checkUsername.mockResolvedValue(true);
  photos.uploadTemp.mockResolvedValue(UPLOAD);
  photos.deleteTemp.mockResolvedValue(undefined);
  places.lookup.mockResolvedValue("Bangkok, Pathum Wan");
});

describe("Step 1", () => {
  it("UT-SCR-04: Next waits for the required fields and the username shows its message", async () => {
    const user = userEvent.setup();
    await renderCreateProfile();

    await fillAboutYou(user, { ...MINT_ABOUT, username: "" });
    await user.type(screen.getByLabelText("Username"), " ");
    await user.clear(screen.getByLabelText("Username"));

    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByText("Username is required.")).toBeOnTheScreen();
  });
});

describe("Step 1 username check", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("UT-SCR-05: the availability check is debounced and ignores a late answer", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    let answerMint: (isAvailable: boolean) => void = () => undefined;
    profile.checkUsername.mockImplementation((name: string) =>
      name === "mint"
        ? new Promise<boolean>((resolve) => (answerMint = resolve))
        : Promise.resolve(true),
    );
    await renderCreateProfile();
    const field = screen.getByLabelText("Username");

    await user.type(field, "m", { skipBlur: true });
    await user.type(field, "i", { skipBlur: true });
    await user.type(field, "nt", { skipBlur: true });
    await act(() => jest.advanceTimersByTime(500));
    const callsForMint = profile.checkUsername.mock.calls.map((call) => call[0]);
    await user.type(field, "1", { skipBlur: true });
    await act(() => jest.advanceTimersByTime(500));
    await act(async () => answerMint(false));

    expect(callsForMint).toEqual(["mint"]);
    expect(profile.checkUsername.mock.calls.map((call) => call[0])).toEqual(["mint", "mint1"]);
    expect(await screen.findByText("Available")).toBeOnTheScreen();
    expect(screen.queryByText("Taken")).not.toBeOnTheScreen();
  });
});

describe("Submit", () => {
  it("UT-SCR-06: a username taken at Submit goes back to step 1 and keeps every value", async () => {
    const user = userEvent.setup();
    profile.createProfile.mockRejectedValueOnce(new ApiError(409, "USERNAME_TAKEN", "Taken"));
    await renderCreateProfile();
    await fillAllSteps(user, { ...MINT_ABOUT, username: "alice" });

    await user.press(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByRole("header", { name: "About you" })).toBeOnTheScreen();
    expect(screen.getByText("That username is already in use. Try another one.")).toBeOnTheScreen();
    expect(screen.getByLabelText("Username")).toHaveDisplayValue("alice");
    expect(screen.getByLabelText("Display name")).toHaveDisplayValue("Mint");
    expect(screen.getByLabelText("Password")).toHaveDisplayValue("Mint2026");
    expect(screen.getByRole("radio", { name: "Woman" })).toBeChecked();
  });

  it("UT-SCR-11: a valid profile is created and logged in", async () => {
    const user = userEvent.setup();
    const created = {
      accessToken: "at_m",
      refreshToken: "rt_m",
      userId: "usr_mint_01",
      profile: { ...ownProfileOf("alice"), userId: "usr_mint_01", username: "mint_01" },
    };
    profile.createProfile.mockResolvedValueOnce(created);
    const { session } = await renderCreateProfile();
    await fillAllSteps(user);

    await user.press(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(session.logIn).toHaveBeenCalledWith(created));
    expect(profile.createProfile).toHaveBeenCalledWith({
      username: "mint_01",
      password: "Mint2026",
      displayName: "Mint",
      dateOfBirth: "1999-09-15",
      gender: "female",
      location: { lat: 13.73, lon: 100.53 },
      photoUploadId: "upl_1",
      preferences: { minAge: 24, maxAge: 32, targetGenders: ["male"], radiusKm: 30 },
    });
  });
});

describe("Step 2 photo", () => {
  it("UT-SCR-07: a bad photo is refused before any upload", async () => {
    const user = userEvent.setup();
    await renderCreateProfile();
    await fillAboutYou(user, MINT_ABOUT);
    await next(user, "Photo & place");

    await pickPhoto(user, ANIM_GIF);
    const gif = await screen.findByText("Use a PNG, JPG or WebP photo.");
    await pickPhoto(user, SQUARE_BIG);
    const big = await screen.findByText("Photo must be 1 MB or smaller.");
    await pickPhoto(user, WIDE_800X600);
    const wide = await screen.findByText("Photo must be square (same width and height).");

    expect([gif, big, wide]).toHaveLength(3);
    expect(photos.uploadTemp).not.toHaveBeenCalled();
  });
});

describe("Step 2", () => {
  it("UT-SCR-08: with no photo, Next stays disabled and asks for one", async () => {
    const user = userEvent.setup();
    await renderCreateProfile();
    await fillAboutYou(user, MINT_ABOUT);
    await next(user, "Photo & place");
    await pressUseGps(user, MINT.location.lat, MINT.location.lon);
    await screen.findByText(/^Found:/);

    // A tap on the dimmed Next reaches the View around it (onTouchStart), which marks the step as
    // tried. RNTL doesn't pass touches through a disabled button, so fire on that View.
    await fireEvent(screen.getByRole("button", { name: "Next" }).parent!, "touchStart");

    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(await screen.findByText("Add a profile photo to continue.")).toBeOnTheScreen();
  });
});

describe("Step 2 location", () => {
  it("UT-SCR-09: a spot with no place name still lets the user continue", async () => {
    const user = userEvent.setup();
    places.lookup.mockRejectedValueOnce(new ApiError(404, "PLACE_NOT_FOUND", "No name"));
    profile.createProfile.mockResolvedValueOnce({
      accessToken: "a",
      refreshToken: "r",
      userId: "u",
    });
    await renderCreateProfile();
    await fillAboutYou(user, MINT_ABOUT);
    await next(user, "Photo & place");
    await pickPhoto(user, SQUARE_500);

    await pressUseGps(user, 12.5, 100.9);

    expect(await screen.findByText("No place name for this spot")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
    await next(user, "Preferences");
    await user.press(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(profile.createProfile).toHaveBeenCalled());
    const body = profile.createProfile.mock.calls[0][0];
    expect(body.location).toEqual({ lat: 12.5, lon: 100.9 });
    expect(body).not.toHaveProperty("placeName");
  });
});

describe("Cancel", () => {
  it("UT-SCR-10: discards only after confirming, and deletes the uploaded photo", async () => {
    const user = userEvent.setup();
    const { navigation } = await renderCreateProfile();
    await fillAboutYou(user, MINT_ABOUT);
    await next(user, "Photo & place");
    await pickPhoto(user, SQUARE_500);
    await waitFor(() => expect(photos.uploadTemp).toHaveBeenCalled());
    // The footer's Back (the top bar has a Back button too).
    await user.press(screen.getAllByRole("button", { name: "Back" }).at(-1)!);
    await screen.findByRole("header", { name: "About you" });

    await user.press(screen.getByRole("button", { name: "Cancel" }));
    await user.press(await screen.findByRole("button", { name: "Keep editing" }));
    const keptName = screen.getByLabelText("Display name");
    await user.press(screen.getByRole("button", { name: "Cancel" }));
    await user.press(await screen.findByRole("button", { name: "Discard" }));

    expect(keptName).toHaveDisplayValue("Mint");
    await waitFor(() => expect(currentRoute(navigation).name).toBe("Landing"));
    expect(photos.deleteTemp).toHaveBeenCalledWith(UPLOAD);
  });
});
