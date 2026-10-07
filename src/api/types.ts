/**
 * types.ts
 * Request and response types that mirror the API contract (api-integration.md 7). Fields marked
 * "pending" are frontend requests not in the contract yet; they stay optional so the app works
 * before and after they land.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { Gender } from "../constants/profile";

export type { Gender };

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Preferences {
  minAge: number;
  maxAge: number;
  targetGenders: Gender[];
  radiusKm: number;
}

export interface UserSummary {
  userId: string;
  displayName: string;
  photoUrl: string;
}

export interface CandidateCard extends UserSummary {
  age: number;
  gender: Gender;
  /** "province, district", for example "Bangkok, Lat Krabang". */
  placeName: string | null;
  /** Whole km, at least 1. */
  distanceKm: number;
  /** 0 to 100, recommendations only. */
  matchScore?: number;
}

export interface PublicProfile extends CandidateCard {
  isFavorite: boolean;
  /** Pending (8.4). */
  lookingFor?: Preferences;
}

export interface OwnProfile {
  userId: string;
  username: string;
  displayName: string;
  /** YYYY-MM-DD. */
  dateOfBirth: string;
  gender: Gender;
  location: Coordinates;
  placeName: string | null;
  photoUrl: string;
  preferences: Preferences;
}

/** Body of PATCH /users/me: only the fields that changed. `preferences` is always sent whole. */
export type UpdateProfileBody = Partial<
  Pick<OwnProfile, "displayName" | "dateOfBirth" | "gender" | "location" | "preferences">
>;

/** Body of POST /users. */
export interface CreateProfileBody {
  username: string;
  password: string;
  displayName: string;
  dateOfBirth: string;
  gender: Gender;
  location: Coordinates;
  photoUploadId: string;
  preferences: Preferences;
}

export interface MessageQuote {
  messageId: string;
  senderId: string;
  text: string;
}

export interface Message {
  messageId: string;
  senderId: string;
  receiverId: string;
  text: string;
  /** UTC ISO 8601. */
  sentAt: string;
  isRead: boolean;
  replyTo: MessageQuote | null;
}

export interface Conversation {
  user: UserSummary;
  isFavorite: boolean;
  lastMessage: Pick<Message, "messageId" | "senderId" | "text" | "sentAt">;
  unreadCount: number;
}

export interface UnreadMessage {
  messageId: string;
  sender: UserSummary;
  text: string;
  sentAt: string;
}

export interface MessagePage {
  messages: Message[];
  hasMore: boolean;
}

export interface Note {
  noteId: string;
  aboutUserId: string;
  /** 1 to 500 characters after trimming (A7). */
  text: string;
  createdAt: string;
  /** Pending (8.11); null until the note is edited. */
  updatedAt?: string | null;
}

/** One row on the Notes tab (pending, 8.10). */
export interface NotePerson {
  user: UserSummary;
  noteCount: number;
  lastNote: Pick<Note, "noteId" | "text" | "createdAt" | "updatedAt">;
}

export interface PhotoUpload {
  uploadId: string;
  expiresAt: string;
  deleteToken: string;
}

/** Login and sign-up response under A9 (pending, 8.12). */
export interface Session {
  accessToken: string;
  /** Empty when the server still sends the 4 October single `token`. */
  refreshToken: string;
  userId: string;
  /** Pending (8.2) for login; always present for sign-up. */
  profile?: OwnProfile;
}

/** Refresh response (pending, 8.12). refreshToken is present only if the server rotates it. */
export interface RefreshResult {
  accessToken: string;
  refreshToken?: string;
}

/** Search criteria for GET /candidates. Every field is optional. */
export interface SearchCriteria {
  minAge?: number;
  maxAge?: number;
  targetGenders?: Gender[];
  maxDistanceKm?: number;
  limit?: number;
}

/** A photo picked on the phone, as the picker describes it. */
export interface PickedPhoto {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  width: number;
  height: number;
}
