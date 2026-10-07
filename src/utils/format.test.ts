/**
 * format.test.ts
 * UT-FMT: display formatting (unit-test-plan.md 6.1). Every date test passes NOW.
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { NOW } from "../../test/fixtures/clock";
import { M4, M6, USERS } from "../../test/fixtures/seed";
import {
  dobFromWire,
  dobToWire,
  formatBubbleTime,
  formatDayDivider,
  formatDistance,
  formatDob,
  formatFoundCount,
  formatHomeDate,
  formatListTime,
  formatLookingFor,
  formatMatchesTile,
  formatNameAge,
  formatNoteTime,
  formatPreview,
  formatUnreadCount,
} from "./format";

describe("formatListTime", () => {
  it("UT-FMT-01: shows a time today as a 24 h clock in Bangkok time", () => {
    const result = formatListTime(M4.sentAt, NOW);

    expect(result).toBe("09:20");
  });

  it("UT-FMT-02: shows the weekday earlier this week", () => {
    const result = formatListTime("2026-10-04T05:00:00Z", NOW);

    expect(result).toBe("Sun");
  });

  it("UT-FMT-03: shows day and month for older dates this year", () => {
    const result = formatListTime("2026-09-28T05:00:00Z", NOW);

    expect(result).toBe("28 Sep");
  });

  it("UT-FMT-04: shows the year for last year", () => {
    const result = formatListTime("2025-10-02T05:00:00Z", NOW);

    expect(result).toBe("2 Oct 2025");
  });
});

describe("formatBubbleTime", () => {
  it("UT-FMT-05: converts UTC to Bangkok time without changing the input", () => {
    const iso = "2026-10-20T07:05:00Z";

    const result = formatBubbleTime(iso);

    expect(result).toBe("14:05");
    expect(iso).toBe("2026-10-20T07:05:00Z");
  });
});

describe("formatDayDivider", () => {
  it("UT-FMT-06: shows Today, Yesterday, then weekday and date", () => {
    const results = ["2026-10-06T01:00:00Z", "2026-10-05T01:00:00Z", "2026-10-02T01:00:00Z"].map(
      (iso) => formatDayDivider(iso, NOW),
    );

    expect(results).toEqual(["Today", "Yesterday", "Fri 2 Oct"]);
  });
});

describe("formatNoteTime", () => {
  it("UT-FMT-07: shows the note's last change", () => {
    const a = { createdAt: "2026-10-02T14:10:00Z", updatedAt: null };
    const b = { createdAt: "2026-10-02T14:10:00Z", updatedAt: "2026-10-03T07:27:00Z" };
    const c = { createdAt: "2026-10-06T02:55:00Z" };

    const results = [a, b, c].map((note) => formatNoteTime(note, NOW));

    expect(results).toEqual(["2 Oct, 21:10", "3 Oct, 14:27", "Today, 09:55"]);
  });
});

describe("formatHomeDate", () => {
  it("UT-FMT-08: shows the weekday, day and month on Home", () => {
    const result = formatHomeDate(NOW);

    expect(result).toBe("Tuesday, 6 October");
  });
});

describe("formatNameAge", () => {
  it("UT-FMT-09: joins name and age", () => {
    const result = formatNameAge("Fern", 19);

    expect(result).toBe("Fern, 19");
  });
});

describe("formatDistance", () => {
  it("UT-FMT-10: shows card and row distances, never below 1 km", () => {
    const card = formatDistance(6, "card");
    const row = formatDistance(13, "row");
    const zero = formatDistance(0, "row");

    expect(card).toBe("6 km away");
    expect(row).toBe("13 km");
    expect(zero).toBe("1 km");
  });
});

describe("formatUnreadCount", () => {
  it("UT-FMT-11: caps the badge at 9+", () => {
    const results = [0, 1, 9, 10, 57].map(formatUnreadCount);

    expect(results).toEqual([null, "1", "9", "9+", "9+"]);
  });
});

describe("formatPreview", () => {
  it('UT-FMT-12: prefixes my last message with "You: "', () => {
    const mine = formatPreview(M6, USERS.alice.userId);
    const theirs = formatPreview(M4, USERS.alice.userId);

    expect(mine).toBe("You: Hi Hana");
    expect(theirs).toBe(M4.text);
  });
});

describe("dobToWire / dobFromWire", () => {
  it("UT-FMT-13: round-trips the date of birth input and rejects unreal dates", () => {
    const wire = dobToWire("08 / 11 / 2006");
    const display = dobFromWire("2006-11-08");
    const unreal = dobToWire("31 / 02 / 2006");

    expect(wire).toBe("2006-11-08");
    expect(display).toBe("08 / 11 / 2006");
    expect(unreal).toBeNull();
  });
});

describe("formatDob", () => {
  it("UT-FMT-14: shows the date of birth as day, short month and year", () => {
    const result = formatDob("2006-11-08");

    expect(result).toBe("8 Nov 2006");
  });
});

describe("formatMatchesTile", () => {
  it("UT-FMT-15: shows the Home Matches tile subtitle", () => {
    const results = [0, 7, 10].map((count) => formatMatchesTile(count, 10));

    expect(results).toEqual(["No matches yet", "7 people", "10+ people"]);
  });
});

describe("formatFoundCount", () => {
  it("UT-FMT-16: shows the search results header", () => {
    const results = [1, 7, 20].map((count) => formatFoundCount(count, 20));

    expect(results).toEqual(["1 PERSON FOUND", "7 PEOPLE FOUND", "20+ PEOPLE FOUND"]);
  });
});

describe("formatLookingFor", () => {
  it("UT-FMT-17: describes genders, ages and distance", () => {
    const base = { minAge: 19, maxAge: 25, radiusKm: 20 };

    const men = formatLookingFor({ ...base, targetGenders: ["male"] });
    const everyone = formatLookingFor({
      ...base,
      targetGenders: ["female", "male", "non_binary", "prefer_not_to_say"],
    });
    const both = formatLookingFor({ ...base, targetGenders: ["female", "male"] });

    expect(men).toBe("Men · 19 – 25 · within 20 km");
    expect(everyone).toBe("Everyone · 19 – 25 · within 20 km");
    expect(both).toBe("Women and Men · 19 – 25 · within 20 km");
  });
});
