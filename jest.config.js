/**
 * jest.config.js
 * Jest settings for the unit tests (unit-test-plan.md 2.3): the jest-expo preset, Bangkok time,
 * shared native-module mocks, and the coverage thresholds.
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
module.exports = {
  preset: "jest-expo",
  globalSetup: "<rootDir>/test/globalSetup.ts",
  setupFilesAfterEnv: ["<rootDir>/test/setup.tsx"],
  testMatch: ["<rootDir>/src/**/*.test.ts?(x)"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|react-native-svg|lucide-react-native)",
  ],
  // lucide's "react-native" export is an ES module (.mjs) that Jest doesn't transform; use its
  // CommonJS build in tests.
  moduleNameMapper: {
    "^lucide-react-native$":
      "<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js",
  },
  collectCoverageFrom: [
    "src/utils/**/*.ts",
    "src/api/**/*.ts",
    "src/session/**/*.ts?(x)",
    "src/hooks/**/*.ts",
    "src/constants/**/*.ts",
    "!src/api/mocks/**",
  ],
  coverageThreshold: {
    "./src/utils/": { lines: 90, branches: 85 },
    "./src/api/": { lines: 85, branches: 80 },
  },
};
