import { Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Label, RadioButton, RadioField, RadioGroup } from "react-aria-components";

import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import { useTheme } from "../../shared/theme/ThemeProvider.tsx";
import {
  CaretRightIcon as CaretRight,
  GearSixIcon as GearSix,
  UsersThreeIcon as UsersThree,
} from "@phosphor-icons/react";

import { meQuery, useApi } from "../../shared/api/api.tsx";

import { PageBody, PageHeader } from "../../shared/ui/PageHeader.tsx";
import { ObjectIcon } from "../../shared/ui/Tag.tsx";

const RADIO =
  "group flex h-9 cursor-default items-center gap-2.5 rounded-control px-2 outline-none transition-colors data-[hovered]:bg-hover data-[selected]:bg-selected";
const MARK =
  "grid size-4 place-items-center rounded-pill border border-border-control bg-surface " +
  "after:size-2 after:rounded-pill group-data-[selected]:border-inverse group-data-[selected]:after:bg-inverse";

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

const CARD = "flex flex-col gap-1 rounded-card border border-border-subtle bg-surface p-3 shadow-1";
const LABEL = "px-2 pb-1 text-body-sm font-medium text-muted";

/** Language and theme for this device (FR-ADM-01). */
export function SettingsPage() {
  const { t } = useLingui();
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const me = useQuery(meQuery(useApi()));
  const managesTeam =
    me.data?.memberships.some((m) => m.role === "owner" || m.role === "admin") ?? false;

  return (
    <>
      <PageHeader
        title={<Trans>Settings</Trans>}
        description={<Trans>These preferences are remembered on this device.</Trans>}
        icon={<ObjectIcon hue="slate" icon={GearSix} />}
      />
      <PageBody>
        {managesTeam ? (
          <Link
            to="/settings/team"
            className="flex max-w-[720px] items-center gap-3 rounded-card border border-border-subtle bg-surface p-4 text-primary no-underline shadow-1 transition-colors hover:bg-hover"
          >
            <ObjectIcon size="md" icon={UsersThree} />
            <span className="flex min-w-0 grow flex-col">
              <span className="font-semibold">
                <Trans>Team</Trans>
              </span>
              <span className="text-body-sm text-secondary">
                <Trans>Invite people and choose what they can do.</Trans>
              </span>
            </span>
            <CaretRight
              aria-hidden="true"
              size={14}
              weight="bold"
              className="text-icon rtl:-scale-x-100"
            />
          </Link>
        ) : null}
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
      </PageBody>
    </>
  );
}
