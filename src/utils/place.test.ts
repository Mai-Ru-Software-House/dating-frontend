/**
 * place.test.ts
 * UT-PLC: place names, district first (unit-test-plan.md 6.3).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { formatPlace } from "./place";

describe("formatPlace", () => {
  it("UT-PLC-01: shows only the district on cards and rows", () => {
    const result = formatPlace("Bangkok, Min Buri", "short");

    expect(result).toBe("Min Buri");
  });

  it("UT-PLC-02: shows district then province on profiles", () => {
    const result = formatPlace("Bangkok, Lat Krabang", "full");

    expect(result).toBe("Lat Krabang, Bangkok");
  });

  it("UT-PLC-03: shows a province-only name as it is", () => {
    const short = formatPlace("Bangkok", "short");
    const full = formatPlace("Bangkok", "full");

    expect(short).toBe("Bangkok");
    expect(full).toBe("Bangkok");
  });

  it("UT-PLC-04: returns null when there is no place name, so the line is hidden", () => {
    const fromNull = formatPlace(null, "full");
    const fromEmpty = formatPlace("", "short");

    expect(fromNull).toBeNull();
    expect(fromEmpty).toBeNull();
  });
});
