/**
 * SearchBar.tsx
 * Pill search field in chip fill with a search icon ("Search chats", "Search people").
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { Search } from "lucide-react-native";
import { StyleSheet, TextInput, View } from "react-native";

import { colors, ICON_STROKE, MAX_FONT_SCALE, size, space, type } from "../theme";

/** Props for SearchBar. */
export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

/**
 * A search bar.
 * @param props See SearchBarProps.
 * @returns The bar.
 */
export function SearchBar({ value, onChangeText, placeholder }: SearchBarProps): React.JSX.Element {
  return (
    <View style={styles.bar}>
      <Search size={18} color={colors.muted} strokeWidth={ICON_STROKE} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        accessibilityLabel={placeholder}
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: size.touch,
    borderRadius: size.touch / 2,
    backgroundColor: colors.chip,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.lg,
    gap: space.sm,
  },
  input: {
    ...type.body,
    flex: 1,
    color: colors.ink,
    paddingVertical: 0,
  },
});
