import { useLingui } from "@lingui/react/macro";
import { useRouter } from "@tanstack/react-router";
import { CaretUpDownIcon as CaretUpDown, UserIcon as User } from "@phosphor-icons/react";
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

import { useSignOut } from "../../shared/api/useSignOut.ts";
import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import type { Locale } from "../../shared/i18n/locale.ts";
import { useTheme } from "../../shared/theme/ThemeProvider.tsx";
import type { ThemePreference } from "../../shared/theme/theme.ts";

const ITEM =
  "flex h-8 cursor-default items-center gap-2 rounded-control px-2 text-body outline-none data-[focused]:bg-hover data-[disabled]:text-muted " +
  "before:inline-block before:w-4 before:text-accent-text data-[selected]:before:content-['✓']";
const SECTION_HEADER = "px-2 pt-2 pb-1 text-caption font-medium text-muted";

function selected(keys: Selection): string | undefined {
  if (keys === "all") return undefined;
  const [first] = [...keys];
  return typeof first === "string" ? first : undefined;
}

/** Account menu: language, theme, security and signing out (slice 3.5). */
export function UserMenu() {
  const { t } = useLingui();
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const signOut = useSignOut();

  return (
    <>
      {signOut.isError ? (
        <p
          role="alert"
          className="fixed inset-x-4 top-4 z-30 m-0 rounded-card border border-border-strong bg-raised px-4 py-3 text-body text-primary shadow-3 sm:start-auto sm:end-6 sm:w-96"
        >
          {t`You are still signed in. Try signing out again shortly.`}
        </p>
      ) : null}
      <MenuTrigger>
        <Button
          aria-label={t`Account and preferences`}
          className="flex size-14 cursor-default items-center justify-center gap-2 rounded-pill text-body text-app-muted outline-none data-[hovered]:bg-hover data-[pressed]:bg-hover sm:h-10 sm:w-full sm:rounded-control sm:px-1.5 sm:data-[hovered]:bg-app-hover sm:data-[hovered]:text-app-text sm:data-[pressed]:bg-app-hover lg:justify-start"
        >
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-pill bg-presence-iris text-presence-fg sm:size-7"
          >
            <User size={15} weight="fill" />
          </span>
          <span className="hidden grow text-start font-medium text-app-text lg:block">{t`Account`}</span>
          <CaretUpDown aria-hidden="true" size={14} className="hidden text-app-muted lg:block" />
        </Button>
        <Popover
          placement="top start"
          offset={6}
          className="min-w-60 rounded-card border border-border-strong bg-raised p-1.5 shadow-3 outline-none data-[entering]:animate-enter"
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
            <Separator className="my-1 h-px bg-border-subtle" />
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
            <Separator className="my-1 h-px bg-border-subtle" />
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
