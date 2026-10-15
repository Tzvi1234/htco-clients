import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { Button } from "./Button.tsx";
import { ErrorState } from "./ErrorState.tsx";
import { useBi } from "../../test/stories.ts";

const REQUEST_ID = "req_01JD7Q3V8K2M";

const meta = {
  title: "Components/ErrorState",
  component: ErrorState,
  args: { title: null, description: null },
  render: function Render(args) {
    const say = useBi();
    return (
      <ErrorState
        {...args}
        title={say("Shops could not load", "לא ניתן לטעון את החנויות")}
        description={say(
          "The server did not answer. Try again in a moment.",
          "השרת לא ענה. נסו שוב בעוד רגע.",
        )}
      />
    );
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The request ID to quote to support, kept left-to-right in Hebrew. */
export const WithRequestId: Story = {
  args: { requestId: REQUEST_ID },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toBeInTheDocument();
    const code = canvas.getByText(REQUEST_ID);
    await expect(code.tagName).toBe("BDI");
    await expect(code).toHaveAttribute("dir", "ltr");
  },
};

export const WithRetry: Story = {
  args: { requestId: REQUEST_ID },
  render: function Render(args) {
    const say = useBi();
    return (
      <ErrorState
        {...args}
        title={say("Shops could not load", "לא ניתן לטעון את החנויות")}
        description={say(
          "The server did not answer. Try again in a moment.",
          "השרת לא ענה. נסו שוב בעוד רגע.",
        )}
      >
        <Button variant="primary">{say("Try again", "ניסיון חוזר")}</Button>
      </ErrorState>
    );
  },
};

export const WithoutRequestId: Story = {};
