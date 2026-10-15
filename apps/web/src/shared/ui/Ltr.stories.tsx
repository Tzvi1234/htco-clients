import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { Ltr } from "./Ltr.tsx";
import { useBi } from "../../test/stories.ts";

// A tracking number that starts with digits and ends in letters: without isolation, the bidi
// algorithm moves its groups around inside a Hebrew sentence.
const TRACKING = "2024-0042-IL";

/** The horizontal position of each character of the element's text, in reading order. */
function characterPositions(element: HTMLElement): number[] {
  const text = element.firstChild;
  if (text?.nodeType !== Node.TEXT_NODE) throw new Error("expected plain text");
  const range = document.createRange();
  return Array.from(text.textContent ?? "", (_, index) => {
    range.setStart(text, index);
    range.setEnd(text, index + 1);
    return range.getBoundingClientRect().left;
  });
}

function isLeftToRight(positions: number[]): boolean {
  return positions.every((x, index) => index === 0 || x > (positions[index - 1] ?? x));
}

const meta = {
  title: "Components/Ltr",
  component: Ltr,
  args: { children: TRACKING },
  render: function Render(args) {
    const say = useBi();
    return (
      <p className="m-0">
        {say("Tracking number", "מספר מעקב")} <Ltr {...args} />{" "}
        {say("is on its way.", "בדרך אליך.")}
      </p>
    );
  },
} satisfies Meta<typeof Ltr>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InASentence: Story = {};

/** Isolated, but in the sentence's own font (for amounts and names rather than codes). */
export const NotMonospaced: Story = { args: { mono: false } };

/**
 * AC-3.4.4: inside Hebrew (right-to-left) text, the tracking number keeps its left-to-right
 * order, and the sentence around it still reads right to left. The same number without `Ltr`
 * is reordered, which proves the check can fail.
 */
export const TrackingNumberInHebrew: Story = {
  globals: { locale: "he" },
  render: function Render(args) {
    return (
      <div className="flex flex-col gap-3">
        <p className="m-0" data-testid="isolated">
          <span>המשלוח</span> <Ltr {...args} /> <span>יצא לדרך</span>
        </p>
        <p className="m-0" aria-hidden="true" data-testid="unisolated">
          המשלוח <span>{TRACKING}</span> יצא לדרך
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await expect(document.documentElement).toHaveAttribute("dir", "rtl");
    const canvas = within(canvasElement);
    const isolated = canvas.getByTestId("isolated");
    const code = within(isolated).getByText(TRACKING);

    await expect(isLeftToRight(characterPositions(code))).toBe(true);
    // Right to left around it: the first Hebrew word is to the right of the code.
    const before = within(isolated).getByText("המשלוח").getBoundingClientRect();
    const after = within(isolated).getByText("יצא לדרך").getBoundingClientRect();
    const box = code.getBoundingClientRect();
    await expect(before.left).toBeGreaterThanOrEqual(box.right);
    await expect(after.right).toBeLessThanOrEqual(box.left);

    const unisolated = canvas.getByTestId("unisolated").querySelector("span");
    if (unisolated === null) throw new Error("missing control");
    await expect(isLeftToRight(characterPositions(unisolated))).toBe(false);
  },
};
