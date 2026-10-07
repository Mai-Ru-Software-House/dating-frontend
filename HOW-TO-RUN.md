<!--
HOW-TO-RUN.md
Short steps to start the Mai Ru app on an emulator or a phone; README.md has the full reference.
Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
-->

# How to start the Mai Ru app

The short version of [README.md](README.md). Run every command from this repo's folder, after
`npm install` and `cp .env.example .env` (see [Install](README.md#install)).

## Start it

**With mock data (no backend needed):**

```bash
npm run preview -- mairu-iphone-15 --mocks
```

This boots the `mairu-iphone-15` Android emulator, starts the Expo dev server in the background, and
opens the app in Expo Go. The first boot takes about a minute. Log in as `Kittiphon` with any
password except `wrong`.

**With the real backend** (`dating-backend` running, `EXPO_PUBLIC_API_BASE_URL` set in `.env`):

```bash
npm run preview -- mairu-iphone-15
```

Other screen sizes: replace `mairu-iphone-15` with `mairu-android-small`, `mairu-iphone-se`,
`mairu-android-large`, `mairu-iphone-pro-max` or `mairu-tablet`.

## Switch between mock data and the backend

The dev server keeps running after the command finishes, and stays in the mode it started in. To
switch, stop it, then run the other command:

```bash
pkill -f "[e]xpo start"
```

If the app shows the offline screen ("Try again"), the dev server is probably in backend mode with
no backend running: stop it and start again with `--mocks`.

## Reload and stop

- Code changes reload by themselves. To force a reload, press `R` twice in the emulator window.
- Dev server log: `.expo/dev-server.log`
- Stop the dev server: `pkill -f "[e]xpo start"`
- Stop the emulator: close its window.

## On a phone instead

1. Install Expo Go and connect the phone to the same Wi-Fi as the PC.
2. Run `npm run start:mocks` (or `npm start` for the backend) and scan the QR code.
3. If it can't connect (campus Wi-Fi), use `npx expo start --tunnel`.
