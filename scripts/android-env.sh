#!/usr/bin/env bash
# android-env.sh
# Shared settings for the preview scripts: Android SDK paths and the emulator list (design.md 2.6).
# Created by Tee (Kittiphon Kijpinyochai), 6 October 2026

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
if [ -z "${JAVA_HOME:-}" ] && [ -d "$HOME/.local/share" ]; then
  JAVA_HOME="$(find "$HOME/.local/share" -maxdepth 1 -type d -name 'jdk-21*' | head -n 1)"
  export JAVA_HOME
fi
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

SYSTEM_IMAGE="system-images;android-36;google_apis;x86_64"
METRO_PORT="${RCT_METRO_PORT:-8081}"
TIME_ZONE="Asia/Bangkok"
# KMITL / CMKL campus, so "Use GPS" finds Lat Krabang like the designs (longitude first).
GPS_LON="100.784"
GPS_LAT="13.723"

# name  width  height  density  (pixels; dp = pixels × 160 / density)
AVDS=(
  "mairu-android-small 1080 1920 480"
  "mairu-iphone-se 750 1334 320"
  "mairu-iphone-15 1179 2556 480"
  "mairu-android-large 1080 2400 420"
  "mairu-iphone-pro-max 1290 2796 480"
  "mairu-tablet 1640 2360 320"
)

# Prints the serial of the running emulator with this AVD name, if any.
serial_for_avd() {
  local wanted="$1" serial name
  for serial in $(adb devices | awk '/^emulator-[0-9]+\tdevice/ {print $1}'); do
    name="$(adb -s "$serial" emu avd name 2>/dev/null | head -n 1 | tr -d '\r')"
    if [ "$name" = "$wanted" ]; then
      echo "$serial"
      return 0
    fi
  done
  return 1
}
