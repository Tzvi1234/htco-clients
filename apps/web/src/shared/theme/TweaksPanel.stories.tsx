import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { TweaksProvider } from "./ThemeProvider.tsx";
import { TweaksButton, TweaksPanel } from "./TweaksPanel.tsx";
import { DEFAULT_TWEAKS } from "./tweaks.ts";
import { memoryStorage } from "../lib/storage.ts";

const meta = {
  title: "Components/TweaksPanel",
  component: TweaksPanel,
  decorators: [
    (Story, context) => (
      // The theme comes from the toolbar; every tweak starts at its default.
      <TweaksProvider
        initialTweaks={{
          ...DEFAULT_TWEAKS,
          theme: context.globals["theme"] === "dark" ? "dark" : "light",
        }}
        storage={memoryStorage()}
      >
        <Story />
      </TweaksProvider>
    ),
  ],
} satisfies Meta<typeof TweaksPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const FRAME =
  "w-[304px] rounded-[20px] border border-edge bg-menu px-3.5 pt-3.5 pb-3 shadow-popover";

/** The panel the top bar opens; the landing page shows the same one. */
export const Panel: Story = {
  render: () => (
    <div className={FRAME}>
      <TweaksPanel />
    </div>
  ),
};

/** Design 4 rests contrast and borders, which its palette sets. */
export const DesignFour: Story = {
  render: () => (
    <div className={FRAME}>
      <TweaksPanel />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: /Design 4|עיצוב 4/ }));
    await expect(document.documentElement.dataset["pal"]).toBe("d4");
    await userEvent.click(canvas.getByRole("radio", { name: "SBB" }));
  },
};

/** The top bar's circle button, which opens the panel. */
export const Button: Story = {
  render: () => <TweaksButton />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
    await expect(await within(document.body).findByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
  },
};
