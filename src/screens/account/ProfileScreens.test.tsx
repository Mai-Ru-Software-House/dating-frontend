/**
 * ProfileScreens.test.tsx
 * UT-SCR-24 and 26: own profile, and a new photo from Edit profile (unit-test-plan.md 6.19).
 * SCR-25 is in SwitchUserScreen.test.tsx. SCR-26 runs against Edit profile as the app has it now (FEATURES.editProfile is on
 * with mocks only); recheck it when PATCH /users/me is confirmed (P17).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { screen, userEvent, waitFor, within } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";

import { setAliceDefaults } from "../../../test/apiDefaults";
import { freezeToday } from "../../../test/fixtures/clock";
import { SQUARE_500 } from "../../../test/fixtures/photos";
import { ownProfileOf } from "../../../test/fixtures/seed";
import { renderScreen, testQueryClient } from "../../../test/renderWithProviders";
import { photosApi } from "../../api/photos";
import { profileApi } from "../../api/profile";
import type { OwnProfile } from "../../api/types";
import { keys } from "../../session/queryClient";
import { EditProfileScreen } from "./EditProfileScreen";
import { ProfileScreen } from "./ProfileScreen";

jest.mock("../../api/profile");
jest.mock("../../api/photos");
jest.mock("../../api/messaging");
jest.mock("../../api/matching");
jest.mock("../../api/favorites");
jest.mock("../../api/notes");

const TEEN: OwnProfile = {
  ...ownProfileOf("alice"),
  username: "abcdefghij0123456789",
  displayName: "Teen",
  dateOfBirth: "2008-10-06",
};

beforeEach(() => {
  jest.clearAllMocks();
  setAliceDefaults();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("Profile", () => {
  it("UT-SCR-24: shows age 18 on the 18th birthday, the full username, and asks before logging out", async () => {
    freezeToday();
    const user = userEvent.setup();
    jest.mocked(profileApi.getMe).mockResolvedValue(TEEN);
    const queryClient = testQueryClient();
    queryClient.setQueryData(keys.me, TEEN);
    const { session } = await renderScreen(ProfileScreen, "Profile", undefined, { queryClient });

    await user.press(screen.getByRole("button", { name: "Log out" }));
    const dialog = await screen.findByRole("header", { name: "Log out?" });
    const asked = session.logOut;
    const calledBeforeConfirm = jest.mocked(asked).mock.calls.length;
    await user.press(within(dialog.parent!).getByRole("button", { name: "Log out" }));

    expect(screen.getByRole("header", { name: "Teen, 18" })).toBeOnTheScreen();
    expect(screen.getByText("abcdefghij0123456789")).toBeOnTheScreen();
    expect(calledBeforeConfirm).toBe(0);
    await waitFor(() => expect(session.logOut).toHaveBeenCalledTimes(1));
  });
});

describe("EditProfile", () => {
  it("UT-SCR-26: a new photo alone is saved with one PUT and no PATCH", async () => {
    const user = userEvent.setup();
    const ALICE = ownProfileOf("alice");
    const queryClient = testQueryClient();
    queryClient.setQueryData(keys.me, ALICE);
    jest
      .mocked(photosApi.replaceMine)
      .mockResolvedValueOnce({ photoUrl: "/api/v1/photos/pho_new" });
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({
      canceled: false,
      assets: [SQUARE_500],
    } as unknown as ImagePicker.ImagePickerResult);
    await renderScreen(EditProfileScreen, "EditProfile", undefined, { queryClient });

    // The photo tile and the "Change photo" link both open the picker.
    await user.press(screen.getAllByRole("button", { name: "Change photo" })[0]);
    await user.press(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(photosApi.replaceMine).toHaveBeenCalledTimes(1));
    expect(profileApi.updateMe).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(queryClient.getQueryData<OwnProfile>(keys.me)?.photoUrl).toBe(
        "/api/v1/photos/pho_new",
      ),
    );
  });
});
