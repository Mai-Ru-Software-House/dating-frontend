# Mai Ru: mobile app (frontend)

The React Native app for **Mai Ru**, the SEN-201 dating app: profiles, match recommendations and
search, favorites, chat with replies, and private notes about people. Built with Expo (managed
workflow, TypeScript), React Navigation, TanStack Query and React Hook Form + Zod. It runs in Expo
Go, so no native build is needed.

The app talks to the Mai Ru backend (`dating-backend`) by default. A built-in mock backend is kept
for demos and for working on screens without a server (see [Mock mode](#mock-mode)).

Owner: Tee (Kittiphon Kijpinyochai).

## Requirements

| Tool         | Version                                              | Needed for                             |
| ------------ | ---------------------------------------------------- | -------------------------------------- |
| Node.js      | 24 LTS (npm 11 comes with it)                        | everything                             |
| git          | any recent                                           |                                        |
| Expo Go      | the version for Expo SDK 57                          | running the app (phone or emulator)    |
| Java         | 21 (Temurin)                                         | the Android SDK tools only             |
| Android SDK  | command-line tools, platform-tools (`adb`), emulator | emulators, in `~/Android/Sdk`          |
| System image | `system-images;android-36;google_apis;x86_64`        | one image for every emulator           |
| KVM          | `/dev/kvm`, your user in the `kvm` group             | hardware acceleration for the emulator |

Only Node and Expo Go on a phone are needed to run the app; the rest is for the emulators. The
scripts find the SDK in `$ANDROID_HOME` (default `~/Android/Sdk`) and put its tools on `PATH`
themselves.

## Install

```bash
git clone https://github.com/Mai-Ru-Software-House/dating-frontend.git
cd dating-frontend
npm install
cp .env.example .env          # then set EXPO_PUBLIC_API_BASE_URL (below)
```

For the emulators, once per PC (no sudo needed):

```bash
# command-line tools unpacked to ~/Android/Sdk/cmdline-tools/latest, then:
sdkmanager --licenses
sdkmanager "platform-tools" "emulator" "system-images;android-36;google_apis;x86_64"
npm run avds:create           # creates the six emulators listed below
```

## Configure the backend

Settings live in `.env` (never committed; `.env.example` is the template). Restart the dev server
after changing it.

| Variable                   | Meaning                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| `EXPO_PUBLIC_API_BASE_URL` | Backend base URL including `/api/v1`, for example `http://10.0.2.2:3000/api/v1`                        |
| `EXPO_PUBLIC_USE_MOCKS`    | `0` (default): call the backend. `1`: use the mock backend. The npm scripts set this for you           |
| `EXPO_PUBLIC_MOCK_FAIL`    | Mock mode only, optional: `match` makes recommendations fail; `expire` sends one 401 to test refreshes |

Which address to use depends on where the app runs:

- **Android emulator, backend on the same PC:** `http://10.0.2.2:<port>/api/v1`. Inside the
  emulator, `localhost` is the emulator itself; `10.0.2.2` is the PC.
- **Phone on the same Wi-Fi:** `http://<PC's LAN IP>:<port>/api/v1`, for example
  `http://192.168.1.23:3000/api/v1` (`hostname -I` shows the IP). The backend must listen on
  `0.0.0.0`, not only `127.0.0.1`, and the firewall must allow the port.

If the backend can't be reached, the app shows its offline screen with a "Try again" button.

## Run the app

### On an Android emulator

```bash
npm run preview -- mairu-iphone-15
```

This boots the emulator if it isn't running, sets Bangkok time and the campus GPS point, installs
Expo Go if needed, starts the dev server against the backend if it isn't running, and opens the app.
Add `--mocks` to use the mock backend instead: `npm run preview -- mairu-iphone-15 --mocks`.

The dev server keeps running in the background (log in `.expo/dev-server.log`). To switch between
the backend and mocks, stop it first: `pkill -f "expo start"`.

### On a phone

1. Install **Expo Go** from the Play Store (or the App Store), and put the phone on the same Wi-Fi
   as the PC.
2. Set `EXPO_PUBLIC_API_BASE_URL` to the PC's LAN IP (see above).
3. Run `npm start` and scan the QR code: with the Android Expo Go app, or with the iPhone camera.
4. If the phone can't reach the dev server (guest Wi-Fi, campus network), use
   `npx expo start --tunnel` instead.

### Emulators

One system image, six virtual devices, one per size in `design.md` 2.6. Sizes are in dp, which equal
the design's points (dp = pixels × 160 / density). Each has the hardware keyboard on, so you can
type with the PC keyboard, and boots in the Asia/Bangkok time zone.

| AVD name               | Stands in for               | Size (dp)  | Pixels      | Density |
| ---------------------- | --------------------------- | ---------- | ----------- | ------- |
| `mairu-android-small`  | small Android               | 360 × 640  | 1080 × 1920 | 480     |
| `mairu-iphone-se`      | iPhone SE                   | 375 × 667  | 750 × 1334  | 320     |
| `mairu-iphone-15`      | iPhone 15 (the design size) | 393 × 852  | 1179 × 2556 | 480     |
| `mairu-android-large`  | large Android               | 411 × 914  | 1080 × 2400 | 420     |
| `mairu-iphone-pro-max` | iPhone 15 Pro Max           | 430 × 932  | 1290 × 2796 | 480     |
| `mairu-tablet`         | iPad in portrait            | 820 × 1180 | 1640 × 2360 | 320     |

**The "iPhone" emulators are Android emulators with iPhone screen sizes**, because iOS can't be
emulated on Linux. They show the layout at those sizes, but not iOS fonts, the notch or Dynamic
Island, the home indicator, or iOS-only behavior (the iOS date picker and keyboard handling). Check
iOS itself on a Mac with the iOS Simulator, or on an iPhone with Expo Go.

Emulator serials look like `emulator-5554` (`adb devices` lists them). The scripts only talk to
emulators, by serial; a phone plugged into the PC is left alone. Rotate an emulator with
`Ctrl+Left` / `Ctrl+Right` to check landscape. Expo Go shows its own dev-menu sheet and a floating
gear button on first launch; close the sheet with "Continue".

## Scripts

| Command                                                       | What it does                                                                                      |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `npm start`                                                   | Expo dev server against the backend (`EXPO_PUBLIC_API_BASE_URL`)                                  |
| `npm run start:mocks`                                         | Expo dev server with the mock backend                                                             |
| `npm run preview -- <avd-name> [--mocks]`                     | Opens the app on that emulator (see above). Without a name it uses `mairu-iphone-15`              |
| `npm run preview:all [-- --mocks]`                            | The same on `mairu-android-small`, `mairu-iphone-15` and `mairu-tablet` (each takes a few GB RAM) |
| `npm run text:large -- <serial>`                              | Text size 1.3× on that emulator, for the large text check                                         |
| `npm run text:normal -- <serial>`                             | Text size back to 1.0×                                                                            |
| `npm run avds:create`                                         | Creates (or recreates) the six emulators                                                          |
| `npm run typecheck` / `npm run lint` / `npm run format:check` | `tsc --noEmit`, ESLint, Prettier. Run all three before every commit                               |
| `npm test` / `npm run test:ci`                                | Unit tests (Jest, `unit-test-plan.md`); `test:ci` adds coverage with the plan's thresholds        |

## Mock mode

The mock backend (`src/api/mocks/`) answers every API call in memory, with data that reproduces the
designs, so every screen can be shown without a server. Start it with `npm run start:mocks` or
`npm run preview -- <avd-name> --mocks`. Data resets when the app reloads.

Mock times are relative to the device clock (the designs' "today" is shown as today), so "Today",
"Yesterday" and list times look like the designs. One side effect: today's mock messages sit at
09:48–10:03, so before 10:03 a message you send is sorted above them.

| Username    | Password                | Logs in as                               |
| ----------- | ----------------------- | ---------------------------------------- |
| `Kittiphon` | anything except `wrong` | Tee (the designs' user)                  |
| `Kittiphon` | `wrong`                 | fails with "Wrong username or password." |
| `mai_ru01`  | `password123`           | Mai (remembered on Switch user)          |
| `mai_ru02`  | `password123`           | Mai (second remembered account)          |

Also: the username `nok` is always taken, and GPS at 12.500, 100.900 has no place name. The preview
script puts the emulator's GPS on the KMITL/CMKL campus (13.723, 100.784).

## Feature flags

In `src/constants/features.ts`:

| Feature                    | Backend | Mocks | Why                                                            |
| -------------------------- | ------- | ----- | -------------------------------------------------------------- |
| Edit profile               | off     | on    | waits for `PATCH /users/me` to be confirmed                    |
| Edit and delete a note     | off     | on    | waits for `PATCH` and `DELETE /notes/{noteId}` to be confirmed |
| Typing indicator in a chat | off     | off   | the API has no typing status                                   |

## Project layout

```
index.ts                 entry point
src/App.tsx              providers, fonts, splash, navigation
src/navigation/          root stack, tabs, Notes stack, route types
src/screens/             account/, home/, match/, chat/ (notes live in chat/)
src/components/          one component per file (design.md 3)
src/api/                 the only code that calls fetch; API types; mocks/
src/session/             tokens (secure store), session provider, remembered accounts, query client
src/hooks/               data hooks (useMe, useFavorites, useUnread, ...)
src/utils/               pure functions: formatting, rules, grouping, sorting
src/constants/           limits, gender list, feature flags, env
src/theme/               colors, type, spacing, layout helpers
scripts/                 emulator and preview helpers
```

Design and API docs live outside this repo, in the team's `Mai Ru Dating App/docs/` folder
(`design.md`, `api-contract.md`, `api-integration.md`, `implementation-plan.md`).

## Contributing

`main` always builds; changes reach it through a reviewed pull request from a feature branch. Every
file starts with a header comment (name, purpose, author and date), exported functions and
components have JSDoc, and TypeScript is `strict` with no `any`. Never commit `.env`.
