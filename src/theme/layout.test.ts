/**
 * layout.test.ts
 * UT-LAY: layout helpers that fit every window size (unit-test-plan.md 6.17).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { CANDIDATE_PHOTO, contentWidth, heroHeight, matchCardHeight } from "./layout";

describe("heroHeight", () => {
  it("UT-LAY-01: the candidate photo takes half the height, capped at width × 1.1", () => {
    const windows = [
      { width: 393, height: 852 },
      { width: 375, height: 667 },
      { width: 852, height: 393 },
      { width: 1024, height: 1366 },
    ];

    const heights = windows.map((w) =>
      heroHeight(w, CANDIDATE_PHOTO.share, CANDIDATE_PHOTO.maxRatio),
    );

    expect(heights).toEqual([426, 333.5, 196.5, 683]);
  });
});

describe("contentWidth", () => {
  it("UT-LAY-02: the column is the window minus the gutters, at most 600", () => {
    const widths = [320, 393, 1024].map(contentWidth);

    expect(widths).toEqual([280, 353, 600]);
  });
});

describe("matchCardHeight", () => {
  it("UT-LAY-03: the match card keeps its proportion, at most 420", () => {
    const heights = [353, 600].map(matchCardHeight);

    expect(heights[0]).toBeCloseTo(330, 5);
    expect(heights[1]).toBe(420);
  });
});
