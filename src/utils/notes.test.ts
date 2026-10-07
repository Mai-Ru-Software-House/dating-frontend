/**
 * notes.test.ts
 * UT-NOT: notes ordering and cache updates (unit-test-plan.md 6.16). NOT-03 and NOT-04 run against
 * the app's current PATCH / DELETE handling; recheck them when the endpoints are in the contract.
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { summaryOf } from "../../test/fixtures/seed";
import type { Note, NotePerson } from "../api/types";
import { removeNote, replaceNote, sortNotes, splitNotePeople } from "./notes";

/**
 * A note about bob.
 * @param id The note ID.
 * @param createdAt UTC ISO time.
 * @param updatedAt UTC ISO time of the last edit, or null.
 * @returns The note.
 */
function note(id: string, createdAt: string, updatedAt: string | null = null): Note {
  return { noteId: id, aboutUserId: "usr_bob", text: `Note ${id}`, createdAt, updatedAt };
}

const OCT_1 = note("n1", "2026-10-01T05:00:00Z");
const OCT_2 = note("n2", "2026-10-02T05:00:00Z", "2026-10-03T07:27:00Z");
const OCT_5 = note("n5", "2026-10-05T05:00:00Z");

describe("sortNotes", () => {
  it("UT-NOT-01: sorts by the newest change first", () => {
    const sorted = sortNotes([OCT_1, OCT_2, OCT_5]);

    expect(sorted.map((n) => n.noteId)).toEqual(["n5", "n2", "n1"]);
  });
});

describe("splitNotePeople", () => {
  it("UT-NOT-02: favorites come first on the Notes tab, each section by latest note", () => {
    const person = (name: string, at: string): NotePerson => ({
      user: { ...summaryOf("bob"), userId: `usr_${name}`, displayName: name },
      noteCount: 1,
      lastNote: { noteId: `n_${name}`, text: "x", createdAt: at, updatedAt: null },
    });
    const people = [
      person("ploy", "2026-10-05T00:00:00Z"),
      person("fern", "2026-10-03T00:00:00Z"),
      person("kwan", "2026-10-01T00:00:00Z"),
      person("mint", "2026-10-04T00:00:00Z"),
    ];

    const split = splitNotePeople(people, new Set(["usr_mint", "usr_fern"]));

    expect(split.favorites.map((p) => p.user.displayName)).toEqual(["mint", "fern"]);
    expect(split.others.map((p) => p.user.displayName)).toEqual(["ploy", "kwan"]);
  });
});

describe("replaceNote", () => {
  it("UT-NOT-03: an edited note replaces the cached one and sorts first", () => {
    const edited = { ...OCT_2, text: "New text", updatedAt: "2026-10-06T02:00:00Z" };

    const notes = replaceNote([OCT_5, OCT_2, OCT_1], edited);

    expect(notes).toHaveLength(3);
    expect(notes[0]).toEqual(edited);
  });
});

describe("removeNote", () => {
  it("UT-NOT-04: a deleted note is removed, and an already missing one changes nothing", () => {
    const after = removeNote([OCT_5, OCT_2, OCT_1], "n1");
    const missing = removeNote(after, "n1");

    expect(after.map((n) => n.noteId)).toEqual(["n5", "n2"]);
    expect(missing).toEqual(after);
  });
});
