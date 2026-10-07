/**
 * OfflineScreen.tsx
 * Shown at start-up when the server can't be reached. The tokens are kept: being offline is not
 * being logged out (api-integration.md 3.2).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { StyleSheet, Text, View } from "react-native";

import { ERROR_COPY } from "../../api/errors";
import { Button } from "../../components/Button";
import { Screen } from "../../components/Screen";
import { useSession } from "../../session/SessionProvider";
import { colors, space, type } from "../../theme";

/**
 * The offline screen.
 * @returns The screen.
 */
export function OfflineScreen(): React.JSX.Element {
  const { retry } = useSession();
  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.center}>
        <Text style={styles.text}>{ERROR_COPY.NETWORK_ERROR}</Text>
        <Button label="Try again" variant="secondary" onPress={retry} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
  },
  center: {
    gap: space.xl,
  },
  text: {
    ...type.body,
    color: colors.muted,
    textAlign: "center",
  },
});
