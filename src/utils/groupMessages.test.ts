/**
 * groupMessages.test.ts
 * UT-MSG: conversation grouping, day dividers, "Seen", paging and pending sends
 * (unit-test-plan.md 6.12).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { NOW } from "../../test/fixtures/clock";
import { DAN_THREAD, M1, M2, USERS, message } from "../../test/fixtures/seed";
import type { Message } from "../api/types";
import {
  applySent,
  groupMessages,
  mergeOlderPages,
  orderMessages,
  type ChatMessage,
  type ChatRow,
} from "./groupMessages";

const ALICE = USERS.alice.userId;

/**
 * The message rows only, oldest first, for easier reading.
 * @param rows Rows from groupMessages (newest first).
 * @returns Message rows, oldest first.
 */
function messageRows(rows: ChatRow[]): Extract<ChatRow, { kind: "message" }>[] {
  return rows
    .filter((r): r is Extract<ChatRow, { kind: "message" }> => r.kind === "message")
    .reverse();
}

describe("groupMessages", () => {
  it("UT-MSG-01: messages from the same sender within 5 minutes form one group", () => {
    const thread = [
      message("a", "bob", "alice", "hiii", "2026-10-06T02:47:00Z", true),
      message("b", "bob", "alice", "are you at kmitl too??", "2026-10-06T02:48:00Z", true),
      message("c", "alice", "bob", "cmkl actually", "2026-10-06T02:52:00Z", false),
    ];

    const rows = messageRows(groupMessages(thread, ALICE, NOW));

    expect(rows.map((r) => r.isGroupEnd)).toEqual([false, true, true]);
    expect(rows.map((r) => r.timeLabel)).toEqual(["", "09:48", "09:52"]);
  });

  it("UT-MSG-02: a gap of 5 minutes starts a new group", () => {
    const thread = [
      message("a", "bob", "alice", "one", "2026-10-06T02:48:00Z", true),
      message("b", "bob", "alice", "two", "2026-10-06T02:53:00Z", true),
    ];

    const rows = messageRows(groupMessages(thread, ALICE, NOW));

    expect(rows.map((r) => r.isGroupStart)).toEqual([true, true]);
    expect(rows.map((r) => r.isGroupEnd)).toEqual([true, true]);
  });

  it("UT-MSG-03: puts a day divider above each day", () => {
    const rows = groupMessages([M2, M1], ALICE, NOW).reverse();

    expect(rows.map((r) => (r.kind === "divider" ? r.label : r.message.messageId))).toEqual([
      "Yesterday",
      "M1",
      "Today",
      "M2",
    ]);
  });

  it('UT-MSG-04: shows "Seen" only under my latest message', () => {
    const thread = [
      message("a", "alice", "bob", "first", "2026-10-06T02:00:00Z", true),
      message("b", "alice", "bob", "second", "2026-10-06T02:30:00Z", true),
    ];

    const rows = messageRows(groupMessages(thread, ALICE, NOW));

    expect(rows.map((r) => r.timeLabel)).toEqual(["09:00", "09:30 · Seen"]);
  });
});

describe("mergeOlderPages", () => {
  it("UT-MSG-05: paging keeps every message exactly once, newest first", () => {
    const page1 = DAN_THREAD.slice(0, 30);
    const page2 = DAN_THREAD.slice(30, 60);

    const merged = mergeOlderPages(mergeOlderPages(page1, page2), page2);

    expect(merged).toHaveLength(60);
    expect(new Set(merged.map((m) => m.messageId)).size).toBe(60);
    expect(merged.map((m) => m.messageId)).toEqual(DAN_THREAD.map((m) => m.messageId));
  });
});

describe("applySent", () => {
  it("UT-MSG-06: replaces the pending message with the server copy, or marks it failed", () => {
    const pending: ChatMessage = {
      ...message("c1", "alice", "bob", "Hi Bob", "2026-10-06T03:00:00Z", false),
      clientId: "c1",
      sendState: "pending",
    };
    const server: Message = { ...pending, messageId: "msg_43" };
    delete (server as ChatMessage).clientId;
    delete (server as ChatMessage).sendState;

    const sent = applySent([pending, server], "c1", server);
    const failed = applySent([pending], "c1", null);

    expect(sent).toEqual([server]);
    expect(failed).toEqual([{ ...pending, sendState: "failed" }]);
  });
});

describe("orderMessages", () => {
  it("UT-MSG-07: messages with the same second keep the server order", () => {
    const first = message("x2", "bob", "alice", "same time B", "2026-10-06T02:00:00Z", true);
    const second = message("x1", "bob", "alice", "same time A", "2026-10-06T02:00:00Z", true);

    const once = orderMessages([first, second]);
    const again = orderMessages(once);

    expect(once.map((m) => m.messageId)).toEqual(["x2", "x1"]);
    expect(again.map((m) => m.messageId)).toEqual(["x2", "x1"]);
  });
});
