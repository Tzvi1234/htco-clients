import {
  ShieldCheckIcon as ShieldCheck,
  StorefrontIcon as Storefront,
} from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ObjectIcon, Tag, type Hue } from "./Tag.tsx";
import { useBi } from "../../test/stories.ts";

const HUES: Hue[] = ["iris", "saffron", "coral", "mint", "sky", "rose", "slate"];

const meta = {
  title: "Components/Tag",
  component: Tag,
  args: { hue: "iris", children: null },
  render: function Render(args) {
    const say = useBi();
    return <Tag {...args}>{say("Etsy", "אטסי")}</Tag>;
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDot: Story = { args: { dot: true } };

/** The seven tag hues, each a solid fill with white text. */
export const Hues: Story = {
  render: function Render() {
    const say = useBi();
    return (
      <div className="flex flex-wrap gap-2">
        {HUES.map((hue) => (
          <Tag key={hue} hue={hue} dot>
            {say("Listing", "מודעה")} · {hue}
          </Tag>
        ))}
      </div>
    );
  },
};

/** A record type's icon at 20, 32 and 40 px, always beside the words that name it. */
export const ObjectIcons: Story = {
  render: function Render() {
    const say = useBi();
    return (
      <div className="flex flex-col gap-3">
        {(["sm", "md", "lg"] as const).map((size) => (
          <p key={size} className="m-0 flex items-center gap-2">
            <ObjectIcon icon={size === "md" ? ShieldCheck : Storefront} size={size} />
            {size === "md" ? say("Security", "אבטחה") : say("Shops", "חנויות")}
          </p>
        ))}
      </div>
    );
  },
};
