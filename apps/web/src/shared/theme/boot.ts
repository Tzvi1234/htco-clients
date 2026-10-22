// The inline script index.html runs before the first paint, so a remembered palette or theme
// never flashes the defaults. It mirrors readTweaks and applyTweaks (tweaks.ts), including the
// round 3 migration's reading of a stored "plain" palette as "sbb"; the boot test runs both on
// the same stored values. It only reads: the app itself rewrites old values
// (migrateAppearance). The Vite config injects it into the page and the Content Security Policy
// allows it by its hash (security/csp.ts), so keep it free of anything that changes between
// builds.
export const TWEAKS_BOOT_SCRIPT = `(function () {
  var root = document.documentElement;
  var get = function (key) {
    try {
      return window.localStorage.getItem("htco." + key);
    } catch (error) {
      return null;
    }
  };
  var theme = get("theme");
  if (theme === "light" || theme === "dark") root.setAttribute("data-theme", theme);
  else root.removeAttribute("data-theme");
  root.setAttribute("data-pal", get("palette") === "d4" ? "d4" : "sbb");
  var solid = false;
  try {
    solid = window.matchMedia("(prefers-reduced-transparency: reduce)").matches;
  } catch (error) {
    solid = false;
  }
  if (solid) root.setAttribute("data-solid", "");
  else root.removeAttribute("data-solid");
})();`;
