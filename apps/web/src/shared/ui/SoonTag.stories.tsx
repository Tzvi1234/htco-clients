import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { DemoBadge, SoonTag } from "./SoonTag.tsx";
import { useBi } from "../../test/stories.ts";

const meta = {
  title: "Components/SoonTag",
  component: SoonTag,
} satisfies Meta<typeof SoonTag>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Beside a navigation item whose screen is not built yet. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/Soon|בקרוב/)).toBeInTheDocument();
  },
};

/** On a plain row and on the current item's inverse pill: it takes the item's colour. */
export const InNavigation: Story = {
  render: function Render() {
    const say = useBi();
    return (
      <ul className="m-0 flex w-60 list-none flex-col gap-1 p-0">
        <li className="flex h-[34px] items-center gap-2 rounded-pill px-3 text-body-sm text-secondary">
          {say("Approvals", "אישורים")} <SoonTag className="ms-auto" />
        </li>
        <li className="flex h-[34px] items-center gap-2 rounded-pill bg-inverse px-3 text-body-sm text-on-inverse">
          {say("Tasks", "משימות")} <SoonTag className="ms-auto" />
          <span aria-hidden="true" className="size-1.5 rounded-pill bg-accent-on-inverse" />
        </li>
      </ul>
    );
  },
};

/** The mark on a screen that shows only the design so far. */
export const Demo: Story = { render: () => <DemoBadge /> };
