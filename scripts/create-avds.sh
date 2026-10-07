#!/usr/bin/env bash
# create-avds.sh
# Creates the six preview emulators from one system image and sets each one's screen size,
# density and hardware keyboard in its config.ini. Safe to run again: existing AVDs are replaced.
# Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
set -euo pipefail
source "$(dirname "$0")/android-env.sh"

for entry in "${AVDS[@]}"; do
  read -r name width height density <<<"$entry"
  echo "Creating $name (${width}x${height} px, density $density)"
  echo "no" | avdmanager --silent create avd --force --name "$name" --package "$SYSTEM_IMAGE" --device "pixel_6" >/dev/null
  config="$HOME/.android/avd/$name.avd/config.ini"
  sed -i -E '/^(hw\.lcd\.width|hw\.lcd\.height|hw\.lcd\.density|hw\.keyboard|skin\.name|skin\.path|hw\.initialOrientation|showDeviceFrame)=/d' "$config"
  {
    echo "hw.lcd.width=$width"
    echo "hw.lcd.height=$height"
    echo "hw.lcd.density=$density"
    echo "hw.keyboard=yes"
    echo "skin.name=${width}x${height}"
    echo "skin.path=_no_skin"
    echo "showDeviceFrame=no"
  } >>"$config"
done
echo "Done. List them with: emulator -list-avds"
