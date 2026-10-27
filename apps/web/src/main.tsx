import "@fontsource-variable/heebo";
import "@fontsource-variable/outfit";
import "@fontsource-variable/jetbrains-mono";
import "./styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/App.tsx";
import { refuseFraming } from "./shared/security/framing.ts";
import { initialLocale } from "./shared/i18n/locale.ts";
import { deviceStorage } from "./shared/lib/storage.ts";
import { initialTheme } from "./shared/theme/theme.ts";

const container = document.getElementById("root");
if (container === null) throw new Error("index.html has no #root element");

const storage = deviceStorage();

// Development only: `?demo` (signed in), `?demo=shops` (signed in, with shops in each connection
// state), `?demo=mfa` (the authenticator code step), `?demo=history` (orders all older than 30 days), `?demo=no-workspace` or `?demo=signed-out` runs the app on the in-memory API used by the tests, to review
// screens without a local API. Connecting a shop asks for the code 123456 and comes straight back
// to the Etsy callback. Production builds drop this branch.
const demo = import.meta.env.DEV ? new URLSearchParams(window.location.search).get("demo") : null;
const api =
  demo === null
    ? undefined
    : await (async () => {
        const { demoShops, fakeBackend } = await import("./test/fakeApi.ts");
        const { demoIncidents, demoNotifications } = await import("./test/fakeIncidents.ts");
        const { demoActivity } = await import("./test/fakeActivity.ts");
        if (demo === "signed-out") return fakeBackend().client;
        // Signed in with a password only: the authenticator code step.
        if (demo === "mfa")
          return fakeBackend({ signedIn: true, enrolled: true, assurance: "aal1" }).client;
        if (demo === "no-workspace") return fakeBackend({ signedIn: true, member: false }).client;
        return fakeBackend({
          signedIn: true,
          enrolled: true,
          assurance: "aal2",
          authorizationUrl: `/integrations/etsy/callback?code=demo-code&state=demo-state&demo=${demo}`,
          ...(demo === "shops" || demo === "history"
            ? (() => {
                const shops = demoShops();
                // The incident center and the bell: three open incidents, one resolved.
                const ids = shops.shops.map((shop) => shop.id);
                return {
                  ...shops,
                  incidents: demoIncidents(ids),
                  notifications: demoNotifications(ids),
                  // Work › Activity: today's records and one task's trail (slice 7.8).
                  activity: demoActivity(ids[0]),
                };
              })()
            : {}),
          // `?demo=shops`: the orders come from the stored history (slice 5.6).
          ...(demo === "shops" ? { orderStore: true } : {}),
          // `?demo=history`: every order is older than 30 days (the owner's live shop).
          ...(demo === "history" ? { liveTrouble: "history" as const } : {}),
        }).client;
      })();

// Inside another site's frame the app renders nothing, so it cannot be used for clickjacking.
if (!refuseFraming(window)) {
  createRoot(container).render(
    <StrictMode>
      <App
        locale={initialLocale(storage, navigator.languages)}
        theme={initialTheme(storage)}
        storage={storage}
        {...(api === undefined ? {} : { api })}
      />
    </StrictMode>,
  );
}
