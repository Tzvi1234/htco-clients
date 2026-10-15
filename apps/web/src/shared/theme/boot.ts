// The inline script index.html runs before the first paint, so a remembered palette, theme or
// tweak never flashes the defaults. It mirrors readTweaks and applyTweaks (tweaks.ts); the boot
// test runs both on the same stored values. The Vite config injects it into the page and the
// Content Security Policy allows it by its hash (security/csp.ts), so keep it free of anything
// that changes between builds.
export const TWEAKS_BOOT_SCRIPT = `(function () {
  var root = document.documentElement;
  var get = function (key) {
    try {
      return window.localStorage.getItem("htco." + key);
    } catch (error) {
      return null;
    }
  };
  var pick = function (value, allowed, fallback) {
    return allowed.indexOf(value) === -1 ? fallback : value;
  };
  var levels = ["1", "2", "3"];
  var theme = pick(get("theme"), ["light", "dark"], "");
  if (theme) root.setAttribute("data-theme", theme);
  else root.removeAttribute("data-theme");
  root.setAttribute("data-pal", pick(get("palette"), ["sbb", "d4", "plain"], "sbb"));
  root.setAttribute("data-t1", pick(get("contrast"), levels, "1"));
  root.setAttribute("data-t2", pick(get("glass"), levels, "1"));
  root.setAttribute("data-t3", pick(get("borders"), levels, "1"));
})();`;
