import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button, type ButtonSize, type ButtonVariant } from "./Button.tsx";
import { expectFocusRing, useBi } from "../../test/stories.ts";

const meta = {
  title: "Components/Button",
  component: Button,
  args: { onPress: fn(), variant: "secondary", size: "md" },
  render: function Render(args) {
    const say = useBi();
    return <Button {...args}>{say("Approve fix", "אישור התיקון")}</Button>;
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = {};
export const Ghost: Story = { args: { variant: "ghost" } };
export const Danger: Story = { args: { variant: "danger" } };
export const Disabled: Story = { args: { variant: "primary", isDisabled: true } };
export const Pending: Story = { args: { variant: "primary", isPending: true } };

const VARIANTS: ButtonVariant[] = ["primary", "secondary", "ghost", "danger"];
const SIZES: ButtonSize[] = ["sm", "md", "lg"];

/** Every variant at 28, 32 and 40 px. */
export const Sizes: Story = {
  render: function Render(args) {
    const say = useBi();
    return (
      <div className="flex flex-col gap-3">
        {SIZES.map((size) => (
          <div key={size} className="flex items-center gap-3">
            {VARIANTS.map((variant) => (
              <Button key={variant} {...args} variant={variant} size={size}>
                {say("Save", "שמירה")}
              </Button>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

/** AC-3.4.2: reached with Tab, shows the focus ring, and Enter and Space press it. */
export const Keyboard: Story = {
  args: { variant: "primary" },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button");

    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expectFocusRing(button);

    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    await expect(args.onPress).toHaveBeenCalledTimes(2);
  },
};

/** A disabled button is skipped by Tab and cannot be pressed. */
export const KeyboardDisabled: Story = {
  args: { variant: "primary", isDisabled: true },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button");

    await userEvent.tab();
    await expect(button).not.toHaveFocus();
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};
