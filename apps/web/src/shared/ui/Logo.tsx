import logoUrl from "../../../../../assets/brand/HTCO_Official_Logo.png";

/**
 * The official logo, unmodified, on its own navy ground (design/README.md, "The logo"):
 * at least 96 px wide, with clear space around it.
 */
export function Logo({ width = 96 }: { width?: number }) {
  return (
    <span className="inline-flex rounded-button bg-brand p-2">
      <img src={logoUrl} alt="HTCO" width={width} className="block h-auto" />
    </span>
  );
}
