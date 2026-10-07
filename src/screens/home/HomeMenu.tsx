/**
 * HomeMenu.tsx
 * The four Home tiles in two columns (design.md 6.7).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { FileText, Heart, MessageSquare, Search } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { MenuTile } from "../../components/MenuTile";
import { space, tileTints } from "../../theme";

/** Props for HomeMenu. */
export interface HomeMenuProps {
  matchesSubtitle: string;
  chatsSubtitle: string;
  onMatches: () => void;
  onSearch: () => void;
  onChats: () => void;
  onNotes: () => void;
}

/**
 * The Home menu tiles.
 * @param props See HomeMenuProps.
 * @returns The 2 × 2 grid.
 */
export function HomeMenu(props: HomeMenuProps): React.JSX.Element {
  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <MenuTile
          icon={Heart}
          tint={tileTints.matches}
          title="Matches"
          subtitle={props.matchesSubtitle}
          onPress={props.onMatches}
        />
        <MenuTile
          icon={Search}
          tint={tileTints.search}
          title="Search"
          subtitle="By age and distance"
          onPress={props.onSearch}
        />
      </View>
      <View style={styles.row}>
        <MenuTile
          icon={MessageSquare}
          tint={tileTints.chats}
          title="Chats"
          subtitle={props.chatsSubtitle}
          onPress={props.onChats}
        />
        <MenuTile
          icon={FileText}
          tint={tileTints.notes}
          title="Notes"
          subtitle="Private to you"
          onPress={props.onNotes}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: space.md,
  },
  row: {
    flexDirection: "row",
    gap: space.md,
  },
});
