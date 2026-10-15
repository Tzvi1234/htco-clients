import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { DemoScreen } from "./DemoScreen.tsx";
import { Panel, PanelBody, PanelHeader } from "./Panel.tsx";
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

/** The demo layout of a screen, dimmed and out of reach under the DEMO label. */
export const WithDemoContent: Story = {
  render: function Render(args) {
    const say = useBi();
    return (
      <div className="flex h-[420px] flex-col bg-ground p-2">
        <DemoScreen
          {...args}
          title={say("Approvals", "אישורים")}
          className="grid grid-cols-2 gap-2"
        >
          {[say("What needs you", "מה מחכה לך"), say("Today", "היום")].map((name) => (
            <Panel key={name}>
              <PanelHeader title={name} />
              <PanelBody>
                <p className="m-0 text-number-lg font-light">3</p>
              </PanelBody>
            </Panel>
          ))}
        </DemoScreen>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId("demo-content")).toHaveAttribute("inert");
  },
};
