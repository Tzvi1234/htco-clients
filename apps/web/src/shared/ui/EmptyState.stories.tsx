import { StorefrontIcon as Storefront } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { Button } from "./Button.tsx";
import { EmptyState, StateCard } from "./EmptyState.tsx";
import { useBi } from "../../test/stories.ts";

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  args: { title: null, description: null },
  render: function Render(args) {
    const say = useBi();
    return (
      <EmptyState
        {...args}
        title={say("Connect your first shop", "חברו את החנות הראשונה")}
        description={say(
          "Orders, listings and messages appear here once a shop is connected.",
          "הזמנות, מודעות והודעות יופיעו כאן אחרי חיבור חנות.",
        )}
      />
    );
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The shape of what will appear, the record type's icon, and one action. */
export const WithAction: Story = {
  args: { icon: Storefront },
  render: function Render(args) {
    const say = useBi();
    return (
      <EmptyState
        {...args}
        title={say("Connect your first shop", "חברו את החנות הראשונה")}
        description={say(
          "Orders, listings and messages appear here once a shop is connected.",
          "הזמנות, מודעות והודעות יופיעו כאן אחרי חיבור חנות.",
        )}
      >
        <Button variant="primary">{say("Connect a shop", "חיבור חנות")}</Button>
      </EmptyState>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 2 })).toBeInTheDocument();
    await expect(canvas.getByRole("button")).toBeEnabled();
  },
};

/** Without an action: a plain "not yet". */
export const NoAction: Story = { args: { icon: Storefront } };

/** Inside a table or panel, without a frame of its own. */
export const Bare: Story = { args: { icon: Storefront, bare: true } };

/** The card under every state, without the preview rows (here as a page-level state). */
export const PlainStateCard: Story = {
  render: function Render() {
    const say = useBi();
    return (
      <StateCard
        headingLevel={1}
        title={say("Page not found", "הדף לא נמצא")}
        description={say("The address may be old or mistyped.", "ייתכן שהכתובת ישנה או שגויה.")}
      />
    );
  },
};
