import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./Button.tsx";
import { DecisionRing } from "./DecisionRing.tsx";
import { StatusLabel } from "./StatusDot.tsx";
import { useBi } from "../../test/stories.ts";

const meta = {
  title: "Components/DecisionRing",
  component: DecisionRing,
  args: { children: null },
  render: function Render(args) {
    const say = useBi();
    return (
      <div className="p-4">
        <DecisionRing {...args}>
          <StatusLabel status="needs-you">
            {say("Refund for order 4821 needs you", "החזר להזמנה 4821 ממתין לך")}
          </StatusLabel>
        </DecisionRing>
      </div>
    );
  },
} satisfies Meta<typeof DecisionRing>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Always beside words that say the owner is needed. */
export const AroundAStatus: Story = {};

export const AroundAnAction: Story = {
  render: function Render(args) {
    const say = useBi();
    return (
      <div className="flex items-center gap-4 p-4">
        <span>{say("Approve the price change?", "לאשר את שינוי המחיר?")}</span>
        <DecisionRing {...args}>
          <Button variant="primary">{say("Review", "בדיקה")}</Button>
        </DecisionRing>
      </div>
    );
  },
};
