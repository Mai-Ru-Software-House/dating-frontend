/**
 * useFavorites.test.tsx
 * UT-FAV: the favorites set and its optimistic toggle (unit-test-plan.md 6.15). The API module is
 * mocked.
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { act, renderHook, screen, waitFor } from "@testing-library/react-native";

import { USERS } from "../../test/fixtures/seed";
import { createWrapper } from "../../test/renderWithProviders";
import { favoritesApi } from "../api/favorites";
import { ApiError } from "../api/errors";
import { keys } from "../session/queryClient";
import { useFavorites } from "./useFavorites";

jest.mock("../api/favorites");

const api = jest.mocked(favoritesApi);
const BOB = USERS.bob.userId;
const CHAI = USERS.chai.userId;

/**
 * Renders the hook with alice's favorites {chai} loaded.
 * @returns The hook result and the query client.
 */
async function renderFavorites(): Promise<{
  result: { current: ReturnType<typeof useFavorites> };
  queryClient: ReturnType<typeof createWrapper>["queryClient"];
}> {
  api.getFavorites.mockResolvedValue([CHAI]);
  const { wrapper, queryClient } = createWrapper();
  const { result } = await renderHook(() => useFavorites(), { wrapper });
  await waitFor(() => expect(result.current.isFavorite(CHAI)).toBe(true));
  return { result, queryClient };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("toggleFavorite", () => {
  it("UT-FAV-01: adds a favorite before the PUT returns", async () => {
    let finishPut: () => void = () => undefined;
    api.add.mockImplementationOnce(() => new Promise<void>((resolve) => (finishPut = resolve)));
    const { result, queryClient } = await renderFavorites();
    const invalidate = jest.spyOn(queryClient, "invalidateQueries");

    await act(() => result.current.toggle(BOB));

    await waitFor(() => expect([...result.current.favorites]).toEqual([CHAI, BOB]));
    expect(api.add).toHaveBeenCalledWith(BOB);
    await act(async () => finishPut());
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: keys.conversations }));
  });

  it("UT-FAV-02: adding twice keeps one entry", async () => {
    api.add.mockResolvedValue(undefined);
    const { result } = await renderFavorites();

    await act(() => {
      result.current.toggle(BOB);
      result.current.toggle(BOB);
    });

    await waitFor(() => expect(api.add).toHaveBeenCalledTimes(2));
    expect([...result.current.favorites].filter((id) => id === BOB)).toHaveLength(1);
    expect(screen.queryByText("Couldn't update favorites. Try again.")).not.toBeOnTheScreen();
  });

  it("UT-FAV-03: removes a favorite", async () => {
    api.remove.mockResolvedValueOnce(undefined);
    const { result } = await renderFavorites();

    await act(() => result.current.toggle(CHAI));

    await waitFor(() => expect(result.current.isFavorite(CHAI)).toBe(false));
    expect(api.remove).toHaveBeenCalledWith(CHAI);
  });

  it("UT-FAV-04: a failure rolls back and shows a toast", async () => {
    api.add.mockRejectedValueOnce(new ApiError(0, "NETWORK_ERROR", "offline"));
    const { result } = await renderFavorites();

    await act(() => result.current.toggle(BOB));

    await waitFor(() => expect([...result.current.favorites]).toEqual([CHAI]));
    expect(await screen.findByText("Couldn't update favorites. Try again.")).toBeOnTheScreen();
  });
});
