/**
 * SwitchUserScreen.test.tsx
 * UT-SCR-25: after switching user, back can't reach the previous user's screens
 * (unit-test-plan.md 6.19). Renders the whole App, because the reset happens there: the navigation
 * container is keyed by the user. Jest runs as iOS, which has no hardware back button, so the test
 * checks that none of the old user's screens are left in the navigation tree.
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { render, screen, userEvent } from "@testing-library/react-native";

import { setAliceDefaults } from "../../../test/apiDefaults";
import { ownProfileOf } from "../../../test/fixtures/seed";
import { secureStoreData } from "../../../test/secureStore";
import App from "../../App";
import { profileApi } from "../../api/profile";
import { sessionsApi } from "../../api/sessions";
import { queryClient as appQueryClient } from "../../session/queryClient";

jest.mock("../../api/profile");
jest.mock("../../api/sessions");
jest.mock("../../api/messaging");
jest.mock("../../api/matching");
jest.mock("../../api/favorites");
jest.mock("../../api/notes");
// Fonts aren't under test (and expo-font needs expo-asset, which Jest can't load): report them loaded.
jest.mock("@expo-google-fonts/inter/useFonts", () => ({ useFonts: () => [true, null] }));

beforeEach(() => {
  jest.clearAllMocks();
  setAliceDefaults();
});

describe("SwitchUser", () => {
  it("UT-SCR-25: after switching to bob, none of alice's screens are left to go back to", async () => {
    const user = userEvent.setup();
    const ALICE = ownProfileOf("alice");
    const BOB = ownProfileOf("bob");
    secureStoreData.set("mairu.accessToken", "at1");
    secureStoreData.set("mairu.refreshToken", "rt1");
    jest
      .mocked(profileApi.getMe)
      .mockImplementation(async () =>
        secureStoreData.get("mairu.accessToken") === "bt1" ? BOB : ALICE,
      );
    jest.mocked(sessionsApi.logIn).mockResolvedValue({
      accessToken: "bt1",
      refreshToken: "brt1",
      userId: BOB.userId,
      profile: BOB,
    });
    jest.mocked(sessionsApi.logOut).mockResolvedValue(undefined);
    await render(<App />);
    await screen.findByText("Hi, Alice");

    await user.press(screen.getByRole("button", { name: "Open your profile" }));
    await user.press(await screen.findByRole("button", { name: /Switch user/ }));
    await user.press(await screen.findByRole("button", { name: "Add account" }));
    await user.type(await screen.findByLabelText("Username"), "bob");
    await user.type(screen.getByLabelText("Password"), "Bob2026x");
    await user.press(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Hi, Bob")).toBeOnTheScreen();
    expect(sessionsApi.logOut).toHaveBeenCalledWith("at1", "rt1");
    // Hidden screens further down a stack stay rendered; none of alice's are there.
    const hidden = { includeHiddenElements: true };
    expect(screen.queryByText("Hi, Alice", hidden)).not.toBeOnTheScreen();
    expect(screen.queryByRole("header", { name: "Switch user", ...hidden })).not.toBeOnTheScreen();
    expect(screen.queryByText("Welcome back", hidden)).not.toBeOnTheScreen();
    // App uses the app-wide query client: stop it so nothing runs into the next test.
    await screen.unmount();
    appQueryClient.clear();
  });
});
