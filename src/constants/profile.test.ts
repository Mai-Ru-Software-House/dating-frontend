/**
 * profile.test.ts
 * UT-GEN: mapping between gender chips, labels and the API's values (unit-test-plan.md 6.6).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { ALL_GENDERS, chipToTargetGenders, genderLabel, targetGendersToLabel } from "./profile";

describe("chipToTargetGenders", () => {
  it("UT-GEN-01: turns each chip into the API's values", () => {
    const women = chipToTargetGenders("Women");
    const men = chipToTargetGenders("Men");
    const everyone = chipToTargetGenders("Everyone");

    expect(women).toEqual(["female"]);
    expect(men).toEqual(["male"]);
    expect(everyone).toEqual(ALL_GENDERS);
  });
});

describe("targetGendersToLabel", () => {
  it("UT-GEN-02: turns the API's values back into a label", () => {
    const men = targetGendersToLabel(["male"]);
    const everyone = targetGendersToLabel(ALL_GENDERS);
    const both = targetGendersToLabel(["female", "male"]);

    expect(men).toBe("Men");
    expect(everyone).toBe("Everyone");
    expect(both).toBe("Women and Men");
  });
});

describe("genderLabel", () => {
  it("UT-GEN-03: labels the user's own gender and returns an empty string for unknown values", () => {
    const labels = ["male", "female", "x"].map(genderLabel);

    expect(labels).toEqual(["Man", "Woman", ""]);
  });
});
