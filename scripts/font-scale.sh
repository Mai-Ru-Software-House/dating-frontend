#!/usr/bin/env bash
# font-scale.sh
# Sets an emulator's text size, for the 1.3× large text check (design.md 2.6).
# Usage: npm run text:large -- emulator-5554   /   npm run text:normal -- emulator-5554
# Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
set -euo pipefail
source "$(dirname "$0")/android-env.sh"

scale="$1"
serial="${2:-}"
case "$serial" in
  emulator-*) ;;
  *)
    echo "Give an emulator serial, for example: npm run text:large -- emulator-5554" >&2
    exit 1
    ;;
esac
adb -s "$serial" shell settings put system font_scale "$scale"
echo "Font scale on $serial is now $scale"
