import { useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import {
  Button,
  Header,
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  Popover,
  Separator,
  type Selection,
} from "react-aria-components";

import { useRoleLabel } from "../../features/team/TeamPage.tsx";
import { meQuery, useApi } from "../../shared/api/api.tsx";
import { useSignOut } from "../../shared/api/useSignOut.ts";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import type { Locale } from "../../shared/i18n/locale.ts";
import { cx } from "../../shared/lib/cx.ts";
import { useTheme } from "../../shared/theme/ThemeProvider.tsx";
import type { ThemePreference } from "../../shared/theme/theme.ts";
import { ChevronIcon } from "../../shared/ui/icons.tsx";

const ITEM =
  "flex h-9 cursor-default items-center gap-2 rounded-[12px] px-3 text-body-sm outline-none transition-colors duration-[var(--motion-duration-fast)] data-[focused]:bg-panel data-[disabled]:text-muted " +
  "before:inline-block before:w-4 before:text-accent-text data-[selected]:before:content-['✓']";
const SECTION_HEADER = "px-3 pt-2 pb-1 text-caption font-light text-muted";

function selected(keys: Selection): string | undefined {
  if (keys === "all") return undefined;
  const [first] = [...keys];
  return typeof first === "string" ? first : undefined;
}

/**
 * The role the account card can show: the one role every workspace gives, or "several" when
 * they differ (the card is not tied to a workspace), or none before the account is known.
 */
export function accountRole(memberships: readonly { role: string }[]): string | undefined {
  const roles = new Set(memberships.map(({ role }) => role));
  if (roles.size === 0) return undefined;
  return roles.size === 1 ? [...roles][0] : "several";
}

/** The owner's avatar: an ink circle with the account glyph's initial. */
function Avatar({ initial }: { initial: string }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-10 shrink-0 place-items-center rounded-pill bg-inverse text-[15px] text-on-inverse"
    >
      {initial}
    </span>
  );
}

/**
 * The owner's card at the foot of the sidebar (Design 1C `.own`), or the avatar in the phone's
 * top bar: the account menu with language, theme, security and signing out (slice 3.5).
 */
export function UserMenu({ compact = false }: { compact?: boolean }) {
  const { t } = useLingui();
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const signOut = useSignOut();
  const me = useQuery(meQuery(useApi()));
  const roleLabel = useRoleLabel();
  const role = accountRole(me.data?.memberships ?? []);
  const name = t`Account`;
  const initial = name.slice(0, 1);

  return (
    <>
      {signOut.isError ? (
        <p
          role="alert"
          className="fixed inset-x-4 top-4 z-30 m-0 rounded-card border border-line bg-menu px-4 py-3 text-body text-primary shadow-popover sm:inset-s-auto sm:inset-e-6 sm:w-96"
        >
          {t`You are still signed in. Try signing out again shortly.`}
        </p>
      ) : null}
      <MenuTrigger>
        <Button
          aria-label={t`Account and preferences`}
          className={cx(
            "flex cursor-default items-center gap-3 rounded-[24px] text-start whitespace-nowrap text-primary outline-none",
            "transition-[background-color,scale] duration-[var(--motion-duration-fast)] ease-standard data-[hovered]:bg-hover data-[pressed]:scale-[0.98]",
            compact
              ? "rounded-pill"
              : "w-full p-1 group-data-[mini]/sb:justify-center group-data-[mini]/sb:p-0",
          )}
        >
          <Avatar initial={initial} />
          {compact ? null : (
            <>
              <span className="min-w-0 grow group-data-[mini]/sb:hidden">
                <span className="block truncate text-body leading-tight">{name}</span>
                <span className="block truncate text-caption font-light text-muted">
                  {role === undefined
                    ? " "
                    : role === "several"
                      ? t`Several workspaces`
                      : roleLabel(role)}
                </span>
              </span>
              <ChevronIcon
                size={12}
                className="shrink-0 text-secondary group-data-[mini]/sb:hidden"
              />
            </>
          )}
        </Button>
        <Popover
          placement={compact ? "bottom end" : "top start"}
          offset={8}
          className="w-[220px] rounded-card border border-line bg-menu p-2 text-primary shadow-popover outline-none backdrop-blur-[22px] data-[entering]:animate-pop-in"
        >
          <Menu className="outline-none">
            <MenuSection
              selectionMode="single"
              selectedKeys={[locale]}
              onSelectionChange={(keys) => {
                const next = selected(keys);
                if (next === "en" || next === "he") setLocale(next satisfies Locale);
              }}
            >
              <Header className={SECTION_HEADER}>{t`Language`}</Header>
              <MenuItem id="en" className={ITEM} textValue="English">
                <span lang="en">English</span>
              </MenuItem>
              <MenuItem id="he" className={ITEM} textValue="עברית">
                <span lang="he">עברית</span>
              </MenuItem>
            </MenuSection>
            <Separator className="my-1 h-px bg-line" />
            <MenuSection
              selectionMode="single"
              selectedKeys={[theme]}
              onSelectionChange={(keys) => {
                const next = selected(keys);
                if (next === "system" || next === "light" || next === "dark")
                  setTheme(next satisfies ThemePreference);
              }}
            >
              <Header className={SECTION_HEADER}>{t`Theme`}</Header>
              <MenuItem id="system" className={ITEM}>
                {t`Match the system`}
              </MenuItem>
              <MenuItem id="light" className={ITEM}>
                {t`Light`}
              </MenuItem>
              <MenuItem id="dark" className={ITEM}>
                {t`Dark`}
              </MenuItem>
            </MenuSection>
            <Separator className="my-1 h-px bg-line" />
            <MenuItem className={ITEM} onAction={() => void router.navigate({ to: "/settings" })}>
              {t`Settings`}
            </MenuItem>
            <MenuItem
              className={ITEM}
              onAction={() => void router.navigate({ to: "/settings/security" })}
            >
              {t`Security`}
            </MenuItem>
            <MenuItem
              className={ITEM}
              onAction={() => {
                signOut.mutate();
              }}
            >
              {t`Sign out`}
            </MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>
    </>
  );
}
