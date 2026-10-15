import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DemoScreen } from "./DemoScreen.tsx";
import { LocaleProvider } from "../i18n/LocaleProvider.tsx";

describe("DemoScreen", () => {
  it("says plainly that the screen is coming", () => {
    render(
      <LocaleProvider initialLocale="en" storage={undefined}>
        <DemoScreen title="Approvals" />
      </LocaleProvider>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Approvals" })).toBeInTheDocument();
    expect(screen.getByText("Demo — coming soon")).toBeInTheDocument();
  });
});
