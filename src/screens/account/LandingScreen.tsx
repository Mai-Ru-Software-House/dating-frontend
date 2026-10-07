/**
 * LandingScreen.tsx
 * First screen when signed out (design.md 6.1): hero art, the "mai ru" wordmark, the tagline, and
 * "Create profile" / "Log in". The screen doesn't scroll: the hero takes the height that's left, so
 * it shrinks on short screens and at large text sizes and the buttons stay on screen.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { Image, StyleSheet, Text, View } from "react-native";

import { Button } from "../../components/Button";
import { Screen } from "../../components/Screen";
import type { RootScreenProps } from "../../navigation/types";
import { colors, columnStyle, fonts, GUTTER, space, type } from "../../theme";

const HERO = require("../../../assets/landing-hero.png") as number;
const HERO_MAX_HEIGHT = 262;

/**
 * The landing screen.
 * @param props.navigation The root stack navigation.
 * @returns The screen.
 */
export function LandingScreen({ navigation }: RootScreenProps<"Landing">): React.JSX.Element {
  return (
    <Screen isScrollable={false}>
      <View style={[columnStyle, styles.content]}>
        <View style={styles.heroArea}>
          <Image
            source={HERO}
            style={styles.hero}
            resizeMode="contain"
            accessibilityLabel="Two profile cards with a 92% match"
          />
        </View>
        <View style={styles.brand}>
          <Text style={styles.wordmark} accessibilityRole="header" accessibilityLabel="mai ru">
            mai ru<Text style={styles.dot}>.</Text>
          </Text>
          <Text style={styles.tagline}>
            Meet people nearby who actually fit what you&apos;re looking for.
          </Text>
        </View>
        <View style={styles.buttons}>
          <Button label="Create profile" onPress={() => navigation.navigate("CreateProfile")} />
          <Button label="Log in" variant="secondary" onPress={() => navigation.navigate("Login")} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: GUTTER,
    paddingBottom: space.xxl,
  },
  heroArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: space.xxl,
  },
  hero: {
    width: "100%",
    flex: 1,
    maxHeight: HERO_MAX_HEIGHT,
  },
  brand: {
    gap: space.lg,
    marginBottom: space.xxxl,
  },
  wordmark: {
    ...type.display,
    color: colors.ink,
  },
  dot: {
    color: colors.accent,
  },
  tagline: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fonts.regular,
    color: colors.muted,
    maxWidth: 320,
  },
  buttons: {
    gap: space.md,
    paddingTop: space.lg,
  },
});
