/**
 * useKeyboardVisible.test.ts
 * UT-KBD: the keyboard flag follows the "will" events on iOS and the "did" events on Android.
 * Created by Tee (Kittiphon Kijpinyochai), 26 October 2026
 */
import { act, renderHook } from "@testing-library/react-native";
import { Keyboard, Platform } from "react-native";

import { useKeyboardVisible } from "./useKeyboardVisible";

type Listener = () => void;

const originalOs = Platform.OS;
let listeners: Record<string, Listener>;

beforeEach(() => {
  listeners = {};
  jest.spyOn(Keyboard, "addListener").mockImplementation(((event: string, listener: Listener) => {
    listeners[event] = listener;
    return { remove: jest.fn() };
  }) as unknown as typeof Keyboard.addListener);
});

afterEach(() => {
  jest.restoreAllMocks();
  Platform.OS = originalOs;
});

describe("useKeyboardVisible", () => {
  it("UT-KBD-01: on iOS it listens to the will events, which start with the animation", async () => {
    Platform.OS = "ios";
    const { result } = await renderHook(() => useKeyboardVisible());

    expect(Object.keys(listeners).sort()).toEqual(["keyboardWillHide", "keyboardWillShow"]);
    expect(result.current).toBe(false);
    await act(() => {
      listeners.keyboardWillShow();
    });
    expect(result.current).toBe(true);
    await act(() => {
      listeners.keyboardWillHide();
    });
    expect(result.current).toBe(false);
  });

  it("UT-KBD-02: on Android it listens to the did events, the only ones Android sends", async () => {
    Platform.OS = "android";
    const { result } = await renderHook(() => useKeyboardVisible());

    expect(Object.keys(listeners).sort()).toEqual(["keyboardDidHide", "keyboardDidShow"]);
    await act(() => {
      listeners.keyboardDidShow();
    });
    expect(result.current).toBe(true);
    await act(() => {
      listeners.keyboardDidHide();
    });
    expect(result.current).toBe(false);
  });
});
