import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Banner } from "./Banner.tsx";
import { Button } from "./Button.tsx";
import { expectFocusRing, useBi } from "../../test/stories.ts";

const meta = {
  title: "Components/Banner",
  component: Banner,
  args: { children: null },
  render: function Render(args) {
    const say = useBi();
    return (
      <Banner {...args}>
        {say(
          "You are offline. Changes will be sent when you reconnect.",
          "אין חיבור לרשת. השינויים יישלחו כשהחיבור יחזור.",
        )}
      </Banner>
    );
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Offline: Story = {};

const retry = fn();

/** A stale-data banner with its one action, which the keyboard reaches. */
export const WithAction: Story = {
  render: function Render(args) {
    const say = useBi();
    return (
      <Banner
        {...args}
        action={
          <Button size="sm" variant="secondary" onPress={retry}>
            {say("Retry", "ניסיון חוזר")}
          </Button>
        }
      >
        {say("Shown data is 2 hours old.", "הנתונים המוצגים מלפני שעתיים.")}
      </Banner>
    );
  },
  play: async ({ canvasElement }) => {
    retry.mockClear();
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toBeInTheDocument();

    const button = canvas.getByRole("button");
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expectFocusRing(button);
    await userEvent.keyboard("{Enter}");
    await expect(retry).toHaveBeenCalledOnce();
  },
};
