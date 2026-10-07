/**
 * PreferencesStep.tsx
 * Create profile step 3 (design.md 6.6): who to see, the age range (18 to 40) and the maximum
 * distance (1 to 100 km). The knobs can't leave the ends or cross.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { ChipGroup } from "../../components/ChipGroup";
import { RangeSlider } from "../../components/RangeSlider";
import { Slider } from "../../components/Slider";
import {
  AGE_SLIDER_MAX,
  AGE_SLIDER_MIN,
  DISTANCE_SLIDER_MAX,
  DISTANCE_SLIDER_MIN,
} from "../../constants/limits";
import { TARGET_CHIPS } from "../../constants/profile";
import type { CreateProfileController } from "./useCreateProfile";

/** The "Interested in" / "Show me" options. */
export const TARGET_OPTIONS = TARGET_CHIPS.map((chip) => ({ value: chip, label: chip }));

/**
 * Formats a distance for the slider.
 * @param km Kilometres.
 * @returns For example "50 km".
 */
export function kmLabel(km: number): string {
  return `${km} km`;
}

/**
 * Step 3: Preferences.
 * @param props.form The Create profile controller.
 * @returns The step's controls.
 */
export function PreferencesStep({ form }: { form: CreateProfileController }): React.JSX.Element {
  const { values, set, errorFor } = form;
  return (
    <>
      <ChipGroup
        label="Interested in"
        options={TARGET_OPTIONS}
        value={values.targetChip}
        onChange={(chip) => set("targetChip", chip)}
        error={errorFor("targetChip")}
      />
      <RangeSlider
        label="Age range"
        min={AGE_SLIDER_MIN}
        max={AGE_SLIDER_MAX}
        value={[values.minAge, values.maxAge]}
        onChange={([low, high]) => {
          set("minAge", low);
          set("maxAge", high);
        }}
        lowLabel="Minimum age"
        highLabel="Maximum age"
      />
      <Slider
        label="Maximum distance"
        min={DISTANCE_SLIDER_MIN}
        max={DISTANCE_SLIDER_MAX}
        value={values.radiusKm}
        onChange={(km) => set("radiusKm", km)}
        format={kmLabel}
      />
    </>
  );
}
