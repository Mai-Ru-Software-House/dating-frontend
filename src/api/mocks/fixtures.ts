/**
 * fixtures.ts
 * Mock data that reproduces the designs (api-integration.md 10). Built on first use so the times
 * follow the device clock (see time.ts).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { Gender } from "../../constants/profile";
import type { Message, Note, OwnProfile, Preferences } from "../types";
import { mockTime } from "./time";

/** Another user as the mocks keep them. */
export interface MockPerson {
  userId: string;
  displayName: string;
  photoUrl: string;
  age: number;
  gender: Gender;
  placeName: string | null;
  distanceKm: number;
  matchScore: number;
  lookingFor?: Preferences;
}

/** An account the mocks can log in to. */
export interface MockAccount {
  password: string | null; // null: any password except "wrong"
  profile: OwnProfile;
}

/** The sample people's design gradients (index into avatarGradients), for mock mode only. */
export const MOCK_GRADIENT_INDEX: Record<string, number> = {
  usr_tee: 0,
  usr_mint: 1,
  usr_fern: 2,
  usr_ploy: 3,
  usr_kwan: 4,
  usr_fah: 5,
  usr_mai: 5,
  usr_mai2: 4,
};

export const TEE: OwnProfile = {
  userId: "usr_tee",
  username: "Kittiphon",
  displayName: "Tee",
  dateOfBirth: "2006-11-08",
  gender: "male",
  location: { lat: 13.723, lon: 100.784 },
  placeName: "Bangkok, Lat Krabang",
  photoUrl: "/api/v1/photos/pho_tee",
  preferences: { minAge: 18, maxAge: 20, targetGenders: ["female"], radiusKm: 50 },
};

/** The accounts remembered on this phone in design 21. */
const MAI_ONE: OwnProfile = {
  userId: "usr_mai",
  username: "mai_ru01",
  displayName: "Mai",
  dateOfBirth: "2005-03-14",
  gender: "female",
  location: { lat: 13.766, lon: 100.645 },
  placeName: "Bangkok, Bang Kapi",
  photoUrl: "/api/v1/photos/pho_mai",
  preferences: { minAge: 19, maxAge: 26, targetGenders: ["male"], radiusKm: 30 },
};

const MAI_TWO: OwnProfile = {
  ...MAI_ONE,
  userId: "usr_mai2",
  username: "mai_ru02",
  photoUrl: "/api/v1/photos/pho_mai2",
};

export const ACCOUNTS: MockAccount[] = [
  { password: null, profile: TEE },
  { password: "password123", profile: MAI_ONE },
  { password: "password123", profile: MAI_TWO },
];

/**
 * Builds a person with the shared defaults.
 * @param userId The ID.
 * @param displayName The name.
 * @param age Age.
 * @param placeName "province, district".
 * @param distanceKm Distance from Tee.
 * @param matchScore Score for Tee.
 * @returns The person.
 */
function person(
  userId: string,
  displayName: string,
  age: number,
  placeName: string,
  distanceKm: number,
  matchScore: number,
): MockPerson {
  const photoId = userId.replace("usr_", "pho_");
  return {
    userId,
    displayName,
    photoUrl: `/api/v1/photos/${photoId}`,
    age,
    gender: "female",
    placeName,
    distanceKm,
    matchScore,
  };
}

/** Other users, in recommendation order. */
export const PEOPLE: MockPerson[] = [
  {
    ...person("usr_fern", "Fern", 19, "Bangkok, Min Buri", 6, 92),
    lookingFor: { minAge: 19, maxAge: 25, targetGenders: ["male"], radiusKm: 20 },
  },
  person("usr_mint", "Mint", 20, "Bangkok, Lat Krabang", 1, 90),
  person("usr_ploy", "Ploy", 18, "Bangkok, Lat Krabang", 2, 88),
  person("usr_kwan", "Kwan", 20, "Bangkok, Prawet", 9, 81),
  person("usr_fah", "Fah", 20, "Bangkok, Suan Luang", 7, 76),
];

/** Tee's favorites. */
export const FAVORITES = ["usr_mint", "usr_fern"];

/** One line of a thread: who sent it, when, the text, whether it was read. */
type Line = [from: "me" | "them", daysAgo: number, clock: string, text: string, isRead: boolean];

const THREADS: Record<string, Line[]> = {
  usr_mint: [
    ["them", 0, "09:47", "hiii", true],
    ["them", 0, "09:48", "wait are you at kmitl too??", true],
    ["me", 0, "09:52", "cmkl actually but yeah same campus", true],
    ["them", 0, "09:57", "ohh nice", true],
    ["them", 0, "09:57", "have you eaten yet", true],
    ["them", 0, "09:58", "the canteen by the lake is so packed rn", true],
    ["me", 0, "10:01", "not yet lol i just woke up", true],
    ["them", 0, "10:03", "it's almost 10 lmao", false],
  ],
  usr_fern: [
    ["me", 2, "21:02", "hey, nice to match with you", true],
    ["them", 2, "21:15", "hii you too!", true],
    ["them", 0, "09:41", "are you free this saturday?", false],
  ],
  usr_ploy: [
    ["them", 1, "18:02", "do you have class tomorrow?", true],
    ["me", 1, "18:11", "yeah until 5, so tired", true],
    ["them", 1, "18:20", "lol same, my lab ends at 6", false],
  ],
  usr_kwan: [
    ["them", 2, "19:58", "see you at the BACC at 4?", true],
    ["me", 2, "20:15", "ok see you there", true],
  ],
  usr_fah: [
    ["them", 3, "18:40", "you should try the khao soi place near the station", true],
    ["me", 3, "19:05", "thanks!! will try it", true],
  ],
};

/**
 * Tee's messages with everyone, built from the threads.
 * @returns Every message, oldest first per thread.
 */
export function buildMessages(): Message[] {
  const messages: Message[] = [];
  for (const [userId, lines] of Object.entries(THREADS)) {
    lines.forEach(([from, daysAgo, clock, text, isRead], index) => {
      messages.push({
        messageId: `msg_${userId.replace("usr_", "")}_${index + 1}`,
        senderId: from === "me" ? TEE.userId : userId,
        receiverId: from === "me" ? userId : TEE.userId,
        text,
        sentAt: mockTime(daysAgo, clock),
        isRead,
        replyTo: null,
      });
    });
  }
  return messages;
}

/**
 * Tee's notes ("/" in the docs is a line break).
 * @returns Every note.
 */
export function buildNotes(): Note[] {
  const note = (id: string, about: string, daysAgo: number, clock: string, text: string): Note => ({
    noteId: id,
    aboutUserId: about,
    text,
    createdAt: mockTime(daysAgo, clock),
    updatedAt: null,
  });
  return [
    note(
      "not_mint_3",
      "usr_mint",
      0,
      "09:55",
      "Eats at the canteen by the lake.\nRoasted me for waking up late lol",
    ),
    note("not_mint_2", "usr_mint", 3, "21:10", "From Chon Buri, moved here for uni."),
    note("not_mint_1", "usr_mint", 4, "18:32", "Funny, easy to talk to"),
    note("not_fern_2", "usr_fern", 1, "20:30", "Saturday 2 pm, café near Min Buri market"),
    note("not_fern_1", "usr_fern", 2, "21:20", "Likes matcha, not a morning person"),
    note("not_ploy_1", "usr_ploy", 2, "19:00", "Has lab until 6 on weekdays"),
    note("not_kwan_1", "usr_kwan", 7, "16:45", "Into art, went to BACC last week"),
  ];
}

/** Remembered accounts seeded on the first mock run (design 21), oldest use last. */
export const SEED_KNOWN_ACCOUNTS = [MAI_ONE, MAI_TWO].map((p, index) => ({
  userId: p.userId,
  username: p.username,
  displayName: p.displayName,
  photoUrl: p.photoUrl,
  lastUsedAt: mockTime(3 + index, "12:00"),
}));
