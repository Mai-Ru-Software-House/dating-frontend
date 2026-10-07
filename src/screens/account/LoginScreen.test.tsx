/**
 * LoginScreen.test.tsx
 * UT-SCR-01 to 03: logging in (unit-test-plan.md 6.19). The sessions API is mocked; the session is
 * a fake from renderWithProviders.
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { ownProfileOf, USERS } from "../../../test/fixtures/seed";
import { secureStoreData } from "../../../test/secureStore";
import { currentRoute, renderScreen } from "../../../test/renderWithProviders";
import { ApiError } from "../../api/errors";
import { sessionsApi } from "../../api/sessions";
import { colors } from "../../theme";
import { LoginScreen } from "./LoginScreen";

jest.mock("../../api/sessions");

const logInApi = jest.mocked(sessionsApi.logIn);

/**
 * Fills in the form and presses Log in.
 * @param username The username to type ("" to leave it empty).
 * @param password The password to type ("" to leave it empty).
 */
async function logIn(username: string, password: string): Promise<void> {
  const user = userEvent.setup();
  if (username !== "") await user.type(screen.getByLabelText("Username"), username);
  if (password !== "") await user.type(screen.getByLabelText("Password"), password);
  await user.press(screen.getByRole("button", { name: "Log in" }));
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("LoginScreen", () => {
  it("UT-SCR-01: empty fields get their messages and nothing is sent", async () => {
    await renderScreen(LoginScreen, "Login");

    await logIn("", "");

    expect(screen.getByText("Enter your username.")).toBeOnTheScreen();
    expect(screen.getByText("Enter your password.")).toBeOnTheScreen();
    expect(logInApi).not.toHaveBeenCalled();
  });

  it("UT-SCR-02: a wrong password shows the banner and a red password field", async () => {
    logInApi.mockRejectedValueOnce(new ApiError(401, "INVALID_CREDENTIALS", "Invalid"));
    const { session, navigation } = await renderScreen(LoginScreen, "Login");

    await logIn("alice", "wrongpass1");

    expect(await screen.findByText("Wrong username or password.")).toBeOnTheScreen();
    const passwordBox = screen.getByLabelText("Password").parent;
    expect(StyleSheet.flatten(passwordBox?.props.style)).toMatchObject({
      borderColor: colors.accent,
    });
    expect(session.logIn).not.toHaveBeenCalled();
    expect(secureStoreData.size).toBe(0);
    expect(currentRoute(navigation).name).toBe("Login");
  });

  it("UT-SCR-03: a successful login hands the tokens to the session", async () => {
    const result = {
      accessToken: "at1",
      refreshToken: "rt1",
      userId: USERS.alice.userId,
      profile: ownProfileOf("alice"),
    };
    logInApi.mockResolvedValueOnce(result);
    const { session } = await renderScreen(LoginScreen, "Login");

    await logIn("alice", "Alice2026");

    await waitFor(() => expect(session.logIn).toHaveBeenCalledWith(result));
    expect(logInApi).toHaveBeenCalledWith("alice", "Alice2026");
  });
});
