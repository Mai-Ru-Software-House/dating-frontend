/**
 * appFocus.test.ts
 * UT-FOC: the query focus state follows the app's foreground state.
 * Created by Tee (Kittiphon Kijpinyochai), 26 October 2026
 */
import { focusManager } from "@tanstack/react-query";
import { AppState, type AppStateStatus } from "react-native";

import { watchAppFocus } from "./appFocus";

describe("watchAppFocus", () => {
  it("UT-FOC-01: queries are unfocused in the background and focused again when active", () => {
    let onChange: (status: AppStateStatus) => void = () => undefined;
    const remove = jest.fn();
    jest.spyOn(AppState, "addEventListener").mockImplementation((_type, listener) => {
      onChange = listener;
      return { remove };
    });

    const stop = watchAppFocus();
    onChange("background");
    expect(focusManager.isFocused()).toBe(false);
    onChange("inactive");
    expect(focusManager.isFocused()).toBe(false);
    onChange("active");
    expect(focusManager.isFocused()).toBe(true);

    stop();
    expect(remove).toHaveBeenCalledTimes(1);
    jest.restoreAllMocks();
  });
});
