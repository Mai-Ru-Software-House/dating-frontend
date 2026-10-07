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
  const store: Map<string, string> = jest.requireActual("./secureStore").secureStoreData;
  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
  };
});

jest.mock("expo-location", () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(async () => true),
}));

jest.mock("expo-image-picker", () => ({
  MediaTypeOptions: { Images: "Images" },
  UIImagePickerPreferredAssetRepresentationMode: { Compatible: "compatible" },
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true, status: "granted" })),
}));

// The native date picker has no Jest renderer: a button stands in for it and picks the date set
// with setPickedDate (test/datePicker.ts).
jest.mock("@react-native-community/datetimepicker", () => {
  const { Pressable, Text } = jest.requireActual("react-native");
  const { pickedDate } = jest.requireActual("./datePicker");
  const Picker = (props: { onValueChange?: (event: object, date: Date) => void }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Choose test date"
      onPress={() => props.onValueChange?.({}, pickedDate())}
    >
      <Text>Choose test date</Text>
    </Pressable>
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

jest.mock("react-native-reanimated", () => jest.requireActual("react-native-reanimated/mock"));

jest.mock("react-native-safe-area-context", () => {
  const mock = jest.requireActual("react-native-safe-area-context/jest/mock").default;
  const { SAFE_AREA_METRICS } = jest.requireActual("./safeArea");
  return {
    ...mock,
    initialWindowMetrics: SAFE_AREA_METRICS,
    useSafeAreaInsets: () => SAFE_AREA_METRICS.insets,
    useSafeAreaFrame: () => SAFE_AREA_METRICS.frame,
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
  clearTimeout: (id) => clearTimeout(id as TimerHandle),
  setInterval: (callback, delay) => unref(setInterval(callback, delay)),
  clearInterval: (id) => clearInterval(id as TimerHandle),
});

// findBy* and waitFor wait up to 5 s: whole-screen flows can be slow when suites run in parallel.
configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  secureStoreData.clear();
});
