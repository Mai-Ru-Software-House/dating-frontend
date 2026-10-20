/**
 * setup.tsx
 * Shared mocks for every test file (unit-test-plan.md 2.3): in-memory secure storage, location and
 * image picker stubs, Reanimated and Gesture Handler test setups, and safe-area insets that match
 * the designs (47 pt top, 34 pt bottom).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import "react-native-gesture-handler/jestSetup";

import { timeoutManager } from "@tanstack/react-query";
import { configure } from "@testing-library/react-native";

import { secureStoreData } from "./secureStore";

jest.mock("expo-secure-store", () => {
  const store = jest.requireActual<typeof import("./secureStore")>("./secureStore").secureStoreData;
  return {
    getItemAsync: jest.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    setItemAsync: jest.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    }),
    deleteItemAsync: jest.fn((key: string) => {
      store.delete(key);
      return Promise.resolve();
    }),
  };
});

jest.mock("expo-location", () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(() => Promise.resolve(true)),
}));

jest.mock("expo-image-picker", () => ({
  MediaTypeOptions: { Images: "Images" },
  UIImagePickerPreferredAssetRepresentationMode: { Compatible: "compatible" },
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ granted: true, status: "granted" }),
  ),
}));

// The native date picker has no Jest renderer: a button stands in for it and picks the date set
// with setPickedDate (test/datePicker.ts).
jest.mock("@react-native-community/datetimepicker", () => {
  const native = jest.requireActual<typeof import("react-native")>("react-native");
  const { pickedDate } = jest.requireActual<typeof import("./datePicker")>("./datePicker");
  const Picker = (props: { onValueChange?: (event: object, date: Date) => void }) => (
    <native.Pressable
      accessibilityRole="button"
      accessibilityLabel="Choose test date"
      onPress={() => props.onValueChange?.({}, pickedDate())}
    >
      <native.Text>Choose test date</native.Text>
    </native.Pressable>
  );
  return {
    __esModule: true,
    default: Picker,
    DateTimePickerAndroid: {
      open: (options: { onValueChange?: (event: object, date: Date) => void }) =>
        options.onValueChange?.({}, pickedDate()),
      dismiss: jest.fn(),
    },
  };
});

jest.mock("react-native-worklets", () =>
  jest.requireActual<object>("react-native-worklets/lib/module/mock"),
);

jest.mock("react-native-reanimated", () =>
  jest.requireActual<object>("react-native-reanimated/mock"),
);

jest.mock("react-native-safe-area-context", () => {
  const mock = jest.requireActual<{ default: object }>(
    "react-native-safe-area-context/jest/mock",
  ).default;
  const { SAFE_AREA_METRICS: metrics } =
    jest.requireActual<typeof import("./safeArea")>("./safeArea");
  return {
    ...mock,
    initialWindowMetrics: metrics,
    useSafeAreaInsets: () => metrics.insets,
    useSafeAreaFrame: () => metrics.frame,
  };
});

// TanStack Query keeps cache timers for minutes (gcTime, staleTime). Unref them so a pending timer
// doesn't keep the test worker alive after its tests finish. Set before any QueryClient exists.
type TimerHandle = ReturnType<typeof setTimeout> & { unref?: () => void };
const unref = (timer: TimerHandle): TimerHandle => {
  timer.unref?.();
  return timer;
};
timeoutManager.setTimeoutProvider({
  setTimeout: (callback, delay) => unref(setTimeout(callback, delay)),
  clearTimeout: (id) => {
    clearTimeout(id);
  },
  setInterval: (callback, delay) => unref(setInterval(callback, delay)),
  clearInterval: (id) => {
    clearInterval(id);
  },
});

// findBy* and waitFor wait up to 5 s: whole-screen flows can be slow when suites run in parallel.
configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  secureStoreData.clear();
});
