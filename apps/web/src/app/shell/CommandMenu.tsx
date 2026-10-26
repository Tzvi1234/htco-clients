import { useLingui } from "@lingui/react/macro";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Autocomplete,
  Collection,
  Dialog,
  Header,
  Input,
  Menu,
  MenuItem,
  MenuSection,
  Modal,
  ModalOverlay,
  SearchField,
  useFilter,
} from "react-aria-components";

import { AREAS } from "./nav.ts";
import { useShell } from "./ShellState.tsx";
import { useNavLabels } from "./useNavLabels.ts";
import { SoonTag } from "../../shared/ui/SoonTag.tsx";
import { SearchGlyph } from "../../shared/ui/kit/index.ts";

interface Destination {
  id: string;
  label: string;
  built: boolean;
}

/**
 * Quick actions (Design 1C `.pal`): Ctrl+K (⌘K on a Mac), the sidebar's pill or the top bar's
 * search open it over a veil of the ground; type to filter every destination, grouped by area.
 */
export function CommandMenu() {
  const { t } = useLingui();
  const labels = useNavLabels();
  const router = useRouter();
  const { contains } = useFilter({ sensitivity: "base" });
  const { paletteOpen: isOpen, setPaletteOpen: setOpen } = useShell();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(!isOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, setOpen]);

  const sections = AREAS.map((area) => ({
    id: area.id,
    name: labels.area(area),
    items: [
      ...(area.tabs.length === 0 ? [{ id: area.to, label: labels.area(area), built: true }] : []),
      ...area.tabs.map((tab): Destination => ({
        id: tab.to,
        label: labels.tab(area.id, tab.id),
        built: tab.built,
      })),
      ...(area.id === "admin"
        ? [{ id: "/settings/security", label: t`Security`, built: true }]
        : []),
    ],
  }));

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={setOpen}
      isDismissable
      className="fixed inset-0 z-overlay flex items-start justify-center bg-[color-mix(in_srgb,var(--bg-ground)_60%,transparent)] px-4 pt-[min(120px,14vh)] data-[entering]:animate-enter data-[exiting]:animate-[htco-enter_var(--motion-duration-fast)_reverse_both]"
    >
      <Modal className="glass w-full max-w-[560px] rounded-panel border border-line bg-menu p-2 shadow-popover outline-none data-[entering]:animate-pop-in">
        <Dialog aria-label={t`Quick actions`} className="outline-none">
          <Autocomplete filter={contains}>
            <SearchField
              aria-label={t`Search actions`}
              autoFocus
              className="mb-2 flex h-12 items-center gap-2.5 rounded-pill border border-line-strong px-4"
            >
              <SearchGlyph size={16} className="text-secondary" />
              <Input
                dir="auto"
                placeholder={t`Search screens and actions…`}
                className="h-full grow bg-transparent text-[15px] text-primary outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
              />
              <kbd className="inline-flex h-[18px] items-center rounded-control border border-line-strong px-[5px] font-latin text-caption text-muted">
                Esc
              </kbd>
            </SearchField>
            <Menu
              items={sections}
              onAction={(key) => {
                setOpen(false);
                if (typeof key === "string") void router.navigate({ to: key });
              }}
              className="max-h-[56vh] overflow-auto outline-none"
              renderEmptyState={() => (
                <p className="m-0 px-4 py-6 text-center text-body-sm text-muted">{t`Nothing matches.`}</p>
              )}
            >
              {(section) => (
                <MenuSection id={section.id}>
                  <Header className="px-4 pt-2 pb-1 text-caption font-light text-muted">
                    {section.name}
                  </Header>
                  <Collection items={section.items}>
                    {(item: Destination) => (
                      <MenuItem
                        id={item.id}
                        textValue={item.label}
                        className="flex h-11 cursor-default items-center justify-between gap-3 rounded-menu-item px-4 text-body-sm text-primary outline-none transition-colors duration-[var(--motion-duration-fast)] data-[focused]:bg-panel"
                      >
                        {item.label}
                        {item.built ? null : <SoonTag className="text-muted" />}
                      </MenuItem>
                    )}
                  </Collection>
                </MenuSection>
              )}
            </Menu>
          </Autocomplete>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
