/**
 * ChatScreens.test.tsx
 * UT-SCR-17 to 23: the chat list, a conversation (read, paging, send, reply) and notes
 * (unit-test-plan.md 6.19). SCR-21 (reply) runs against the reply UI the app has now
 * (long-press, design gaps row 8 / P5); recheck it when the design for replies is final.
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { fireEvent, screen, userEvent, waitFor, within } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { setAliceDefaults } from "../../../test/apiDefaults";
import { freezeToday } from "../../../test/fixtures/clock";
import {
  DAN_THREAD,
  M2,
  M3,
  M4,
  message,
  NOTE_ABOUT_CHAI,
  summaryOf,
  USERS,
} from "../../../test/fixtures/seed";
import { fakeSession, renderScreen, type Rendered } from "../../../test/renderWithProviders";
import { ApiError } from "../../api/errors";
import { messagingApi } from "../../api/messaging";
import { notesApi } from "../../api/notes";
import type { Message, MessagePage, Note } from "../../api/types";
import { keys } from "../../session/queryClient";
import { ChatListScreen } from "./ChatListScreen";
import { ConversationScreen } from "./ConversationScreen";
import { NotesScreen } from "./NotesScreen";

jest.mock("../../api/messaging");
jest.mock("../../api/favorites");
jest.mock("../../api/notes");

const messaging = jest.mocked(messagingApi);
const notes = jest.mocked(notesApi);

/** A rendered host element. */
type HostElement = ReturnType<typeof screen.getByText>;

/**
 * All visible rendered host elements of a type (for elements with no role or text).
 * @param type The host type, for example "RCTScrollView".
 * @returns The elements, outside screens hidden under the top one.
 */
function hostsOfType(type: string): HostElement[] {
  const found: HostElement[] = [];
  const queue: unknown[] = [screen.container];
  while (queue.length > 0) {
    const node = queue.shift() as
      { type?: unknown; props?: Record<string, unknown>; children?: unknown[] } | string;
    if (typeof node !== "object" || node === null || node.props?.["aria-hidden"] === true) continue;
    if (node.type === type) found.push(node as unknown as HostElement);
    queue.push(...(node.children ?? []));
  }
  return found;
}

/**
 * Renders the conversation with a seed user.
 * @param username The other person.
 * @returns The render result.
 */
function renderConversation(username: string): Promise<Rendered> {
  return renderScreen(ConversationScreen, "Conversation", summaryOf(username));
}

/**
 * The bubble (pressable) around a message text.
 * @param text The message text.
 * @returns The bubble element.
 */
function bubbleOf(text: string): HostElement {
  return screen.getByText(text).parent as HostElement;
}

beforeEach(() => {
  jest.clearAllMocks();
  setAliceDefaults();
  freezeToday();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("ChatList", () => {
  it("UT-SCR-17: favorites on top, then all chats; fah has none yet", async () => {
    await renderScreen(ChatListScreen, "ChatsTab");

    // Section label text → its row → the section around the label and its rows.
    const sectionOf = (label: HostElement): ReturnType<typeof within> =>
      within(label.parent!.parent!.parent!);
    const favorites = sectionOf(await screen.findByText("FAVORITES"));
    const allSection = sectionOf(screen.getByText("ALL CHATS"));
    expect(favorites.getByText("Chai")).toBeOnTheScreen();
    expect(favorites.queryByText("Bob")).not.toBeOnTheScreen();
    const names = allSection.getAllByText(/^(Bob|Hana)$/).map((t) => t.props.children);
    expect(names).toEqual(["Bob", "Hana"]);
    expect(allSection.getByText("3")).toBeOnTheScreen();

    await screen.unmount();
    messaging.getConversations.mockResolvedValue([]);
    await renderScreen(ChatListScreen, "ChatsTab", undefined, {
      session: fakeSession({ userId: USERS.fah.userId }),
    });

    expect(
      await screen.findByText("No chats yet. Find someone in Matches and say hi."),
    ).toBeOnTheScreen();
  });
});

describe("Conversation", () => {
  it("UT-SCR-18: opening it marks the newest message as read", async () => {
    messaging.getMessages.mockResolvedValue({ messages: [M4, M3, M2], hasMore: false });
    const { queryClient } = await renderConversation("bob");
    const invalidate = jest.spyOn(queryClient, "invalidateQueries");

    await waitFor(() => expect(messaging.markRead).toHaveBeenCalledWith(USERS.bob.userId, "M4"));
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: keys.unread }));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: keys.conversations });
  });

  it("UT-SCR-19: scrolling to the top loads older messages until there are no more", async () => {
    const pages: Record<string, MessagePage> = {
      first: { messages: DAN_THREAD.slice(0, 30), hasMore: true },
      older: { messages: DAN_THREAD.slice(30), hasMore: false },
    };
    messaging.getMessages.mockImplementation(async (_userId, before) =>
      before === undefined ? pages.first : pages.older,
    );
    await renderConversation("dan");
    await screen.findByText("Message 60");

    // The list is inverted: its end is the top of the screen.
    await fireEvent(hostsOfType("RCTScrollView")[0], "endReached");
    await waitFor(() => expect(messaging.getMessages).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.queryByLabelText("Loading older messages")).not.toBeOnTheScreen(),
    );
    await fireEvent(hostsOfType("RCTScrollView")[0], "endReached");

    expect(messaging.getMessages.mock.calls).toEqual([
      [USERS.dan.userId, undefined],
      [USERS.dan.userId, DAN_THREAD[29].messageId],
    ]);
  });

  it("UT-SCR-20: a sent message shows at once, then confirms; a failed one can be retried", async () => {
    const user = userEvent.setup();
    messaging.getMessages.mockResolvedValue({ messages: [M4, M3, M2], hasMore: false });
    let confirm: (sent: Message) => void = () => undefined;
    messaging.sendMessage
      .mockImplementationOnce(() => new Promise<Message>((resolve) => (confirm = resolve)))
      .mockRejectedValueOnce(new ApiError(0, "NETWORK_ERROR", "offline"))
      .mockResolvedValueOnce(
        message("msg_45", "alice", "bob", "See you there", "2026-10-06T03:01:00Z", false),
      );
    await renderConversation("bob");
    await screen.findByText("Hi Alice");

    await user.type(screen.getByLabelText("Message"), "Hi Bob, coffee this weekend?");
    await user.press(screen.getByRole("button", { name: "Send" }));
    const pendingStyle = StyleSheet.flatten(bubbleOf("Hi Bob, coffee this weekend?").props.style);
    const sent = message(
      "msg_44",
      "alice",
      "bob",
      "Hi Bob, coffee this weekend?",
      "2026-10-06T03:00:00Z",
      false,
    );
    messaging.getMessages.mockResolvedValue({ messages: [sent, M4, M3, M2], hasMore: false });
    confirm(sent);
    await waitFor(() =>
      expect(
        StyleSheet.flatten(bubbleOf("Hi Bob, coffee this weekend?").props.style).opacity,
      ).toBeUndefined(),
    );
    await user.type(screen.getByLabelText("Message"), "See you there");
    await user.press(screen.getByRole("button", { name: "Send" }));
    const retry = await screen.findByText("Not sent. Tap to retry.");
    await user.press(retry);

    expect(pendingStyle.opacity).toBe(0.5);
    await waitFor(() => expect(messaging.sendMessage).toHaveBeenCalledTimes(3));
    expect(messaging.sendMessage).toHaveBeenLastCalledWith(USERS.bob.userId, "See you there");
    await waitFor(() =>
      expect(screen.queryByText("Not sent. Tap to retry.")).not.toBeOnTheScreen(),
    );
  });

  it("UT-SCR-21: long-press replies to a message and the bubble shows the quote", async () => {
    const user = userEvent.setup();
    messaging.getMessages.mockResolvedValue({ messages: [M4, M3, M2], hasMore: false });
    messaging.reply.mockImplementationOnce(() => new Promise<Message>(() => undefined));
    await renderConversation("bob");

    await user.longPress(await screen.findByText(M3.text), { duration: 500 });
    await user.type(screen.getByLabelText("Message"), "Yes, Saturday works");
    await user.press(screen.getByRole("button", { name: "Send" }));

    expect(messaging.reply).toHaveBeenCalledWith("M3", "Yes, Saturday works");
    const reply = bubbleOf("Yes, Saturday works");
    expect(within(reply).getByText("Bob")).toBeOnTheScreen();
    expect(within(reply).getByText(M3.text)).toBeOnTheScreen();
  });
});

describe("Notes", () => {
  it("UT-SCR-22: writing a note puts it first, and Save waits for text", async () => {
    const user = userEvent.setup();
    const older: Note = { ...NOTE_ABOUT_CHAI, noteId: "n_old", aboutUserId: USERS.bob.userId };
    const created: Note = {
      noteId: "n_new",
      aboutUserId: USERS.bob.userId,
      text: "Met at Siam Paragon, likes jazz",
      createdAt: "2026-10-06T02:55:00Z",
      updatedAt: null,
    };
    notes.getNotes.mockResolvedValue([older]);
    notes.create.mockResolvedValueOnce(created);
    await renderScreen(NotesScreen, "Notes", summaryOf("bob"));
    await screen.findByText(older.text);

    await user.press(screen.getByRole("button", { name: "New note" }));
    const save = (): HostElement => screen.getByRole("button", { name: "Save" });
    const whenEmpty = save().props.accessibilityState?.disabled;
    await user.type(screen.getByLabelText("New note"), "   ");
    const whenSpaces = save().props.accessibilityState?.disabled;
    await user.clear(screen.getByLabelText("New note"));
    await user.type(screen.getByLabelText("New note"), created.text);
    await user.press(save());

    expect([whenEmpty, whenSpaces]).toEqual([true, true]);
    expect(notes.create).toHaveBeenCalledWith(USERS.bob.userId, created.text);
    expect(await screen.findByRole("button", { name: "New note" })).toBeOnTheScreen();
    const cards = screen.getAllByText(/Met at/).map((t) => t.props.children);
    expect(cards).toEqual([created.text, older.text]);
    expect(screen.getByText("Today, 09:55")).toBeOnTheScreen();
  });

  it("UT-SCR-23: dan has no notes yet; chai shows the seeded note with its time", async () => {
    notes.getNotes.mockResolvedValue([]);
    await renderScreen(NotesScreen, "Notes", summaryOf("dan"));

    expect(await screen.findByText("No notes about Dan yet.")).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeOnTheScreen();

    await screen.unmount();
    notes.getNotes.mockResolvedValue([NOTE_ABOUT_CHAI]);
    await renderScreen(NotesScreen, "Notes", summaryOf("chai"));

    expect(await screen.findByText("Met at a cafe in Ari last month.")).toBeOnTheScreen();
    expect(screen.getByText("20 Sep, 12:00")).toBeOnTheScreen();
  });
});
