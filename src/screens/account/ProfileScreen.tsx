/**
 * ProfileScreen.tsx
 * The user's own profile (design.md 6.16): photo, name and age, place, "Edit profile", "Looking
 * for", the read-only account details, and Switch user / Log out.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { LogOut, MapPin, Pencil, Users } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { ActionRow, ACTION_ROW_TEXT_INSET } from "../../components/ActionRow";
import { Button } from "../../components/Button";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { InfoRow } from "../../components/InfoRow";
import { ListGroup } from "../../components/ListGroup";
import { ProfileLayout } from "../../components/ProfileLayout";
import { SectionLabel } from "../../components/SectionLabel";
import { useToast } from "../../components/Toast";
import { FEATURES } from "../../constants/features";
import { genderLabel } from "../../constants/profile";
import { useMe } from "../../hooks/useMe";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";
import type { RootScreenProps } from "../../navigation/types";
import { useSession } from "../../session/SessionProvider";
import { colors, ICON_STROKE, PROFILE_PHOTO, space, type } from "../../theme";
import { ageOn } from "../../utils/age";
import { formatDob, formatLookingFor, formatNameAge } from "../../utils/format";
import { formatPlace } from "../../utils/place";

/**
 * The Profile screen.
 * @param props.navigation The root stack navigation.
 * @returns The screen.
 */
export function ProfileScreen({ navigation }: RootScreenProps<"Profile">): React.JSX.Element {
  const query = useMe();
  const session = useSession();
  const toast = useToast();
  const [isLogOutOpen, setIsLogOutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const refresh = async (): Promise<void> => {
    const result = await query.refetch();
    if (result.isError) {
      toast.show("Couldn't refresh your profile.");
    }
  };
  useRefreshOnFocus(refresh);
  const me = query.data;

  if (me === undefined) {
    return <ActivityIndicator style={styles.loading} color={colors.accent} />;
  }
  const place = formatPlace(me.placeName, "full");
  const logOut = async (): Promise<void> => {
    setIsLoggingOut(true);
    await session.logOut();
  };

  return (
    <ProfileLayout
      userId={me.userId}
      photoUrl={me.photoUrl}
      photoSize={PROFILE_PHOTO}
      onBack={() => navigation.goBack()}
      onRefresh={refresh}
    >
      <Text style={styles.name} accessibilityRole="header">
        {formatNameAge(me.displayName, ageOn(me.dateOfBirth) ?? 0)}
      </Text>
      {place !== null ? (
        <View style={styles.placeRow}>
          <MapPin size={18} color={colors.muted} strokeWidth={ICON_STROKE} />
          <Text style={styles.place} numberOfLines={1}>
            {place}
          </Text>
        </View>
      ) : null}
      {FEATURES.editProfile ? (
        <Button
          label="Edit profile"
          icon={Pencil}
          variant="secondary"
          onPress={() => navigation.navigate("EditProfile")}
          style={styles.edit}
        />
      ) : null}
      <View style={styles.section}>
        <SectionLabel label="Looking for" />
        <Text style={styles.body}>{formatLookingFor(me.preferences)}</Text>
      </View>
      <View style={styles.section}>
        <SectionLabel label="Account" hint="Only you can see this" />
        <ListGroup>
          <InfoRow label="Username" value={me.username} />
          <InfoRow label="Date of birth" value={formatDob(me.dateOfBirth)} />
          <InfoRow label="Gender" value={genderLabel(me.gender)} />
        </ListGroup>
      </View>
      <View style={styles.actions}>
        <ListGroup dividerInset={ACTION_ROW_TEXT_INSET}>
          <ActionRow
            icon={Users}
            label="Switch user"
            onPress={() => navigation.navigate("SwitchUser")}
          />
          <ActionRow
            icon={LogOut}
            label="Log out"
            isDestructive
            onPress={() => setIsLogOutOpen(true)}
          />
        </ListGroup>
      </View>
      <ConfirmDialog
        isVisible={isLogOutOpen}
        title="Log out?"
        message="You'll need your username and password to get back in."
        confirmLabel="Log out"
        onCancel={() => setIsLogOutOpen(false)}
        onConfirm={() => void logOut()}
        isBusy={isLoggingOut}
      />
    </ProfileLayout>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  name: {
    ...type.profileName,
    color: colors.ink,
  },
  placeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: space.sm,
  },
  place: {
    ...type.body,
    color: colors.muted,
    flexShrink: 1,
  },
  edit: {
    marginTop: space.xl,
  },
  section: {
    marginTop: space.xxl,
  },
  body: {
    ...type.body,
    fontSize: 16,
    color: colors.ink,
  },
  actions: {
    marginTop: space.lg,
  },
});
