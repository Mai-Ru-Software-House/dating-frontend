/**
 * LoginScreen.tsx
 * Log in (design.md 6.2), also used as "Login in switch mode" from Switch user (6.18): there the
 * sign-up link is hidden and the current session stays alive until the new login works.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ERROR_COPY, messageFor, toApiError } from "../../api/errors";
import { sessionsApi } from "../../api/sessions";
import { Banner } from "../../components/Banner";
import { Button } from "../../components/Button";
import { Screen } from "../../components/Screen";
import { TextField } from "../../components/TextField";
import { TopBar } from "../../components/TopBar";
import { useToast } from "../../components/Toast";
import type { RootScreenProps } from "../../navigation/types";
import { useSession } from "../../session/SessionProvider";
import { colors, fonts, space, type } from "../../theme";
import { MESSAGES } from "../../utils/rules";

/** Field errors and the banner. */
interface LoginErrors {
  username?: string;
  password?: string;
  banner?: string;
  isPasswordRed?: boolean;
}

/**
 * The login screen.
 * @param props Navigation and route; route "SwitchLogin" turns on switch mode.
 * @returns The screen.
 */
export function LoginScreen({
  navigation,
  route,
}: RootScreenProps<"Login" | "SwitchLogin">): React.JSX.Element {
  const isSwitch = route.name === "SwitchLogin";
  const session = useSession();
  const toast = useToast();
  const [username, setUsername] = useState(route.params?.username ?? "");
  const [password, setPassword] = useState("");
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const submit = async (): Promise<void> => {
    const empty: LoginErrors = {
      username: username.trim() === "" ? MESSAGES.loginUsername : undefined,
      password: password === "" ? MESSAGES.loginPassword : undefined,
    };
    setErrors(empty);
    if (empty.username || empty.password) {
      return;
    }
    setIsBusy(true);
    try {
      if (isSwitch) {
        const profile = await session.switchTo(username.trim(), password);
        toast.show(`Logged in as ${profile.displayName}.`);
      } else {
        await session.logIn(await sessionsApi.logIn(username.trim(), password));
      }
    } catch (error) {
      setErrors(errorsFor(error));
      setIsBusy(false);
    }
  };

  return (
    <Screen header={<TopBar onBack={() => navigation.goBack()} />} contentStyle={styles.content}>
      <Text style={styles.title} accessibilityRole="header">
        Welcome back
      </Text>
      <Text style={styles.subtitle}>Log in to see your matches and messages.</Text>
      <TextField
        label="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="username"
        autoComplete="username"
        returnKeyType="next"
        isLocked={isBusy}
        error={errors.username}
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!isPasswordShown}
        textContentType="password"
        autoComplete="current-password"
        autoCapitalize="none"
        returnKeyType="go"
        onSubmitEditing={submit}
        isLocked={isBusy}
        error={errors.password}
        hasErrorBorder={errors.isPasswordRed}
        trailing={{
          label: isPasswordShown ? "Hide" : "Show",
          onPress: () => setIsPasswordShown((shown) => !shown),
          accessibilityLabel: isPasswordShown ? "Hide password" : "Show password",
        }}
      />
      <View style={styles.actions}>
        <Button label="Log in" onPress={submit} isLoading={isBusy} />
        <Banner message={errors.banner} />
      </View>
      {isSwitch ? null : (
        <View style={styles.footer}>
          <Text style={styles.footerText}>New here? </Text>
          <Pressable
            onPress={() => navigation.replace("CreateProfile")}
            accessibilityRole="link"
            hitSlop={8}
          >
            <Text style={styles.link}>Create a profile</Text>
          </Pressable>
        </View>
      )}
    </Screen>
  );
}

/**
 * Turns a login failure into what the form shows.
 * @param error What was caught.
 * @returns The errors.
 */
function errorsFor(error: unknown): LoginErrors {
  const apiError = toApiError(error);
  if (apiError.code === "INVALID_CREDENTIALS") {
    return { banner: ERROR_COPY.INVALID_CREDENTIALS, isPasswordRed: true };
  }
  if (apiError.code === "INVALID_INPUT" && apiError.field === "username") {
    return { username: apiError.message || MESSAGES.loginUsername };
  }
  if (apiError.code === "INVALID_INPUT" && apiError.field === "password") {
    return { password: apiError.message || MESSAGES.loginPassword };
  }
  return { banner: messageFor(apiError) };
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingTop: space.xxl,
  },
  title: {
    ...type.title,
    color: colors.ink,
  },
  subtitle: {
    ...type.body,
    color: colors.muted,
    marginTop: space.sm,
    marginBottom: space.xxxl,
  },
  actions: {
    gap: space.xl,
    marginTop: space.xl,
  },
  footer: {
    marginTop: "auto",
    paddingTop: space.xxxl,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  footerText: {
    ...type.body,
    color: colors.muted,
  },
  link: {
    ...type.body,
    fontFamily: fonts.semibold,
    color: colors.accent,
  },
});
