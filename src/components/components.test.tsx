/**
 * components.test.tsx
 * UT-CMP: shared components (unit-test-plan.md 6.18).
 * Created by Tee (Kittiphon Kijpinyochai), 7 October 2026
 */
import { fireEvent, render, screen, userEvent } from "@testing-library/react-native";
import { useState } from "react";
import { processColor, StyleSheet, Text } from "react-native";

import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { ChipGroup } from "./ChipGroup";
import { Composer } from "./Composer";
import { ConfirmDialog } from "./ConfirmDialog";
import { InfoRow } from "./InfoRow";
import { NoteCard } from "./NoteCard";
import { RangeSlider } from "./RangeSlider";
import { Screen } from "./Screen";
import { Slider } from "./Slider";
import { TextField } from "./TextField";
import { avatarGradients } from "../theme";
import { gradientIndex } from "../utils/avatar";

/**
 * Fires a screen reader increment or decrement on an adjustable element.
 * @param label The element's accessibility label.
 * @param action "increment" or "decrement".
 * @param times How many times.
 */
async function step(label: string, action: "increment" | "decrement", times = 1): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await fireEvent(screen.getByLabelText(label), "accessibilityAction", {
      nativeEvent: { actionName: action },
    });
  }
}

/** A rendered host element. */
type HostElement = ReturnType<typeof screen.getByText>;

/**
 * Finds the first rendered host element of a type (for elements with no role or text).
 * @param type The host type, for example "Modal" or "RCTScrollView".
 * @returns The element.
 * @throws Error when none is rendered.
 */
function hostOfType(type: string): HostElement {
  const queue: unknown[] = [screen.container];
  while (queue.length > 0) {
    const node = queue.shift() as { type?: unknown; children?: unknown[] } | string;
    if (typeof node !== "object" || node === null) continue;
    if (node.type === type) return node as unknown as HostElement;
    queue.push(...(node.children ?? []));
  }
  throw new Error(`No ${type} rendered`);
}

describe("Button", () => {
  it("UT-CMP-01: disabled and loading buttons can't be pressed; loading shows a spinner", async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(
      <>
        <Button label="Next" onPress={onPress} isDisabled />
        <Button label="Save" onPress={onPress} isLoading />
      </>,
    );

    await user.press(screen.getByRole("button", { name: "Next" }));
    await user.press(screen.getByRole("button", { name: "Save" }));

    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save" })).toBeBusy();
    // The label stays (hidden) so the button keeps its width.
    expect(screen.getByText("Save", { includeHiddenElements: true })).toBeOnTheScreen();
  });
});

describe("TextField", () => {
  it("UT-CMP-02: shows its error and switches Show to Hide on a password", async () => {
    const user = userEvent.setup();
    /** A password field with a working Show / Hide. */
    function PasswordField(): React.JSX.Element {
      const [isHidden, setIsHidden] = useState(true);
      return (
        <>
          <TextField label="Username" value="" error="Username is required." />
          <TextField
            label="Password"
            value="Mint2026"
            secureTextEntry={isHidden}
            trailing={{ label: isHidden ? "Show" : "Hide", onPress: () => setIsHidden(!isHidden) }}
          />
        </>
      );
    }
    await render(<PasswordField />);

    await user.press(screen.getByRole("button", { name: "Show" }));

    expect(screen.getByText("Username is required.")).toBeOnTheScreen();
    expect(screen.getByLabelText("Password")).toHaveProp("secureTextEntry", false);
    expect(screen.getByRole("button", { name: "Hide" })).toBeOnTheScreen();
  });
});

describe("ChipGroup", () => {
  it("UT-CMP-03: only one chip is chosen at a time", async () => {
    const user = userEvent.setup();
    /** Interested in, with state. */
    function InterestedIn(): React.JSX.Element {
      const [value, setValue] = useState<string | null>(null);
      const options = ["Women", "Men", "Everyone"].map((v) => ({ value: v, label: v }));
      return (
        <ChipGroup label="Interested in" options={options} value={value} onChange={setValue} />
      );
    }
    await render(<InterestedIn />);

    await user.press(screen.getByRole("radio", { name: "Men" }));
    await user.press(screen.getByRole("radio", { name: "Women" }));

    expect(screen.getByRole("radio", { name: "Women" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Men" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Everyone" })).not.toBeChecked();
  });
});

describe("RangeSlider", () => {
  it("UT-CMP-04: the knobs stay in range and never cross", async () => {
    const seen: [number, number][] = [];
    /** Age range with state. */
    function AgeRange(): React.JSX.Element {
      const [value, setValue] = useState<[number, number]>([18, 20]);
      return (
        <RangeSlider
          label="Age"
          min={18}
          max={40}
          value={value}
          onChange={(next) => {
            seen.push(next);
            setValue(next);
          }}
          lowLabel="Minimum age"
          highLabel="Maximum age"
        />
      );
    }
    await render(<AgeRange />);

    await step("Minimum age", "increment", 5);
    const afterIncrement = screen.getByLabelText("Minimum age").props.accessibilityValue.now;
    await step("Minimum age", "decrement", 5);

    expect(afterIncrement).toBe(20);
    expect(screen.getByLabelText("Minimum age")).toHaveAccessibilityValue({ now: 18 });
    expect(seen.every(([low, high]) => low >= 18 && low <= high && high <= 40)).toBe(true);
  });
});

describe("Slider", () => {
  it("UT-CMP-05: the distance stays between 1 and 100", async () => {
    /** Distance with state. */
    function Distance({ start }: { start: number }): React.JSX.Element {
      const [value, setValue] = useState(start);
      return (
        <Slider label={`Distance ${start}`} min={1} max={100} value={value} onChange={setValue} />
      );
    }
    await render(
      <>
        <Distance start={1} />
        <Distance start={100} />
      </>,
    );

    await step("Distance 1", "decrement");
    await step("Distance 100", "increment");

    expect(screen.getByLabelText("Distance 1")).toHaveAccessibilityValue({ now: 1 });
    expect(screen.getByLabelText("Distance 100")).toHaveAccessibilityValue({ now: 100 });
  });
});

describe("ConfirmDialog", () => {
  it("UT-CMP-06: Cancel and Android back close it; busy disables both buttons", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    const dialog = (isBusy: boolean): React.JSX.Element => (
      <ConfirmDialog
        isVisible
        title="Delete this note?"
        confirmLabel="Delete"
        onCancel={onCancel}
        onConfirm={onConfirm}
        isBusy={isBusy}
      />
    );
    await render(dialog(false));

    await user.press(screen.getByRole("button", { name: "Cancel" }));
    await fireEvent(hostOfType("Modal"), "requestClose");
    await screen.rerender(dialog(true));
    await user.press(screen.getByRole("button", { name: "Delete" }));
    await user.press(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(2);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});

describe("Avatar", () => {
  it("UT-CMP-07: shows the initial on the user's gradient when the photo fails", async () => {
    await render(
      <Avatar userId="usr_mai" displayName="Mai" photoUrl="/api/v1/photos/pho_m" size={44} />,
    );

    await fireEvent(screen.getByTestId("avatar-image"), "error", {
      nativeEvent: { error: "404" },
    });

    expect(screen.queryByTestId("avatar-image")).not.toBeOnTheScreen();
    expect(screen.getByText("M")).toBeOnTheScreen();
    const expected = avatarGradients[gradientIndex("usr_mai", avatarGradients.length)];
    // The gradient's native view receives the colors as processed ARGB numbers.
    expect(screen.getByText("M").parent).toHaveProp("colors", expected.map(processColor));
  });
});

describe("Composer", () => {
  it("UT-CMP-08: Send follows the message rules and sends the text unchanged", async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();
    /** Composer with state. */
    function Chat(): React.JSX.Element {
      const [value, setValue] = useState("");
      return <Composer value={value} onChangeText={setValue} onSend={onSend} />;
    }
    await render(<Chat />);
    const input = screen.getByLabelText("Message");
    const send = (): ReturnType<typeof screen.getByRole> =>
      screen.getByRole("button", { name: "Send" });
    const states: Record<string, boolean> = {};

    for (const [name, text] of [
      ["empty", ""],
      ["spaces", "   "],
      ["1000", "a".repeat(1000)],
      ["1001", "a".repeat(1001)],
    ]) {
      await fireEvent.changeText(input, text);
      states[name] = send().props.accessibilityState.disabled;
      if (name === "1001") {
        expect(screen.getByText("Messages can be up to 1000 characters.")).toBeOnTheScreen();
      }
    }
    await fireEvent.changeText(input, "");
    await user.type(input, "สวัสดีค่ะ 😊");
    await user.press(send());

    expect(states).toEqual({ empty: true, spaces: true, "1000": false, "1001": true });
    expect(onSend).toHaveBeenCalledWith("สวัสดีค่ะ 😊");
  });
});

describe("NoteCard", () => {
  it("UT-CMP-09: shows only the first line and the last change", async () => {
    const note = {
      noteId: "n1",
      aboutUserId: "usr_bob",
      text: "Met at Siam Paragon\nLikes jazz",
      createdAt: "2026-10-02T05:00:00Z",
      updatedAt: "2026-10-03T07:27:00Z",
    };

    await render(
      <NoteCard note={note} onPress={jest.fn()} now={new Date("2026-10-06T03:00:00Z")} />,
    );

    const line = screen.getByText(/Met at Siam Paragon/);
    expect(line).toHaveProp("numberOfLines", 1);
    expect(line).not.toHaveTextContent(/Likes jazz/);
    expect(screen.getByText("3 Oct, 14:27")).toBeOnTheScreen();
  });
});

describe("Screen", () => {
  it("UT-CMP-10: the content column is at most 600 wide, centered, and scrolls", async () => {
    await render(
      <Screen>
        <Text>{"Long content ".repeat(400)}</Text>
      </Screen>,
    );

    const column = screen.getByText(/Long content/).parent;
    const style = StyleSheet.flatten(column?.props.style);
    expect(style).toMatchObject({ maxWidth: 600, alignSelf: "center", width: "100%" });
    expect(hostOfType("RCTScrollView")).toBeTruthy();
  });
});

describe("InfoRow", () => {
  it("UT-CMP-11: a 20-character username isn't cut", async () => {
    await render(<InfoRow label="Username" value="abcdefghij0123456789" />);

    const value = screen.getByText("abcdefghij0123456789");
    expect(value).toBeOnTheScreen();
    expect(value.props.numberOfLines).toBeUndefined();
  });
});
