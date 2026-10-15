import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { DemoFrame, DemoPart, IdBlock, KV, N } from "./index.ts";
import { useBi } from "../../../test/stories.ts";
import { Panel, PanelBody, PanelHeader } from "../Panel.tsx";

const meta = {
  title: "Components/DemoFrame",
  component: DemoFrame,
  args: { children: null },
} satisfies Meta<typeof DemoFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A screen that is designed but not built: its panels dimmed and out of reach, under DEMO. */
export const Frame: Story = {
  render: function Render() {
    const say = useBi();
    return (
      <div className="flex h-[420px] flex-col bg-ground p-2">
        <DemoFrame title={say("Approvals", "אישורים")} layout="l2">
          {[say("What needs you", "מה מחכה לך"), say("Today", "היום")].map((name) => (
            <Panel key={name}>
              <PanelHeader title={name} />
              <PanelBody>
                <p className="m-0 text-number-lg font-light">3</p>
              </PanelBody>
            </Panel>
          ))}
        </DemoFrame>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("demo-content")).toHaveAttribute("inert");
    await expect(canvas.getByRole("note")).toBeInTheDocument();
  },
};

/** A planned part of a real screen: the same design, dimmed, with a small Demo tag. */
export const Part: Story = {
  render: function Render() {
    const say = useBi();
    return (
      <div className="flex h-[360px] w-[320px] flex-col bg-ground p-2">
        <Panel>
          <PanelHeader title="Etsy" />
          <PanelBody className="justify-between gap-6">
            <IdBlock label={say("Shop:", "חנות:")} value={<N>HTZ Prints</N>} />
            <DemoPart tag="edge">
              <KV
                items={[
                  [say("Orders today", "הזמנות היום"), <N key="o">23</N>],
                  [say("Revenue today", "הכנסות היום"), <N key="r">$842</N>],
                ]}
              />
            </DemoPart>
          </PanelBody>
        </Panel>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[data-demo-part] [inert]")).not.toBeNull();
  },
};
