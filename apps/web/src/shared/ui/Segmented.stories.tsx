import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { LevelDots, Segmented } from "./Segmented.tsx";
import { useBi } from "../../test/stories.ts";

const meta = {
  title: "Components/Segmented",
  component: Segmented,
  args: { label: "", value: "", onChange: () => undefined, options: [] },
} satisfies Meta<typeof Segmented>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The top bar's language switch. */
export const Language: Story = {
  render: function Render() {
    const say = useBi();
    const [value, setValue] = useState<"he" | "en">("en");
    return (
      <Segmented
        label={say("Language", "שפה")}
        value={value}
        onChange={setValue}
        options={[
          { id: "he", label: "עברית", lang: "he" },
          { id: "en", label: "English", lang: "en" },
        ]}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const hebrew = within(canvasElement).getByRole("radio", { name: "עברית" });
    await userEvent.click(hebrew);
    await expect(hebrew).toBeChecked();
  },
};

/** A tweak's three levels, shown as dots. */
export const Levels: Story = {
  render: function Render() {
    const say = useBi();
    const [value, setValue] = useState<"1" | "2" | "3">("1");
    const names = [
      say("Normal", "רגיל"),
      say("Different", "שונה"),
      say("Very different", "שונה מאוד"),
    ];
    return (
      <Segmented
        size="sm"
        label={say("Frosted glass", "זכוכית חלבית")}
        value={value}
        onChange={setValue}
        options={(["1", "2", "3"] as const).map((id, index) => ({
          id,
          label: names[index] ?? id,
          content: <LevelDots level={(index + 1) as 1 | 2 | 3} />,
        }))}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const [, , strongest] = within(canvasElement).getAllByRole("radio");
    if (strongest === undefined) throw new Error("three levels");
    await userEvent.click(strongest);
    await expect(strongest).toBeChecked();
  },
};
