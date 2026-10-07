/**
 * HomeScreen.test.tsx
 * UT-SCR-12 and 13: the unread list on Home and its refresh on focus (unit-test-plan.md 6.19).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { act, screen, waitFor } from "@testing-library/react-native";

import { setAliceDefaults } from "../../../test/apiDefaults";
import { freezeToday } from "../../../test/fixtures/clock";
import { ALICE_UNREAD, ownProfileOf } from "../../../test/fixtures/seed";
import { renderScreen, testQueryClient } from "../../../test/renderWithProviders";
import { messagingApi } from "../../api/messaging";
import { keys } from "../../session/queryClient";
import { HomeScreen } from "./HomeScreen";

jest.mock("../../api/profile");
jest.mock("../../api/messaging");
jest.mock("../../api/matching");
jest.mock("../../api/favorites");

const getUnread = jest.mocked(messagingApi.getUnread);

/**
 * Renders Home for a seed user.
 * @param username The signed-in user.
 * @returns The render result.
 */
function renderHome(username: string): ReturnType<typeof renderScreen> {
  const queryClient = testQueryClient();
  queryClient.setQueryData(keys.me, ownProfileOf(username));
  return renderScreen(HomeScreen, "HomeTab", undefined, { queryClient });
}

beforeEach(() => {
  jest.clearAllMocks();
  setAliceDefaults();
  freezeToday();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("HomeScreen", () => {
  it("UT-SCR-12: alice sees bob's row with 3 unread at 09:20; fah is all caught up", async () => {
    await renderHome("alice");

    const bob = await screen.findByText("There is a jazz night at Siam on Saturday.");
    expect(bob).toBeOnTheScreen();
    expect(screen.getByText("09:20")).toBeOnTheScreen();
    expect(screen.getByText("3")).toBeOnTheScreen();

    await screen.unmount();
    getUnread.mockResolvedValue({ messages: [], hasMore: false });
    await renderHome("fah");

    expect(await screen.findByText("You're all caught up.")).toBeOnTheScreen();
  });

  it("UT-SCR-13: the unread list refreshes when Home is focused again", async () => {
    const { navigation } = await renderHome("alice");
    await screen.findByText("There is a jazz night at Siam on Saturday.");
    getUnread.mockResolvedValue({ messages: [], hasMore: false });

    await act(() => navigation.navigate("Conversation", { userId: "usr_bob" }));
    await act(() => navigation.goBack());

    expect(await screen.findByText("You're all caught up.")).toBeOnTheScreen();
    await waitFor(() => expect(getUnread).toHaveBeenCalledTimes(2));
    expect(ALICE_UNREAD).toHaveLength(3);
  });
});
