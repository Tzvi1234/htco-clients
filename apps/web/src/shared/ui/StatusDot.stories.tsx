import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { StatusDot, StatusLabel, type Status } from "./StatusDot.tsx";
import { useBi } from "../../test/stories.ts";

const WORDS: Record<Status, [string, string]> = {
  running: ["Running", "פועל"],
  "needs-you": ["Needs you", "ממתין לך"],
  waiting: ["Waiting", "ממתין"],
  done: ["Done", "הושלם"],
  failed: ["Failed", "נכשל"],
  offline: ["Offline", "לא מחובר"],
};

const STATUSES = Object.keys(WORDS) as Status[];

const meta = {
  title: "Components/StatusDot",
  component: StatusDot,
  args: { status: "running" },
  render: function Render(args) {
    const say = useBi();
    const [english, hebrew] = WORDS[args.status];
    return <StatusLabel status={args.status}>{say(english, hebrew)}</StatusLabel>;
  },
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Running: Story = {};
export const NeedsYou: Story = { args: { status: "needs-you" } };

/** Every status: a dot plus the word, so colour is never the only signal. */
export const AllStatuses: Story = {
  render: function Render() {
    const say = useBi();
    return (
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {STATUSES.map((status) => (
          <li key={status}>
            <StatusLabel status={status}>{say(...WORDS[status])}</StatusLabel>
          </li>
        ))}
      </ul>
    );
  },
  play: async ({ canvasElement }) => {
    // The dots are decorative; the words carry the status for screen readers.
    const items = within(canvasElement).getAllByRole("listitem");
    await expect(items).toHaveLength(STATUSES.length);
    for (const dot of canvasElement.querySelectorAll("[data-status]")) {
      await expect(dot).toHaveAttribute("aria-hidden", "true");
    }
  },
};
