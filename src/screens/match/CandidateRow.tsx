/**
 * CandidateRow.tsx
 * A candidate in Recommended or Search results: name and age, district and distance, and the
 * score pill when there is a score (design.md 6.8, 6.9).
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import type { CandidateCard } from "../../api/types";
import { ListRow } from "../../components/ListRow";
import { formatNameAge, formatRowPlace } from "../../utils/format";
import { formatPlace } from "../../utils/place";

/** Props for CandidateRow. */
export interface CandidateRowProps {
  card: CandidateCard;
  isFavorite: boolean;
  onPress: () => void;
}

/**
 * A candidate row.
 * @param props See CandidateRowProps.
 * @returns The row.
 */
export function CandidateRow({ card, isFavorite, onPress }: CandidateRowProps): React.JSX.Element {
  return (
    <ListRow
      user={card}
      title={formatNameAge(card.displayName, card.age)}
      subtitle={formatRowPlace(formatPlace(card.placeName, "short"), card.distanceKm)}
      isFavorite={isFavorite}
      right={{ kind: "candidate", score: card.matchScore }}
      onPress={onPress}
    />
  );
}
