import { BellIcon as Bell } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { IconButton } from "./IconButton.tsx";
import { expectFocusRing, useBi } from "../../test/stories.ts";

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  args: { onPress: fn(), "aria-label": "Notifications", icon: null },
  render: function Render(args) {
    const say = useBi();
    return (
      <IconButton
        {...args}
        aria-label={say("Notifications", "התראות")}
        icon={<Bell aria-hidden="true" size={18} weight="duotone" />}
      />
    );
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
/** The saffron dot: something here waits for the user. */
export const NeedsYou: Story = { args: { needsYou: true } };
export const Disabled: Story = { args: { isDisabled: true } };

/** AC-3.4.2: named for screen readers, reached with Tab, ring visible, Enter and Space press it. */
export const Keyboard: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: /Notifications|התראות/ });

    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expectFocusRing(button);

    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect(args.onPress).toHaveBeenCalledTimes(2);
  },
};
