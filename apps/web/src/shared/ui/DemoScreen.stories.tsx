import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { DemoScreen } from "./DemoScreen.tsx";
import { useBi } from "../../test/stories.ts";

const meta = {
  title: "Components/DemoScreen",
  component: DemoScreen,
  args: { title: "" },
  render: function Render(args) {
    const say = useBi();
    return (
      <div className="flex h-[420px] flex-col">
        <DemoScreen {...args} title={say("Approvals", "אישורים")} />
      </div>
    );
  },
} satisfies Meta<typeof DemoScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A tab of the new navigation whose screen is being built: its title and one honest panel. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    await expect(canvas.getByText(/Demo — coming soon|דמו — בקרוב/)).toBeInTheDocument();
  },
};
