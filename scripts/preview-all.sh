#!/usr/bin/env bash
# preview-all.sh
# Opens the app on the small Android, iPhone 15 and tablet emulators (not all six: each emulator
# takes a few GB of RAM). Passes --mocks on to preview.sh.
# Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
set -euo pipefail
cd "$(dirname "$0")"
for avd in mairu-android-small mairu-iphone-15 mairu-tablet; do
  bash ./preview.sh "$avd" "$@"
done
