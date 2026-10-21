import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./Button.tsx";
import { Panel, PanelBody, PanelHeader } from "./Panel.tsx";
import { useBi } from "../../test/stories.ts";

const meta = {
  title: "Components/Panel",
  component: Panel,
  args: { children: null },
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The floating surface screens are built from: a small header, its meta, and a body. */
export const Default: Story = {
  render: function Render() {
    const say = useBi();
    return (
      <div className="bg-ground p-2">
        <Panel className="h-56 w-[420px]">
          <PanelHeader
            title={say("What needs you", "מה מחכה לך")}
            meta={say("3 waiting", "3 ממתינים")}
            actions={<Button size="sm">{say("Open", "פתיחה")}</Button>}
          />
          <PanelBody>
            <p className="m-0 text-body-sm text-secondary">
              {say(
                "Panels sit on the ground with 8 px between them.",
                "הפאנלים יושבים על הרקע ו־8 פיקסלים ביניהם.",
              )}
            </p>
          </PanelBody>
        </Panel>
      </div>
    );
  },
};
