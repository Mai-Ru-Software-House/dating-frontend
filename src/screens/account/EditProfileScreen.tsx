/**
 * EditProfileScreen.tsx
 * Edit profile (design.md 6.17): waits for the cached profile, then shows the form. Behind
 * FEATURES.editProfile.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useMe } from "../../hooks/useMe";
import type { RootScreenProps } from "../../navigation/types";
import { EditProfileForm } from "./EditProfileForm";

/**
 * The Edit profile screen (waits for the cached profile).
 * @param props Navigation and route.
 * @returns The screen.
 */
export function EditProfileScreen(props: RootScreenProps<"EditProfile">): React.JSX.Element | null {
  const me = useMe().data;
  return me === undefined ? null : <EditProfileForm {...props} me={me} />;
}
