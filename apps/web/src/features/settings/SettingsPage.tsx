import { Trans, useLingui } from "@lingui/react/macro";
import type { ReactNode } from "react";
import { Label, RadioButton, RadioField, RadioGroup } from "react-aria-components";

import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { useTheme } from "../../shared/theme/ThemeProvider.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";

const RADIO =
  "group flex h-10 cursor-default items-center gap-3 rounded-control px-2 data-[hovered]:bg-action-secondary-hover";
const MARK =
  "grid size-5 place-items-center rounded-pill border border-border-control bg-surface " +
  "after:size-2.5 after:rounded-pill group-data-[selected]:border-accent-text group-data-[selected]:after:bg-accent-text";

function Option({ value, children }: { value: string; children: ReactNode }) {
  return (
    <RadioField value={value}>
      <RadioButton className={RADIO}>
        <span aria-hidden="true" className={MARK} />
        {children}
      </RadioButton>
    </RadioField>
  );
}

const CARD = "flex flex-col gap-2 rounded-card border border-border-subtle bg-surface p-4";
const LABEL = "text-body font-semibold";

/** Language and theme for this device (FR-ADM-01). */
export function SettingsPage() {
  const { t } = useLingui();
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();

  return (
    <>
      <PageHeader
        title={<Trans>Settings</Trans>}
        description={<Trans>These preferences are remembered on this device.</Trans>}
      />
      <div className="grid max-w-[720px] gap-4 md:grid-cols-2">
        <RadioGroup
          className={CARD}
          value={locale}
          onChange={(value) => {
            if (value === "en" || value === "he") setLocale(value);
          }}
        >
          <Label className={LABEL}>{t`Language`}</Label>
          <Option value="en">
            <span lang="en">English</span>
          </Option>
          <Option value="he">
            <span lang="he">עברית</span>
          </Option>
        </RadioGroup>
        <RadioGroup
          className={CARD}
          value={theme}
          onChange={(value) => {
            if (value === "system" || value === "light" || value === "dark") setTheme(value);
          }}
        >
          <Label className={LABEL}>{t`Theme`}</Label>
          <Option value="system">{t`Match the system`}</Option>
          <Option value="light">{t`Light`}</Option>
          <Option value="dark">{t`Dark`}</Option>
        </RadioGroup>
      </div>
    </>
  );
}
