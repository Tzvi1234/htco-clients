import { StorefrontIcon as Storefront } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { Button } from "./Button.tsx";
import { PageBody, PageHeader } from "./PageHeader.tsx";
import { ObjectIcon } from "./Tag.tsx";
import { useBi } from "../../test/stories.ts";

const meta = {
  title: "Components/PageHeader",
  component: PageHeader,
  args: { title: null },
  render: function Render(args) {
    const say = useBi();
    return <PageHeader {...args} title={say("Shops", "חנויות")} />;
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {};

/** Icon, the page's only h1, a short description and the page's actions at the end. */
export const Full: Story = {
  render: function Render(args) {
    const say = useBi();
    return (
      <PageHeader
        {...args}
        icon={<ObjectIcon icon={Storefront} />}
        title={say("Shops", "חנויות")}
        description={say("Every connected Etsy shop", "כל חנויות האטסי המחוברות")}
        actions={<Button variant="primary">{say("Connect a shop", "חיבור חנות")}</Button>}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    await expect(canvas.getByRole("button")).toBeInTheDocument();
  },
};

/** The header with the page body under it, as on a page. */
export const WithBody: Story = {
  render: function Render(args) {
    const say = useBi();
    return (
      <>
        <PageHeader {...args} title={say("Overview", "סקירה")} />
        <PageBody>
          <p className="m-0 text-secondary">
            {say("The page's content sits here.", "תוכן הדף נמצא כאן.")}
          </p>
        </PageBody>
      </>
    );
  },
};
