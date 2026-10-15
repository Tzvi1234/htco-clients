import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { Logo } from "./Logo.tsx";

const meta = {
  title: "Components/Logo",
  component: Logo,
  args: { variant: "full", height: 40 },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Full: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("img", { name: "HTCO" })).toBeInTheDocument();
  },
};

/** The "CO." mark for small places. */
export const Mark: Story = { args: { variant: "mark" } };

/** On the inverse (ink) fill. */
export const Inverse: Story = {
  args: { inverse: true },
  decorators: [
    (Story) => (
      <div className="inline-block rounded-card bg-inverse p-4">
        <Story />
      </div>
    ),
  ],
};
