/**
 * SessionProvider.test.tsx
 * UT-SES: start-up, log in, log out, switch user and expiry (unit-test-plan.md 6.9). The API
 * modules are mocked; secure storage is the in-memory mock from test/setup.ts.
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, waitFor } from "@testing-library/react-native";

import { ownProfileOf } from "../../test/fixtures/seed";
import { secureStoreData } from "../../test/secureStore";
import { ApiError } from "../api/errors";
import { profileApi } from "../api/profile";
import { sessionsApi } from "../api/sessions";
import { SessionProvider, useSession, type SessionApi } from "./SessionProvider";
import { keys } from "./queryClient";

jest.mock("../api/profile");
jest.mock("../api/sessions");

const mockShowToast = jest.fn();
jest.mock("../components/Toast", () => {
  const toast = { show: (text: string) => mockShowToast(text) };
  return {
    ToastProvider: ({ children }: { children: React.ReactNode }) => children,
    useToast: () => toast,
  };
});

const getMe = jest.mocked(profileApi.getMe);
const logInApi = jest.mocked(sessionsApi.logIn);
const logOutApi = jest.mocked(sessionsApi.logOut);

const ALICE = ownProfileOf("alice");
const BOB = ownProfileOf("bob");
const ACCESS = "mairu.accessToken";
const REFRESH = "mairu.refreshToken";

/**
 * Renders the provider and gives access to the session.
 * @returns The current session getter and the query client.
 */
async function renderSession(): Promise<{ session: () => SessionApi; queryClient: QueryClient }> {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let current: SessionApi | null = null;
  /** Reads the session on every render. */
  function Probe(): null {
    current = useSession();
    return null;
  }
  await render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <Probe />
      </SessionProvider>
    </QueryClientProvider>,
  );
  return {
    session: () => {
      if (current === null) throw new Error("Not rendered");
      return current;
    },
    queryClient,
  };
}

/**
 * Starts the app signed in as alice with tokens at1 / rt1.
 * @returns What renderSession returns, once signed in.
 */
async function signedInAsAlice(): ReturnType<typeof renderSession> {
  secureStoreData.set(ACCESS, "at1");
  secureStoreData.set(REFRESH, "rt1");
  getMe.mockResolvedValueOnce(ALICE);
  const rendered = await renderSession();
  await waitFor(() => expect(rendered.session().status).toBe("signedIn"));
  return rendered;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("app start", () => {
  it("UT-SES-01: with no stored token, shows Landing without calling the API", async () => {
    const { session } = await renderSession();

    await waitFor(() => expect(session().status).toBe("signedOut"));
    expect(getMe).not.toHaveBeenCalled();
  });

  it("UT-SES-02: with a stored token, loads the profile and signs in", async () => {
    const { session, queryClient } = await signedInAsAlice();

    expect(session().userId).toBe(ALICE.userId);
    expect(queryClient.getQueryData(keys.me)).toEqual(ALICE);
  });

  it("UT-SES-03: a token that is no longer valid deletes the tokens and signs out", async () => {
    secureStoreData.set(ACCESS, "at1");
    secureStoreData.set(REFRESH, "rt1");
    getMe.mockRejectedValueOnce(new ApiError(401, "UNAUTHENTICATED", "expired"));

    const { session } = await renderSession();

    await waitFor(() => expect(session().status).toBe("signedOut"));
    expect(secureStoreData.has(ACCESS)).toBe(false);
    expect(secureStoreData.has(REFRESH)).toBe(false);
  });

  it("UT-SES-04: being offline is not logged out", async () => {
    secureStoreData.set(ACCESS, "at1");
    secureStoreData.set(REFRESH, "rt1");
    getMe.mockRejectedValueOnce(new ApiError(0, "NETWORK_ERROR", "offline"));

    const { session } = await renderSession();

    await waitFor(() => expect(session().status).toBe("offline"));
    expect(secureStoreData.get(ACCESS)).toBe("at1");
    expect(secureStoreData.get(REFRESH)).toBe("rt1");
  });
});

describe("logIn", () => {
  it("UT-SES-05: keeps the tokens in secure storage only", async () => {
    const { session } = await renderSession();
    await waitFor(() => expect(session().status).toBe("signedOut"));

    await act(() =>
      session().logIn({
        accessToken: "at1",
        refreshToken: "rt1",
        userId: ALICE.userId,
        profile: ALICE,
      }),
    );

    expect(session().status).toBe("signedIn");
    expect(secureStoreData.get(ACCESS)).toBe("at1");
    expect(secureStoreData.get(REFRESH)).toBe("rt1");
    const stored = [...secureStoreData.values()].join(" ");
    expect(stored.match(/at1|rt1/g)).toHaveLength(2);
  });
});

describe("logOut", () => {
  it("UT-SES-06: calls the logout endpoint, deletes the tokens and empties the cache", async () => {
    const { session, queryClient } = await signedInAsAlice();
    queryClient.setQueryData(keys.conversations, [{ cached: true }]);
    logOutApi.mockRejectedValueOnce(new ApiError(0, "NETWORK_ERROR", "offline"));

    await act(() => session().logOut());

    expect(logOutApi).toHaveBeenCalledWith("at1", "rt1");
    expect(secureStoreData.has(ACCESS)).toBe(false);
    expect(secureStoreData.has(REFRESH)).toBe(false);
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(session().status).toBe("signedOut");
  });
});

describe("switchTo", () => {
  it("UT-SES-07: a failed login keeps the old session", async () => {
    const { session } = await signedInAsAlice();
    logInApi.mockRejectedValueOnce(new ApiError(401, "INVALID_CREDENTIALS", "wrong"));

    const result = act(() => session().switchTo("bob", "wrongpass"));

    await expect(result).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
    expect(session().userId).toBe(ALICE.userId);
    expect(secureStoreData.get(ACCESS)).toBe("at1");
    expect(logOutApi).not.toHaveBeenCalled();
  });

  it("UT-SES-07: a successful login ends the old session and signs in as the new user", async () => {
    const { session, queryClient } = await signedInAsAlice();
    queryClient.setQueryData(keys.conversations, [{ alices: true }]);
    logInApi.mockResolvedValueOnce({
      accessToken: "bt1",
      refreshToken: "brt1",
      userId: BOB.userId,
      profile: BOB,
    });

    await act(() => session().switchTo("bob", "Bob2026x"));

    expect(logOutApi).toHaveBeenCalledWith("at1", "rt1");
    expect(secureStoreData.get(ACCESS)).toBe("bt1");
    expect(secureStoreData.get(REFRESH)).toBe("brt1");
    expect(queryClient.getQueryData(keys.conversations)).toBeUndefined();
    expect(session().status).toBe("signedIn");
    expect(session().userId).toBe(BOB.userId);
  });
});

describe("expire", () => {
  it("UT-SES-08: runs once even when called three times in the same tick", async () => {
    const { session, queryClient } = await signedInAsAlice();
    const clear = jest.spyOn(queryClient, "clear");

    await act(() => {
      session().expire();
      session().expire();
      session().expire();
    });

    await waitFor(() => expect(session().status).toBe("signedOut"));
    expect(mockShowToast).toHaveBeenCalledTimes(1);
    expect(mockShowToast).toHaveBeenCalledWith("You've been logged out. Log in again.");
    expect(clear).toHaveBeenCalledTimes(1);
  });
});
