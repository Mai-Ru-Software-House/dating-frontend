/**
 * Stateful.tsx
 * Holds one piece of state for a controlled component under test, so a test does not need to
 * declare a wrapper component of its own.
 * Created by Tee (Kittiphon Kijpinyochai), 20 October 2026
 */
import { useState, type ReactNode } from "react";

/** Props for Stateful. */
export interface StatefulProps<T> {
  /** The state's first value. */
  initial: T;
  /** Draws the component under test from the state and its setter. */
  render: (value: T, setValue: (next: T) => void) => ReactNode;
}

/**
 * Renders a component with local state.
 * @param props See StatefulProps.
 * @returns What `render` returns.
 */
export function Stateful<T>({ initial, render }: StatefulProps<T>): React.JSX.Element {
  const [value, setValue] = useState(initial);
  return <>{render(value, setValue)}</>;
}
