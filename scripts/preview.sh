#!/usr/bin/env bash
# preview.sh
# Boots an emulator by AVD name (if it isn't running), sets Bangkok time and the campus GPS point,
# installs Expo Go if needed, makes sure the dev server runs, and opens the app in Expo Go.
# The dev server calls the real backend (EXPO_PUBLIC_API_BASE_URL); --mocks uses the mock data.
# Every adb call targets the emulator by its serial; physical devices are never touched.
# Usage: npm run preview -- <avd-name> [--mocks]
# Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
set -euo pipefail
source "$(dirname "$0")/android-env.sh"
cd "$(dirname "$0")/.."

avd="mairu-iphone-15"
use_mocks=0
for arg in "$@"; do
  case "$arg" in
    --mocks) use_mocks=1 ;;
    *) avd="$arg" ;;
  esac
done
mode_file=".expo/dev-server.mode"
mode="$([ "$use_mocks" = 1 ] && echo mocks || echo api)"
if ! emulator -list-avds | grep -qx "$avd"; then
  echo "No emulator called $avd. Create them with: npm run avds:create" >&2
  exit 1
fi

start_dev_server() {
  if curl -fs "http://localhost:$METRO_PORT/status" 2>/dev/null | grep -q running; then
    if [ "$(cat "$mode_file" 2>/dev/null)" != "$mode" ]; then
      echo "A dev server is already running and may not be in $mode mode; stop it to switch" >&2
    fi
    return
  fi
  echo "Starting the dev server ($mode); log in .expo/dev-server.log"
  mkdir -p .expo
  echo "$mode" >"$mode_file"
  EXPO_PUBLIC_USE_MOCKS="$use_mocks" nohup npx expo start --port "$METRO_PORT" \
    >.expo/dev-server.log 2>&1 &
  for _ in $(seq 1 90); do
    if curl -fs "http://localhost:$METRO_PORT/status" 2>/dev/null | grep -q running; then
      return
    fi
    sleep 1
  done
  echo "The dev server didn't start; see .expo/dev-server.log" >&2
  exit 1
}

boot() {
  local port serial
  for port in $(seq 5554 2 5584); do
    if ! adb devices | grep -q "^emulator-$port"; then
      break
    fi
  done
  serial="emulator-$port"
  echo "Booting $avd as $serial" >&2
  mkdir -p .expo
  nohup emulator -avd "$avd" -port "$port" -timezone "$TIME_ZONE" -no-boot-anim -no-snapshot-save \
    >".expo/emulator-$avd.log" 2>&1 &
  adb -s "$serial" wait-for-device
  until [ "$(adb -s "$serial" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
    sleep 2
  done
  echo "$serial"
}

install_expo_go() {
  local serial="$1" sdk url apk
  if adb -s "$serial" shell pm list packages | grep -q "host.exp.exponent"; then
    return
  fi
  sdk="$(node -p "require('expo/package.json').version.split('.')[0]").0.0"
  apk=".expo/expo-go-$sdk.apk"
  if [ ! -f "$apk" ]; then
    url="$(curl -fsS https://api.expo.dev/v2/versions/latest | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const v=JSON.parse(s).data.sdkVersions['$sdk'];process.stdout.write(v&&v.androidClientUrl||'')})")"
    if [ -z "$url" ]; then
      echo "Couldn't find Expo Go for SDK $sdk" >&2
      exit 1
    fi
    echo "Downloading Expo Go for SDK $sdk"
    curl -fsSL -o "$apk" "$url"
  fi
  echo "Installing Expo Go on $serial"
  adb -s "$serial" install -r "$apk" >/dev/null
}

start_dev_server
serial="$(serial_for_avd "$avd" || true)"
if [ -z "$serial" ]; then
  serial="$(boot)"
fi
adb -s "$serial" shell settings put global auto_time_zone 0 >/dev/null 2>&1 || true
adb -s "$serial" shell service call alarm 3 s16 "$TIME_ZONE" >/dev/null 2>&1 || true
adb -s "$serial" emu geo fix "$GPS_LON" "$GPS_LAT" >/dev/null
install_expo_go "$serial"
# adb reverse makes the dev server reachable as 127.0.0.1 inside this emulator, even before its
# network is up right after boot.
adb -s "$serial" reverse "tcp:$METRO_PORT" "tcp:$METRO_PORT" >/dev/null
# Right after a force-stop or a fresh boot, am start sometimes only opens Expo Go's launcher
# activity, which closes again without opening the app. So wait until the app's own activity
# (ExperienceActivity) is in front on two checks in a row, and try again a few times.
app_in_front() {
  adb -s "$serial" shell dumpsys activity activities 2>/dev/null | grep 'topResumedActivity' |
    grep -q "host.exp.exponent/.experience.ExperienceActivity"
}
for attempt in 1 2 3 4 5; do
  adb -s "$serial" shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:$METRO_PORT" \
    host.exp.exponent >/dev/null
  for _ in 1 2 3 4 5 6 7 8; do
    sleep 1
    if app_in_front && sleep 2 && app_in_front; then
      echo "Opened Mai Ru on $avd ($serial)"
      exit 0
    fi
  done
  echo "Expo Go isn't in front yet (try $attempt of 5)" >&2
done
echo "Couldn't bring Expo Go to the front on $serial; open it by hand" >&2
exit 1
