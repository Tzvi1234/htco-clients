import { useLingui } from "@lingui/react/macro";
import { useRouter } from "@tanstack/react-router";
import {
  GearSixIcon as GearSix,
  HouseIcon as House,
  MagnifyingGlassIcon as MagnifyingGlass,
  ShieldCheckIcon as ShieldCheck,
  StorefrontIcon as Storefront,
  type Icon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  Dialog,
  Input,
  Menu,
  MenuItem,
  Modal,
  ModalOverlay,
  SearchField,
  useFilter,
} from "react-aria-components";

type Destination = "/" | "/shops" | "/settings" | "/settings/security";

interface Action {
  id: Destination;
  label: string;
  icon: Icon;
}

/** Ctrl+K (⌘K on a Mac) or the sidebar button: jump anywhere by typing (Attio's quick actions). */
export function CommandMenu() {
  const { t } = useLingui();
  const router = useRouter();
  const { contains } = useFilter({ sensitivity: "base" });
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const actions: Action[] = [
    { id: "/", label: t`Go to the overview`, icon: House },
    { id: "/shops", label: t`Go to shops`, icon: Storefront },
    { id: "/settings", label: t`Go to settings`, icon: GearSix },
    { id: "/settings/security", label: t`Go to security`, icon: ShieldCheck },
  ];

  return (
    <>
      <Button
        onPress={() => {
          setOpen(true);
        }}
        className="flex h-8 w-full cursor-default items-center gap-2 rounded-control border border-border-strong bg-surface px-2 text-body-sm text-secondary shadow-1 outline-none data-[hovered]:bg-hover max-lg:size-8 max-lg:justify-center max-lg:px-0"
        aria-label={t`Quick actions`}
      >
        <MagnifyingGlass aria-hidden="true" size={15} weight="duotone" />
        <span className="grow text-start max-lg:hidden">{t`Quick actions`}</span>
        <kbd className="rounded-tag border border-border-strong px-1 font-latin text-caption text-muted max-lg:hidden">
          Ctrl K
        </kbd>
      </Button>
      <ModalOverlay
        isOpen={isOpen}
        onOpenChange={setOpen}
        isDismissable
        className="fixed inset-0 z-50 flex items-start justify-center bg-[color-mix(in_srgb,var(--illustration-ink)_35%,transparent)] px-4 pt-[14vh] data-[entering]:animate-enter"
      >
        <Modal className="w-full max-w-[560px] rounded-dialog border border-border-strong bg-raised shadow-3 outline-none data-[entering]:animate-enter">
          <Dialog aria-label={t`Quick actions`} className="outline-none">
            <Autocomplete filter={contains}>
              <SearchField
                aria-label={t`Search actions`}
                autoFocus
                className="flex items-center gap-2 border-b border-border-subtle px-3"
              >
                <MagnifyingGlass
                  aria-hidden="true"
                  size={16}
                  weight="duotone"
                  className="text-icon"
                />
                <Input
                  placeholder={t`Type a command or a page`}
                  className="h-12 grow bg-transparent text-body text-primary outline-none placeholder:text-muted"
                />
              </SearchField>
              <Menu
                items={actions}
                onAction={(key) => {
                  const action = actions.find(({ id }) => id === key);
                  setOpen(false);
                  if (action !== undefined) void router.navigate({ to: action.id });
                }}
                className="max-h-[50vh] overflow-auto p-1.5 outline-none"
                renderEmptyState={() => (
                  <p className="m-0 px-3 py-6 text-center text-body-sm text-muted">{t`Nothing matches.`}</p>
                )}
              >
                {(action) => (
                  <MenuItem
                    id={action.id}
                    textValue={action.label}
                    className="flex h-9 cursor-default items-center gap-2.5 rounded-control px-2.5 text-body text-primary outline-none data-[focused]:bg-selected"
                  >
                    <action.icon
                      aria-hidden="true"
                      size={16}
                      weight="duotone"
                      className="text-icon"
                    />
                    {action.label}
                  </MenuItem>
                )}
              </Menu>
            </Autocomplete>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
