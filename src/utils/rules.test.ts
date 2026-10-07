/**
 * rules.test.ts
 * UT-VAL: input rules and their exact messages (unit-test-plan.md 6.4 and 4.2).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { NOW } from "../../test/fixtures/clock";
import {
  confirmPasswordRule,
  displayNameRule,
  dobRule,
  genderRule,
  messageRule,
  noteRule,
  passwordRule,
  preferencesRule,
  usernameRule,
  type RuleResult,
} from "./rules";

const USERNAME_FORMAT = "Use 4 to 20 letters, numbers or underscores.";
const PASSWORD = "Use at least 8 characters, with at least one letter and one number.";

/**
 * The message of a failed result, or "valid".
 * @param result A rule result.
 * @returns The message, or "valid".
 */
function outcome(result: RuleResult): string {
  return result.isValid ? "valid" : result.message;
}

describe("usernameRule", () => {
  it("UT-VAL-01: accepts valid usernames, including 4 and 20 characters", () => {
    const names = ["mint_01", "Kittiphon", "abcd", "abcdefghij0123456789"];

    const results = names.map((name) => outcome(usernameRule(name)));

    expect(results).toEqual(["valid", "valid", "valid", "valid"]);
  });

  it("UT-VAL-02: rejects a 3-character and a 21-character username", () => {
    const results = ["abc", "a".repeat(21)].map((name) => outcome(usernameRule(name)));

    expect(results).toEqual([USERNAME_FORMAT, USERNAME_FORMAT]);
  });

  it("UT-VAL-03: rejects characters that aren't allowed, including Thai letters", () => {
    const names = ["mint#01", "mint 01", "mint.01", "มิ้นท์"];

    const results = names.map((name) => outcome(usernameRule(name)));

    expect(results).toEqual([USERNAME_FORMAT, USERNAME_FORMAT, USERNAME_FORMAT, USERNAME_FORMAT]);
  });

  it("UT-VAL-04: an empty username is required", () => {
    const results = ["", "   "].map((name) => outcome(usernameRule(name)));

    expect(results).toEqual(["Username is required.", "Username is required."]);
  });
});

describe("passwordRule", () => {
  it("UT-VAL-05: needs 8 characters with a letter and a digit", () => {
    const passwords = ["Mint2026", "abc12", "abcdefgh", "12345678"];

    const results = passwords.map((password) => outcome(passwordRule(password)));

    expect(results).toEqual(["valid", PASSWORD, PASSWORD, PASSWORD]);
  });
});

describe("confirmPasswordRule", () => {
  it("UT-VAL-06: the confirmation must match", () => {
    const mismatch = confirmPasswordRule("Mint2026", "Mint2027");
    const match = confirmPasswordRule("Mint2026", "Mint2026");

    expect(outcome(mismatch)).toBe("Passwords don't match.");
    expect(outcome(match)).toBe("valid");
  });
});

describe("displayNameRule", () => {
  it("UT-VAL-07: requires a display name and keeps it as typed", () => {
    const names = ["", "   ", "' OR '1'='1", "ต้น 😊"];

    const results = names.map((name) => outcome(displayNameRule(name)));

    expect(results).toEqual([
      "Display name is required.",
      "Display name is required.",
      "valid",
      "valid",
    ]);
    expect(names[3]).toBe("ต้น 😊");
  });
});

describe("dobRule", () => {
  it("UT-VAL-08: rejects a future date", () => {
    const result = dobRule("2030-01-01", NOW);

    expect(outcome(result)).toBe("Date of birth can't be in the future.");
  });

  it("UT-VAL-09: needs 18 or older, on the boundary", () => {
    const tomorrow = dobRule("2008-10-07", NOW);
    const today = dobRule("2008-10-06", NOW);

    expect(outcome(tomorrow)).toBe("You must be at least 18 to use Mai Ru.");
    expect(outcome(today)).toBe("valid");
  });
});

describe("genderRule", () => {
  it("UT-VAL-10: requires a gender", () => {
    const missing = genderRule(undefined);
    const male = genderRule("male");

    expect(outcome(missing)).toBe("Choose a gender.");
    expect(outcome(male)).toBe("valid");
  });
});

describe("preferencesRule", () => {
  it("UT-VAL-11: checks the age range, radius and genders, naming the field", () => {
    const good = { minAge: 18, maxAge: 20, targetGenders: ["female"], radiusKm: 50 };

    const results = [
      good,
      { ...good, minAge: 30, maxAge: 25 },
      { ...good, minAge: 15, maxAge: 30 },
      { ...good, radiusKm: 0 },
      { ...good, targetGenders: [] },
    ].map((prefs) => {
      const result = preferencesRule(prefs);
      return result.isValid ? "valid" : result.field;
    });

    expect(results).toEqual([
      "valid",
      "preferences.maxAge",
      "preferences.minAge",
      "preferences.radiusKm",
      "preferences.targetGenders",
    ]);
  });
});

describe("messageRule", () => {
  it("UT-VAL-12: allows 1 to 1000 characters after trimming, counted with string.length", () => {
    const texts = [
      "",
      "   ",
      "a".repeat(1000),
      "a".repeat(1001),
      "สวัสดีค่ะ",
      "สวัสดีค่ะ 😊",
      "a".repeat(999) + "😊",
    ];

    const results = texts.map((text) => outcome(messageRule(text)));

    expect(results).toEqual([
      "",
      "",
      "valid",
      "Messages can be up to 1000 characters.",
      "valid",
      "valid",
      "Messages can be up to 1000 characters.",
    ]);
  });
});

describe("noteRule", () => {
  it("UT-VAL-13: allows 1 to 500 characters after trimming", () => {
    const texts = ["", "  ", "n".repeat(500), "n".repeat(501)];

    const results = texts.map((text) => outcome(noteRule(text)));

    expect(results).toEqual(["", "", "valid", "Notes can be up to 500 characters."]);
  });
});
