import { useLingui } from "@lingui/react/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

import { useApi } from "../../shared/api/api.tsx";
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
  const api = useApi();
  const queryClient = useQueryClient();
  const router = useRouter();
  const signOut = useMutation({
    mutationFn: () => api.POST("/v1/auth/sign-out"),
    onSettled: async () => {
      queryClient.clear();
      await router.navigate({ to: "/sign-in" });
    },
  });

  return (
    <MenuTrigger>
      <Button
        aria-label={t`Account and preferences`}
        className="flex h-10 w-full cursor-default items-center justify-center gap-2 rounded-control px-1.5 text-body text-app-muted outline-none data-[hovered]:bg-app-hover data-[hovered]:text-app-text data-[pressed]:bg-app-hover lg:justify-start"
      >
        <span
          aria-hidden="true"
          className="grid size-7 shrink-0 place-items-center rounded-pill bg-presence-iris text-presence-fg"
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
  );
}
