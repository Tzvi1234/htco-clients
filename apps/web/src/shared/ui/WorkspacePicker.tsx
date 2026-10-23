import { useLingui } from "@lingui/react/macro";

import { ChoiceChips } from "./kit/form.tsx";

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
    <ChoiceChips
      label={t`Workspace`}
      value={value}
      onChange={onChange}
      options={ids.map((id) => ({ id, label: id.slice(0, 8), ltr: true }))}
      className="rounded-card border border-border-subtle bg-surface p-4 shadow-1"
    />
  );
}

/** The workspace in use: the only one, or the one the user picked. */
export function pickWorkspace(ids: string[], chosen: string | null): string | undefined {
  if (ids.length === 1) return ids[0];
  return chosen !== null && ids.includes(chosen) ? chosen : undefined;
}
