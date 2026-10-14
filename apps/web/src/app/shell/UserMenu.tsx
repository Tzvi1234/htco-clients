import { useLingui } from "@lingui/react/macro";
import { CircleUser } from "lucide-react";
import {
  Header,
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  Popover,
  Separator,
  type Selection,
} from "react-aria-components";

import { useLocale } from "../../shared/i18n/LocaleProvider.tsx";
import type { Locale } from "../../shared/i18n/locale.ts";
import { useTheme } from "../../shared/theme/ThemeProvider.tsx";
import type { ThemePreference } from "../../shared/theme/theme.ts";
import { IconButton } from "../../shared/ui/IconButton.tsx";

const ITEM =
  "flex h-9 cursor-default items-center gap-2 rounded-control px-2 outline-none data-[focused]:bg-action-secondary-hover data-[disabled]:text-muted " +
  "before:inline-block before:w-4 before:text-accent-text data-[selected]:before:content-['✓']";
const SECTION_HEADER = "px-2 pt-2 pb-1 text-caption font-semibold text-muted";

function selected(keys: Selection): string | undefined {
  if (keys === "all") return undefined;
  const [first] = [...keys];
  return typeof first === "string" ? first : undefined;
}

/** Account menu: language, theme and (from slice 3.5) signing out. */
export function UserMenu() {
  const { t } = useLingui();
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();

  return (
    <MenuTrigger>
      <IconButton
        aria-label={t`Account and preferences`}
        icon={<CircleUser size={22} strokeWidth={1.75} />}
      />
      <Popover
        placement="bottom end"
        className="min-w-56 rounded-card border border-border-strong bg-raised p-1 shadow-2 outline-none"
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
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}
