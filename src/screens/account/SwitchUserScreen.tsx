/**
 * SwitchUserScreen.tsx
 * Switch user (design.md 6.18): the current account, the other accounts remembered on this phone
 * (Edit → Remove forgets one), and "Add account". Picking an account opens Login in switch mode.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AccountRow, ACCOUNT_ROW_TEXT_INSET } from "../../components/AccountRow";
import { Avatar } from "../../components/Avatar";
import { Button } from "../../components/Button";
import { ListGroup } from "../../components/ListGroup";
import { Screen } from "../../components/Screen";
import { SectionLabel } from "../../components/SectionLabel";
import { TopBar } from "../../components/TopBar";
import { useMe } from "../../hooks/useMe";
import type { RootScreenProps } from "../../navigation/types";
import { forgetAccount, loadAccounts } from "../../session/knownAccounts";
import { colors, fonts, radius, size, space, type } from "../../theme";

const ACCOUNTS_KEY = ["knownAccounts"] as const;
const CHECK = 24;

/**
 * The Switch user screen.
 * @param props.navigation The root stack navigation.
 * @returns The screen.
 */
export function SwitchUserScreen({ navigation }: RootScreenProps<"SwitchUser">): React.JSX.Element {
  const me = useMe().data;
  const queryClient = useQueryClient();
  const accounts = useQuery({ queryKey: ACCOUNTS_KEY, queryFn: loadAccounts, staleTime: 0 });
  const [isRemoving, setIsRemoving] = useState(false);
  const others = (accounts.data ?? []).filter((a) => a.userId !== me?.userId);

  const remove = async (userId: string): Promise<void> => {
    try {
      queryClient.setQueryData(ACCOUNTS_KEY, await forgetAccount(userId));
    } catch {
      void accounts.refetch();
    }
  };

  return (
    <Screen header={<TopBar title="Switch user" onBack={() => navigation.goBack()} />}>
      <View style={styles.section}>
        <SectionLabel label="Logged in as" />
        {me ? (
          <View
            style={styles.current}
            accessible
            accessibilityLabel={`Logged in as ${me.displayName}, @${me.username}`}
          >
            <Avatar
              userId={me.userId}
              displayName={me.displayName}
              photoUrl={me.photoUrl}
              size={size.avatarRow}
            />
            <View style={styles.currentText}>
              <Text style={styles.currentName} numberOfLines={1}>
                {me.displayName}
              </Text>
              <Text style={styles.username} numberOfLines={1}>
                @{me.username}
              </Text>
            </View>
            <View style={styles.check}>
              <Check size={16} color={colors.white} strokeWidth={2.4} />
            </View>
          </View>
        ) : null}
      </View>
      {others.length > 0 ? (
        <View style={styles.section}>
          <SectionLabel
            label="Other accounts on this phone"
            actionLabel={isRemoving ? "Done" : "Edit"}
            onPress={() => setIsRemoving((on) => !on)}
          />
          <ListGroup dividerInset={ACCOUNT_ROW_TEXT_INSET}>
            {others.map((account) => (
              <AccountRow
                key={account.userId}
                userId={account.userId}
                displayName={account.displayName}
                username={account.username}
                photoUrl={account.photoUrl}
                isRemoving={isRemoving}
                onRemove={() => void remove(account.userId)}
                onPress={() => navigation.navigate("SwitchLogin", { username: account.username })}
              />
            ))}
          </ListGroup>
        </View>
      ) : null}
      <Button
        label="Add account"
        icon={Plus}
        variant="secondary"
        onPress={() => navigation.navigate("SwitchLogin", {})}
        style={styles.add}
      />
      <Text style={styles.footnote}>
        You&apos;ll need the password for the account you switch to.{"\n"}Passwords are never saved
        on this phone.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: space.xxl,
  },
  current: {
    minHeight: size.listRow,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
    padding: space.lg,
  },
  currentText: {
    flex: 1,
  },
  currentName: {
    ...type.rowTitleUnread,
    color: colors.ink,
  },
  username: {
    ...type.rowSub,
    color: colors.muted,
  },
  check: {
    width: CHECK,
    height: CHECK,
    borderRadius: CHECK / 2,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  add: {
    marginTop: space.xxl,
  },
  footnote: {
    ...type.label,
    fontFamily: fonts.regular,
    lineHeight: 20,
    color: colors.muted,
    marginTop: space.xl,
  },
});
