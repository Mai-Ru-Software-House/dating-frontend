/**
 * seed.ts
 * The functional plan's Test Users and Seed Data (unit-test-plan.md 5), so a unit test and the
 * matching functional case use the same people and messages. Times are UTC; Bangkok is +7.
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import type {
  CandidateCard,
  Conversation,
  Gender,
  Message,
  Note,
  OwnProfile,
  UnreadMessage,
  UserSummary,
} from "../../src/api/types";

/** One test user from the plan. */
export interface SeedUser {
  userId: string;
  username: string;
  password: string;
  displayName: string;
  gender: Gender;
  dateOfBirth: string;
  lat: number;
  lon: number;
  /** "province, district" as the API sends it. */
  placeName: string;
  targetGender: Gender;
  minAge: number;
  maxAge: number;
  radiusKm: number;
}

type Row = [
  string,
  string,
  string,
  Gender,
  string,
  number,
  number,
  string,
  Gender,
  number,
  number,
  number,
];

const ROWS: Row[] = [
  [
    "alice",
    "Alice2026",
    "Alice",
    "female",
    "1999-03-10",
    13.7466,
    100.5393,
    "Bangkok, Siam",
    "male",
    24,
    32,
    50,
  ],
  [
    "bob",
    "Bob2026x",
    "Bob",
    "male",
    "1998-05-20",
    13.7279,
    100.5241,
    "Bangkok, Silom",
    "female",
    22,
    30,
    30,
  ],
  [
    "chai",
    "Chai2026",
    "Chai",
    "male",
    "2001-02-14",
    13.8621,
    100.5144,
    "Nonthaburi",
    "female",
    22,
    30,
    20,
  ],
  [
    "dan",
    "Dan2026x",
    "Dan",
    "male",
    "1985-01-05",
    13.7563,
    100.5018,
    "Bangkok",
    "female",
    25,
    45,
    50,
  ],
  [
    "ekk",
    "Ekk2026x",
    "Ekk",
    "male",
    "1997-04-01",
    18.7883,
    98.9853,
    "Chiang Mai",
    "female",
    22,
    35,
    1000,
  ],
  [
    "fah",
    "Fah2026x",
    "Fah",
    "female",
    "2000-07-07",
    13.765,
    100.538,
    "Bangkok",
    "male",
    24,
    35,
    25,
  ],
  [
    "gun",
    "Gun2026x",
    "Gun",
    "male",
    "1996-04-22",
    13.5991,
    100.5998,
    "Samut Prakan",
    "female",
    20,
    26,
    40,
  ],
  [
    "hana",
    "Hana2026",
    "Hana",
    "female",
    "1995-08-30",
    13.74,
    100.56,
    "Bangkok",
    "male",
    25,
    40,
    30,
  ],
  [
    "joe",
    "Joe2026x",
    "Joe",
    "male",
    "1950-06-01",
    14.3532,
    100.5689,
    "Ayutthaya",
    "female",
    70,
    80,
    5,
  ],
];

/** The test users by username. */
export const USERS: Record<string, SeedUser> = Object.fromEntries(
  ROWS.map(
    ([username, password, displayName, gender, dob, lat, lon, place, target, min, max, km]) => [
      username,
      {
        userId: `usr_${username}`,
        username,
        password,
        displayName,
        gender,
        dateOfBirth: dob,
        lat,
        lon,
        placeName: place,
        targetGender: target,
        minAge: min,
        maxAge: max,
        radiusKm: km,
      },
    ],
  ),
);

/**
 * A user's summary, as lists and messages carry it.
 * @param username A seed username.
 * @returns userId, displayName and photoUrl.
 */
export function summaryOf(username: string): UserSummary {
  const user = USERS[username];
  return {
    userId: user.userId,
    displayName: user.displayName,
    photoUrl: `/api/v1/photos/pho_${username}`,
  };
}

/**
 * A user's own profile, as GET /users/me returns it.
 * @param username A seed username.
 * @returns The profile.
 */
export function ownProfileOf(username: string): OwnProfile {
  const u = USERS[username];
  return {
    userId: u.userId,
    username: u.username,
    displayName: u.displayName,
    dateOfBirth: u.dateOfBirth,
    gender: u.gender,
    location: { lat: u.lat, lon: u.lon },
    placeName: u.placeName,
    photoUrl: `/api/v1/photos/pho_${username}`,
    preferences: {
      minAge: u.minAge,
      maxAge: u.maxAge,
      targetGenders: [u.targetGender],
      radiusKm: u.radiusKm,
    },
  };
}

/**
 * A message between two seed users.
 * @param id The message ID.
 * @param from Sender username.
 * @param to Receiver username.
 * @param text The text.
 * @param sentAt UTC ISO time.
 * @param isRead Whether the receiver has read it.
 * @returns The message.
 */
export function message(
  id: string,
  from: string,
  to: string,
  text: string,
  sentAt: string,
  isRead: boolean,
): Message {
  return {
    messageId: id,
    senderId: USERS[from].userId,
    receiverId: USERS[to].userId,
    text,
    sentAt,
    isRead,
    replyTo: null,
  };
}

export const M1 = message(
  "M1",
  "chai",
  "alice",
  "Hello Alice, nice to match with you!",
  "2026-10-05T03:00:00Z",
  true,
);
export const M2 = message("M2", "bob", "alice", "Hi Alice", "2026-10-06T02:00:00Z", false);
export const M3 = message(
  "M3",
  "bob",
  "alice",
  "Are you free this weekend?",
  "2026-10-06T02:10:00Z",
  false,
);
export const M4 = message(
  "M4",
  "bob",
  "alice",
  "There is a jazz night at Siam on Saturday.",
  "2026-10-06T02:20:00Z",
  false,
);
export const M5 = message(
  "M5",
  "bob",
  "chai",
  "Hey Chai, see you at football later.",
  "2026-10-06T01:00:00Z",
  true,
);
export const M6 = message("M6", "alice", "hana", "Hi Hana", "2026-10-06T00:00:00Z", true);

/**
 * A message as GET /messages/unread lists it.
 * @param m The message.
 * @param from Sender username.
 * @returns The unread entry.
 */
export function unreadOf(m: Message, from: string): UnreadMessage {
  return { messageId: m.messageId, sender: summaryOf(from), text: m.text, sentAt: m.sentAt };
}

/** Alice's unread messages, newest first (M4, M3, M2). */
export const ALICE_UNREAD: UnreadMessage[] = [
  unreadOf(M4, "bob"),
  unreadOf(M3, "bob"),
  unreadOf(M2, "bob"),
];

/**
 * A chat list row.
 * @param username The other person.
 * @param last Their last message.
 * @param unreadCount Unread messages from them.
 * @param isFavorite Whether they are a favorite.
 * @returns The conversation.
 */
export function conversationWith(
  username: string,
  last: Message,
  unreadCount: number,
  isFavorite: boolean,
): Conversation {
  return {
    user: summaryOf(username),
    isFavorite,
    lastMessage: {
      messageId: last.messageId,
      senderId: last.senderId,
      text: last.text,
      sentAt: last.sentAt,
    },
    unreadCount,
  };
}

/** Alice's chat list in server order (newest first): bob (M4), hana (M6), chai (M1, favorite). */
export const ALICE_CHATS: Conversation[] = [
  conversationWith("bob", M4, 3, false),
  conversationWith("hana", M6, 0, false),
  conversationWith("chai", M1, 0, true),
];

/** Alice's favorites. */
export const ALICE_FAVORITES = new Set([USERS.chai.userId]);

/** Alice's note about chai. */
export const NOTE_ABOUT_CHAI: Note = {
  noteId: "not_chai_1",
  aboutUserId: USERS.chai.userId,
  text: "Met at a cafe in Ari last month.",
  createdAt: "2026-09-20T05:00:00Z",
  updatedAt: null,
};

/** The new user from CP01. */
export const MINT = {
  username: "mint_01",
  password: "Mint2026",
  displayName: "Mint",
  gender: "female" as Gender,
  dateOfBirth: "1999-09-15",
  location: { lat: 13.73, lon: 100.53 },
  preferences: { minAge: 24, maxAge: 32, targetGenders: ["male"] as Gender[], radiusKm: 30 },
};

/**
 * The 60-message thread between alice and dan, one minute apart, newest first, ending
 * 2026-10-06T02:59:00Z. Even numbers are from dan, odd from alice.
 */
export const DAN_THREAD: Message[] = Array.from({ length: 60 }, (_, i) => {
  const sentAt = new Date(Date.parse("2026-10-06T02:59:00Z") - i * 60_000).toISOString();
  const fromDan = i % 2 === 0;
  return message(
    `dan_${60 - i}`,
    fromDan ? "dan" : "alice",
    fromDan ? "alice" : "dan",
    `Message ${60 - i}`,
    sentAt,
    true,
  );
});

/**
 * A recommendation card for a seed user.
 * @param username The person.
 * @param distanceKm Distance from alice.
 * @param matchScore Score 0 to 100.
 * @param age Age on the test day.
 * @returns The card.
 */
export function cardOf(
  username: string,
  distanceKm: number,
  matchScore: number,
  age: number,
): CandidateCard {
  const u = USERS[username];
  return {
    ...summaryOf(username),
    age,
    gender: u.gender,
    placeName: u.placeName,
    distanceKm,
    matchScore,
  };
}

/** Alice's recommendations (the plan gives no scores; these are ours). */
export const ALICE_RECOMMENDATIONS: CandidateCard[] = [
  cardOf("bob", 3, 88, 28),
  cardOf("chai", 13, 81, 25),
];
