/**
 * apiDefaults.ts
 * Default answers for the mocked API modules, from the seed data: alice's chats, unread messages,
 * recommendations and favorites. The test file must jest.mock the modules it uses; this only sets
 * what they return. Tests override single calls with mockResolvedValueOnce.
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { favoritesApi } from "../src/api/favorites";
import { matchingApi } from "../src/api/matching";
import { messagingApi } from "../src/api/messaging";
import { notesApi } from "../src/api/notes";
import { profileApi } from "../src/api/profile";
import {
  ALICE_CHATS,
  ALICE_FAVORITES,
  ALICE_RECOMMENDATIONS,
  ALICE_UNREAD,
  ownProfileOf,
} from "./fixtures/seed";

/** Sets every mocked API method that a signed-in screen may call to alice's seed data. */
export function setAliceDefaults(): void {
  if (jest.isMockFunction(profileApi.getMe)) {
    jest.mocked(profileApi.getMe).mockResolvedValue(ownProfileOf("alice"));
  }
  if (jest.isMockFunction(messagingApi.getConversations)) {
    const messaging = jest.mocked(messagingApi);
    messaging.getConversations.mockResolvedValue(ALICE_CHATS);
    messaging.getUnread.mockResolvedValue({ messages: ALICE_UNREAD, hasMore: false });
    messaging.markRead.mockResolvedValue(undefined);
  }
  if (jest.isMockFunction(matchingApi.getRecommendations)) {
    jest.mocked(matchingApi.getRecommendations).mockResolvedValue(ALICE_RECOMMENDATIONS);
    jest.mocked(matchingApi.searchCandidates).mockResolvedValue(ALICE_RECOMMENDATIONS);
  }
  if (jest.isMockFunction(favoritesApi.getFavorites)) {
    jest.mocked(favoritesApi.getFavorites).mockResolvedValue([...ALICE_FAVORITES]);
  }
  if (jest.isMockFunction(notesApi.getPeople)) {
    jest.mocked(notesApi.getPeople).mockResolvedValue([]);
    jest.mocked(notesApi.getNotes).mockResolvedValue([]);
  }
}
