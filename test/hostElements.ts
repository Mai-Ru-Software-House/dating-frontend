/**
 * hostElements.ts
 * Small helpers for tests that walk the rendered element tree.
 * Created by Tee (Kittiphon Kijpinyochai), 20 October 2026
 */

/** The element type Testing Library returns from its queries. */
export type HostElement = ReturnType<
  typeof import("@testing-library/react-native").screen.getByText
>;

/**
 * The parent of a rendered element.
 * @param element The element.
 * @returns Its parent.
 * @throws Error when the element has no parent (it is the root).
 */
export function parentOf(element: HostElement): HostElement {
  const { parent } = element;
  if (parent === null) {
    throw new Error("The element has no parent");
  }
  return parent;
}
