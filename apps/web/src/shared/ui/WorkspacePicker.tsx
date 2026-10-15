import { useLingui } from "@lingui/react/macro";
import { Label, RadioButton, RadioField, RadioGroup } from "react-aria-components";

export const CHIP =
  "flex h-8 cursor-default items-center rounded-pill border border-border-subtle px-3 text-body-sm font-medium outline-none transition-colors data-[focus-visible]:ring-2 data-[focus-visible]:ring-focus data-[hovered]:bg-hover data-[selected]:border-transparent data-[selected]:bg-app data-[selected]:text-app-text";

/**
 * Which workspace a page works on, for a user in several. One workspace needs no question; with
 * several the user picks explicitly, never the first by accident.
 */
export function WorkspacePicker({
  ids,
  value,
  onChange,
}: {
  ids: string[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  const { t } = useLingui();
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      className="flex flex-col gap-2 rounded-card border border-border-subtle bg-surface p-4 shadow-1"
    >
      <Label className="text-body-sm font-medium text-secondary">{t`Workspace`}</Label>
      <div className="flex flex-wrap gap-2">
        {ids.map((id) => (
          <RadioField key={id} value={id}>
            <RadioButton className={CHIP}>
              <span dir="ltr" className="font-mono">
                {id.slice(0, 8)}
              </span>
            </RadioButton>
          </RadioField>
        ))}
      </div>
    </RadioGroup>
  );
}

/** The workspace in use: the only one, or the one the user picked. */
export function pickWorkspace(ids: string[], chosen: string | null): string | undefined {
  if (ids.length === 1) return ids[0];
  return chosen !== null && ids.includes(chosen) ? chosen : undefined;
}
