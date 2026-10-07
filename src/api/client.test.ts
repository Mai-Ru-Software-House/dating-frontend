/**
 * client.test.ts
 * UT-API: the API client with fetch mocked (unit-test-plan.md 6.7). API-06 to API-08 (token
 * refresh) run against the refresh the app does now (POST /sessions/refresh, api-integration.md
 * 8.12); recheck them when the endpoint is in the contract (P1).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { ApiError } from "./errors";
import { favoritesApi } from "./favorites";
import { matchingApi } from "./matching";
import { messagingApi } from "./messaging";
import { notesApi } from "./notes";
import { photosApi } from "./photos";
import { placesApi } from "./places";
import { profileApi } from "./profile";
import { sessionsApi, toSession } from "./sessions";
import { photoSource, request, setSessionBridge, type Tokens } from "./client";
import { SQUARE_500 } from "../../test/fixtures/photos";
import { MINT, ownProfileOf } from "../../test/fixtures/seed";

jest.mock("../constants/env", () => ({
  API_BASE_URL: "http://10.0.2.2:3000/api/v1",
  USE_MOCKS: false,
  MOCK_FAIL: "",
}));

const BASE = "http://10.0.2.2:3000/api/v1";

/** A fake fetch response. A string body is sent as-is (not JSON). */
function reply(status: number, body?: unknown): Response {
  const text = body === undefined ? "" : typeof body === "string" ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => text,
    json: async () => JSON.parse(text),
  } as Response;
}

/** An error body as the API sends it. */
function apiError(code: string, message = "", field?: string): unknown {
  return { error: { code, message, field } };
}

const fetchMock = jest.fn<Promise<Response>, [string, RequestInit]>();
let tokens: Tokens | null;
const saveTokens = jest.fn(async (next: Tokens) => {
  tokens = next;
});
const expire = jest.fn();

/** The headers of the n-th fetch call. */
function headersOf(call: number): Record<string, string> {
  return fetchMock.mock.calls[call][1].headers as Record<string, string>;
}

beforeEach(() => {
  fetchMock.mockReset();
  saveTokens.mockClear();
  expire.mockClear();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  tokens = { accessToken: "at1", refreshToken: "rt1" };
  setSessionBridge({ getTokens: () => tokens, saveTokens, expire });
});

afterEach(() => {
  jest.useRealTimers();
});

describe("request", () => {
  it("UT-API-01: adds the base URL and the access token", async () => {
    fetchMock.mockResolvedValueOnce(reply(200, []));

    await request("GET", "/conversations");

    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/conversations`);
    expect(headersOf(0).Authorization).toBe("Bearer at1");
  });

  /** [name, call, method, path after the base URL, JSON body or undefined]. */
  const AUTHENTICATED: [string, () => Promise<unknown>, string, string, unknown][] = [
    ["getMe", () => profileApi.getMe(), "GET", "/users/me", undefined],
    ["getUser", () => profileApi.getUser("usr_bob"), "GET", "/users/usr_bob", undefined],
    [
      "updateMe",
      () => profileApi.updateMe({ displayName: "Al" }),
      "PATCH",
      "/users/me",
      { displayName: "Al" },
    ],
    ["replaceMine", () => photosApi.replaceMine(SQUARE_500), "PUT", "/users/me/photo", undefined],
    [
      "getRecommendations",
      () => matchingApi.getRecommendations(10),
      "GET",
      "/recommendations?limit=10",
      undefined,
    ],
    ["getFavorites", () => favoritesApi.getFavorites(), "GET", "/favorites", undefined],
    ["add favorite", () => favoritesApi.add("usr_bob"), "PUT", "/favorites/usr_bob", undefined],
    [
      "remove favorite",
      () => favoritesApi.remove("usr_chai"),
      "DELETE",
      "/favorites/usr_chai",
      undefined,
    ],
    ["getConversations", () => messagingApi.getConversations(), "GET", "/conversations", undefined],
    [
      "getMessages",
      () => messagingApi.getMessages("usr_dan", "dan_31"),
      "GET",
      "/conversations/usr_dan/messages?limit=30&before=dan_31",
      undefined,
    ],
    [
      "sendMessage",
      () => messagingApi.sendMessage("usr_bob", "Hi"),
      "POST",
      "/conversations/usr_bob/messages",
      { text: "Hi" },
    ],
    [
      "reply",
      () => messagingApi.reply("M3", "Yes"),
      "POST",
      "/messages/M3/replies",
      { text: "Yes" },
    ],
    [
      "markRead",
      () => messagingApi.markRead("usr_bob", "M4"),
      "PATCH",
      "/conversations/usr_bob",
      { lastReadMessageId: "M4" },
    ],
    [
      "getUnread",
      () => messagingApi.getUnread(),
      "GET",
      "/messages?unread=true&limit=50",
      undefined,
    ],
    ["getPeople", () => notesApi.getPeople(), "GET", "/notes/people", undefined],
    [
      "getNotes",
      () => notesApi.getNotes("usr_chai"),
      "GET",
      "/notes?aboutUserId=usr_chai",
      undefined,
    ],
    [
      "create note",
      () => notesApi.create("usr_bob", "Likes jazz"),
      "POST",
      "/notes",
      { aboutUserId: "usr_bob", text: "Likes jazz" },
    ],
    [
      "update note",
      () => notesApi.update("not_1", "Edited"),
      "PATCH",
      "/notes/not_1",
      { text: "Edited" },
    ],
    ["remove note", () => notesApi.remove("not_1"), "DELETE", "/notes/not_1", undefined],
  ];

  it.each(AUTHENTICATED)(
    "UT-API-01: %s calls the contract's endpoint with the base URL and the access token",
    async (_name, call, method, path, body) => {
      fetchMock.mockResolvedValueOnce(
        reply(200, {
          favorites: [],
          recommendations: [],
          conversations: [],
          people: [],
          notes: [],
          messages: [],
          hasMore: false,
        }),
      );

      await call();

      const [url, init] = fetchMock.mock.calls[0];
      expect(`${init.method} ${url}`).toBe(`${method} ${BASE}${path}`);
      expect(headersOf(0).Authorization).toBe("Bearer at1");
      if (body !== undefined) expect(JSON.parse(init.body as string)).toEqual(body);
    },
  );

  it("UT-API-02: sends no token to public endpoints", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/usernames/")) return reply(200, { isAvailable: true });
      if (url.includes("/places")) return reply(200, { placeName: "Bangkok, Siam" });
      if (url.includes("/photo-uploads")) {
        return reply(201, { uploadId: "upl_1", expiresAt: "x", deleteToken: "d" });
      }
      return reply(201, { accessToken: "at9", refreshToken: "rt9", userId: "usr_mint_01" });
    });

    await profileApi.checkUsername("mint_01");
    await placesApi.lookup(13.73, 100.53);
    await profileApi.createProfile({ ...MINT, photoUploadId: "upl_1" });
    await sessionsApi.logIn("alice", "Alice2026");
    await photosApi.uploadTemp(SQUARE_500);

    const urls = fetchMock.mock.calls.map((call) => call[0]);
    expect(urls).toEqual([
      `${BASE}/usernames/mint_01`,
      `${BASE}/places?lat=13.73&lon=100.53`,
      `${BASE}/users`,
      `${BASE}/sessions`,
      `${BASE}/photo-uploads`,
    ]);
    fetchMock.mock.calls.forEach((_, i) => expect(headersOf(i).Authorization).toBeUndefined());
  });

  it("UT-API-03: turns an error body into an ApiError with its field", async () => {
    fetchMock.mockResolvedValueOnce(
      reply(400, apiError("INVALID_INPUT", "Too young", "preferences.minAge")),
    );

    const result = request("PATCH", "/users/me", { body: {} });

    await expect(result).rejects.toMatchObject({
      status: 400,
      code: "INVALID_INPUT",
      field: "preferences.minAge",
    });
  });

  it("UT-API-04: a network failure and a non-JSON body are both NETWORK_ERROR", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Network request failed"));
    fetchMock.mockResolvedValueOnce(reply(502, "<html>Bad gateway</html>"));

    const offline = request("GET", "/conversations");
    const badGateway = request("GET", "/conversations");

    await expect(offline).rejects.toMatchObject({ status: 0, code: "NETWORK_ERROR" });
    await expect(badGateway).rejects.toMatchObject({ status: 0, code: "NETWORK_ERROR" });
  });

  it("UT-API-04: a 200 whose body isn't JSON, and an error with an unknown code, are NETWORK_ERROR", async () => {
    fetchMock.mockResolvedValueOnce(reply(200, "<html>Captive portal</html>"));
    fetchMock.mockResolvedValueOnce(reply(500, apiError("SOMETHING_NEW")));

    const notJson = request("GET", "/conversations");
    const unknownCode = request("GET", "/conversations");

    await expect(notJson).rejects.toMatchObject({ status: 0, code: "NETWORK_ERROR" });
    await expect(unknownCode).rejects.toMatchObject({ status: 0, code: "NETWORK_ERROR" });
  });

  it("UT-API-05: gives up after 15 s", async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementationOnce(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => reject(new Error("Aborted")));
        }),
    );

    const result = request("GET", "/conversations");
    jest.advanceTimersByTime(15_000);

    await expect(result).rejects.toMatchObject({ code: "NETWORK_ERROR" });
    expect(fetchMock.mock.calls[0][1].signal?.aborted).toBe(true);
  });

  it("UT-API-06: refreshes an expired access token once and retries the call", async () => {
    fetchMock
      .mockResolvedValueOnce(reply(401, apiError("UNAUTHENTICATED")))
      .mockResolvedValueOnce(reply(200, { accessToken: "at2", refreshToken: "rt2" }))
      .mockResolvedValueOnce(reply(200, [{ id: 1 }]));

    const result = await request("GET", "/conversations");

    expect(result).toEqual([{ id: 1 }]);
    expect(fetchMock.mock.calls[1][0]).toBe(`${BASE}/sessions/refresh`);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body as string)).toEqual({ refreshToken: "rt1" });
    expect(headersOf(2).Authorization).toBe("Bearer at2");
    expect(tokens).toEqual({ accessToken: "at2", refreshToken: "rt2" });
    expect(expire).not.toHaveBeenCalled();
  });

  it("UT-API-06: keeps the refresh token when the server doesn't send a new one", async () => {
    fetchMock
      .mockResolvedValueOnce(reply(401, apiError("UNAUTHENTICATED")))
      .mockResolvedValueOnce(reply(200, { accessToken: "at2" }))
      .mockResolvedValueOnce(reply(200, {}));

    await request("GET", "/users/me");

    expect(tokens).toEqual({ accessToken: "at2", refreshToken: "rt1" });
  });

  it("UT-API-07: many 401s at once share one refresh", async () => {
    fetchMock.mockImplementation(async (url: string, init: RequestInit) => {
      if (url.endsWith("/sessions/refresh")) {
        return reply(200, { accessToken: "at2", refreshToken: "rt2" });
      }
      const auth = (init.headers as Record<string, string>).Authorization;
      return auth === "Bearer at2"
        ? reply(200, { ok: true })
        : reply(401, apiError("UNAUTHENTICATED"));
    });

    const results = await Promise.all([
      request("GET", "/conversations"),
      request("GET", "/messages/unread"),
      request("GET", "/users/me"),
    ]);

    const refreshes = fetchMock.mock.calls.filter((call) => call[0].endsWith("/sessions/refresh"));
    expect(refreshes).toHaveLength(1);
    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
  });

  it("UT-API-08: a failed refresh ends the session without a retry loop", async () => {
    fetchMock
      .mockResolvedValueOnce(reply(401, apiError("UNAUTHENTICATED")))
      .mockResolvedValueOnce(reply(401, apiError("UNAUTHENTICATED")));

    const result = request("GET", "/conversations");

    await expect(result).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
    expect(expire).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("UT-API-08: without a refresh token (single-token login) the session ends with no refresh call", async () => {
    tokens = { accessToken: "at1", refreshToken: "" };
    fetchMock.mockResolvedValueOnce(reply(401, apiError("UNAUTHENTICATED")));

    const result = request("GET", "/conversations");

    await expect(result).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(expire).toHaveBeenCalledTimes(1);
  });

  it("UT-API-08: a refresh that can't reach the server keeps the session", async () => {
    fetchMock
      .mockResolvedValueOnce(reply(401, apiError("UNAUTHENTICATED")))
      .mockRejectedValueOnce(new TypeError("Network request failed"));

    const result = request("GET", "/conversations");

    await expect(result).rejects.toMatchObject({ code: "NETWORK_ERROR" });
    expect(expire).not.toHaveBeenCalled();
    expect(tokens).toEqual({ accessToken: "at1", refreshToken: "rt1" });
  });

  it("UT-API-08: a retry that is still 401 ends the session", async () => {
    fetchMock
      .mockResolvedValueOnce(reply(401, apiError("UNAUTHENTICATED")))
      .mockResolvedValueOnce(reply(200, { accessToken: "at2", refreshToken: "rt2" }))
      .mockResolvedValueOnce(reply(401, apiError("UNAUTHENTICATED")));

    const result = request("GET", "/conversations");

    await expect(result).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
    expect(expire).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("UT-API-09: a wrong password never triggers a refresh", async () => {
    fetchMock.mockResolvedValueOnce(reply(401, apiError("INVALID_CREDENTIALS")));

    const result = sessionsApi.logIn("alice", "wrongpass1");

    await expect(result).rejects.toBeInstanceOf(ApiError);
    await expect(result).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(expire).not.toHaveBeenCalled();
  });
});

describe("searchCandidates", () => {
  it("UT-API-10: sends the criteria in the query string, without lat or lon", async () => {
    fetchMock.mockResolvedValueOnce(reply(200, { candidates: [] }));

    await matchingApi.searchCandidates({
      minAge: 25,
      maxAge: 26,
      targetGenders: ["male"],
      maxDistanceKm: 20,
    });

    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain("minAge=25&maxAge=26&targetGenders=male&maxDistanceKm=20");
    expect(url).not.toMatch(/[?&](lat|lon)=/);
  });
});

describe("toSession", () => {
  it("UT-SES-05: the 4 October single-token login becomes an access token with no refresh token", () => {
    const session = toSession({ token: "tok", profile: { ...ownProfileOf("alice") } });

    expect(session).toMatchObject({ accessToken: "tok", refreshToken: "", userId: "usr_alice" });
  });
});

describe("logOut", () => {
  it("UT-SES-06: sends the refresh token to the logout endpoint, or no body after a single-token login", async () => {
    fetchMock.mockResolvedValue(reply(204));

    await sessionsApi.logOut("at1", "rt1");
    await sessionsApi.logOut("tok", "");

    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/sessions/current`);
    expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");
    expect(headersOf(0).Authorization).toBe("Bearer at1");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toEqual({ refreshToken: "rt1" });
    expect(fetchMock.mock.calls[1][1].body).toBeUndefined();
  });
});

describe("photoSource", () => {
  it("UT-API-11: builds the photo URL from the API origin, with the session header", () => {
    const source = photoSource("/api/v1/photos/pho_b2", "at1");

    expect(source).toEqual({
      uri: "http://10.0.2.2:3000/api/v1/photos/pho_b2",
      headers: { Authorization: "Bearer at1" },
    });
  });

  it("UT-API-11: keeps a full URL, and sends no header without a token", () => {
    const source = photoSource("https://cdn.example.com/p.jpg", null);

    expect(source).toEqual({ uri: "https://cdn.example.com/p.jpg" });
  });
});
