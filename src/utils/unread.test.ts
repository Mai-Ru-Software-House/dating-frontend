/**
 * unread.test.ts
 * UT-UNR: unread messages grouped by sender for Home (unit-test-plan.md 6.11).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { ALICE_UNREAD, M4, summaryOf } from "../../test/fixtures/seed";
import { groupUnread, unreadSenderCount } from "./unread";

describe("groupUnread", () => {
  it("UT-UNR-01: groups M2 to M4 into one row for bob with the newest text", () => {
    const groups = groupUnread(ALICE_UNREAD);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      sender: summaryOf("bob"),
      count: 3,
      newestText: "There is a jazz night at Siam on Saturday.",
      newestSentAt: M4.sentAt,
    });
  });

  it("UT-UNR-02: nothing unread gives no rows", () => {
    const groups = groupUnread([]);

    expect(groups).toEqual([]);
  });

  it("UT-UNR-03: sorts groups by their newest message", () => {
    const messages = [
      { messageId: "b1", sender: summaryOf("bob"), text: "Bob", sentAt: "2026-10-06T02:20:00Z" },
      { messageId: "c1", sender: summaryOf("chai"), text: "Chai", sentAt: "2026-10-06T02:40:00Z" },
    ];

    const groups = groupUnread(messages);

    expect(groups.map((g) => g.sender.displayName)).toEqual(["Chai", "Bob"]);
  });
});

describe("unreadSenderCount", () => {
  it("UT-UNR-04: counts senders, not messages, for the badge and Chats tile", () => {
    const count = unreadSenderCount(ALICE_UNREAD);

    expect(count).toBe(1);
  });
});
