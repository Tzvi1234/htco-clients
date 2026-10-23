import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { TextField, type TextFieldProps } from "./TextField.tsx";
import { focusColour, transitionsEnded, useBi } from "../../test/stories.ts";
import { LockGlyph, MailGlyph } from "./kit/index.ts";

type Sample = Partial<Record<"label" | "description" | "errorMessage" | "placeholder", string>>;
type SampleText = (say: ReturnType<typeof useBi>) => Sample;

/** The field with its label, hint and error in the story's language. */
function Field({ text, ...props }: Omit<TextFieldProps, "label"> & { text: SampleText }) {
  const say = useBi();
  const { label = say("Shop name", "שם החנות"), ...rest } = text(say);
  return <TextField {...props} {...rest} label={label} />;
}

const defaultText: SampleText = () => ({});

const meta = {
  title: "Components/TextField",
  component: Field,
  args: { onChange: fn(), text: defaultText },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: {
    text: (say) => ({
      description: say("Shown to buyers on receipts.", "מוצג לקונים בקבלות."),
    }),
  },
};

export const Invalid: Story = {
  args: {
    defaultValue: "x",
    text: (say) => ({ errorMessage: say("Use at least 3 characters.", "יש להזין לפחות 3 תווים.") }),
  },
};

export const Disabled: Story = { args: { isDisabled: true, defaultValue: "Ceramics by Noa" } };

/** Sign-in size (44 px) with a leading icon; email stays left-to-right on Hebrew pages. */
export const LargeWithIcon: Story = {
  args: {
    size: "lg",
    type: "email",
    ltr: true,
    icon: MailGlyph,
    text: (say) => ({ label: say("Email", "אימייל"), placeholder: "name@example.com" }),
  },
};

export const Password: Story = {
  args: {
    size: "lg",
    type: "password",
    icon: LockGlyph,
    defaultValue: "correct horse",
    text: (say) => ({ label: say("Password", "סיסמה") }),
  },
};

/** AC-3.4.2: Tab reaches the input, the field shows its focus ring, and typing fills it. */
export const Keyboard: Story = {
  play: async ({ args, canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox");
    const frame = input.parentElement;
    if (frame === null) throw new Error("the input has no frame");

    await userEvent.tab();
    await expect(input).toHaveFocus();
    await expect(frame).toHaveAttribute("data-focus-within", "true");
    const style = getComputedStyle(frame);
    await transitionsEnded(frame);
    await expect(style.borderTopColor).toBe(focusColour());
    await expect(style.boxShadow).not.toBe("none");

    await userEvent.keyboard("Ceramics");
    await expect(input).toHaveValue("Ceramics");
    await expect(args.onChange).toHaveBeenLastCalledWith("Ceramics");
  },
};

/** The error is announced with the field: invalid state and a described-by message. */
export const InvalidIsAnnounced: Story = {
  args: { ...Invalid.args },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription(/3/);
  },
};
