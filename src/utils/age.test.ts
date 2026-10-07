/**
 * age.test.ts
 * UT-AGE: ages counted on the UTC date, like the server (unit-test-plan.md 6.2).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { NOW } from "../../test/fixtures/clock";
import { ageOn } from "./age";

describe("ageOn", () => {
  it("UT-AGE-01: counts the sample user's age before this year's birthday", () => {
    const age = ageOn("2006-11-08", NOW);

    expect(age).toBe(19);
  });

  it("UT-AGE-02: someone turning 18 today is 18", () => {
    const age = ageOn("2008-10-06", NOW);

    expect(age).toBe(18);
  });

  it("UT-AGE-03: someone turning 18 tomorrow is 17", () => {
    const age = ageOn("2008-10-07", NOW);

    expect(age).toBe(17);
  });

  it("UT-AGE-04: someone born on 29 February has a birthday on 1 March in other years", () => {
    const before = ageOn("2004-02-29", new Date("2026-02-28T12:00:00Z"));
    const after = ageOn("2004-02-29", new Date("2026-03-01T12:00:00Z"));

    expect(before).toBe(21);
    expect(after).toBe(22);
  });

  it("UT-AGE-05: counts on the UTC date even when Bangkok is already a day later", () => {
    const age = ageOn("2008-10-06", new Date("2026-10-05T18:00:00Z"));

    expect(age).toBe(17);
  });
});
