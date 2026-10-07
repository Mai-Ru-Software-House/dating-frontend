/**
 * MatchScreens.test.tsx
 * UT-SCR-14 to 16: recommendations, search and the candidate profile (unit-test-plan.md 6.19).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { fireEvent, screen, userEvent, waitFor } from "@testing-library/react-native";
import { View } from "react-native";

import { setAliceDefaults } from "../../../test/apiDefaults";
import { ALICE_RECOMMENDATIONS, ownProfileOf, USERS } from "../../../test/fixtures/seed";
import {
  currentRoute,
  renderScreen,
  renderWithProviders,
  testQueryClient,
} from "../../../test/renderWithProviders";
import { ApiError } from "../../api/errors";
import { matchingApi } from "../../api/matching";
import { profileApi } from "../../api/profile";
import type { PublicProfile } from "../../api/types";
import { keys } from "../../session/queryClient";
import { CandidateProfileScreen } from "./CandidateProfileScreen";
import { RecommendedList } from "./RecommendedList";
import { SearchPanel } from "./SearchPanel";

jest.mock("../../api/profile");
jest.mock("../../api/matching");
jest.mock("../../api/favorites");

const matching = jest.mocked(matchingApi);

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

beforeEach(() => {
  jest.clearAllMocks();
  setAliceDefaults();
});

describe("RecommendedList", () => {
  it("UT-SCR-14: shows the matches as a card and rows", async () => {
    await renderWithProviders(<RecommendedList header={<View />} />);

    expect(await screen.findByText("Bob, 28")).toBeOnTheScreen();
    expect(screen.getByText("Chai, 25")).toBeOnTheScreen();
    expect(screen.getByText("88%")).toBeOnTheScreen();
  });

  it("UT-SCR-14: with no matches, says so", async () => {
    matching.getRecommendations.mockResolvedValue([]);

    await renderWithProviders(<RecommendedList header={<View />} />);

    expect(await screen.findByText("No one fits your preferences yet.")).toBeOnTheScreen();
    expect(screen.getByText("Try a wider age range or distance.")).toBeOnTheScreen();
  });

  it("UT-SCR-14: when the match engine is down, offers Try again", async () => {
    const user = userEvent.setup();
    matching.getRecommendations.mockRejectedValueOnce(
      new ApiError(500, "MATCH_ENGINE_UNAVAILABLE", "Down"),
    );
    await renderWithProviders(<RecommendedList header={<View />} />);

    expect(await screen.findByText("Couldn't load your matches.")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Bob, 28")).toBeOnTheScreen();
    expect(matching.getRecommendations).toHaveBeenCalledTimes(2);
  });
});

describe("SearchPanel", () => {
  it("UT-SCR-15: starts from alice's preferences and sends the chosen criteria", async () => {
    const user = userEvent.setup();
    const queryClient = testQueryClient();
    queryClient.setQueryData(keys.me, ownProfileOf("alice"));
    await renderWithProviders(<SearchPanel header={<View />} />, { queryClient });

    await user.press(screen.getByRole("button", { name: "Search" }));
    await waitFor(() => expect(matching.searchCandidates).toHaveBeenCalledTimes(1));
    await stepKnob("Minimum age", "increment", 1);
    await stepKnob("Maximum age", "decrement", 6);
    await stepKnob("Within", "decrement", 30);
    await user.press(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => expect(matching.searchCandidates).toHaveBeenCalledTimes(2));
    expect(matching.searchCandidates.mock.calls[0][0]).toMatchObject({
      minAge: 24,
      maxAge: 32,
      targetGenders: ["male"],
      maxDistanceKm: 50,
    });
    expect(matching.searchCandidates.mock.calls[1][0]).toMatchObject({
      minAge: 25,
      maxAge: 26,
      targetGenders: ["male"],
      maxDistanceKm: 20,
    });
  });
});

describe("CandidateProfile", () => {
  it("UT-SCR-16: shows public data only and opens the conversation", async () => {
    const user = userEvent.setup();
    const bob: PublicProfile = { ...ALICE_RECOMMENDATIONS[0], isFavorite: false };
    jest.mocked(profileApi.getUser).mockResolvedValueOnce(bob);
    const { navigation } = await renderScreen(CandidateProfileScreen, "CandidateProfile", {
      userId: USERS.bob.userId,
    });

    expect(await screen.findByRole("header", { name: "Bob, 28" })).toBeOnTheScreen();
    expect(screen.getByText("Silom, Bangkok · 3 km away")).toBeOnTheScreen();
    expect(screen.getByText("88%")).toBeOnTheScreen();
    // No date of birth (1998-05-20) or coordinates (13.7279, 100.5241) in any text or label.
    const hidden = { includeHiddenElements: true };
    const privateData = /1998|20 May|13\.72|100\.52/;
    expect(screen.queryAllByText(privateData, hidden)).toHaveLength(0);
    expect(screen.queryAllByLabelText(privateData, hidden)).toHaveLength(0);
    await user.press(screen.getByRole("button", { name: "Message" }));

    expect(currentRoute(navigation)).toEqual({
      name: "Conversation",
      params: { userId: bob.userId, displayName: "Bob", photoUrl: bob.photoUrl },
    });
  });
});
