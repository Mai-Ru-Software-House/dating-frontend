/**
 * StubScreen.tsx
 * A stand-in for every route a test does not render: it shows its route name and params, so tests
 * can check navigation by reading the screen or the navigation ref.
 * Created by Tee (Kittiphon Kijpinyochai), 20 October 2026
 */
import { Text } from "react-native";

/**
 * A stub screen that shows its route name and params.
 * @param props.route The route.
 * @returns The stub.
 */
export function StubScreen({
  route,
}: {
  route: { name: string; params?: object };
}): React.JSX.Element {
  return <Text>{`Screen: ${route.name} ${JSON.stringify(route.params ?? {})}`}</Text>;
}
