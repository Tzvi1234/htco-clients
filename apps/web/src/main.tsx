import "@fontsource-variable/heebo";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/rubik";
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

// Development only: `?demo` (signed in) or `?demo=signed-out` runs the app on the in-memory API
// used by the tests, to review screens without a local API. Production builds drop this branch.
const demo = import.meta.env.DEV ? new URLSearchParams(window.location.search).get("demo") : null;
const api =
  demo === null
    ? undefined
    : (await import("./test/fakeApi.ts")).fakeBackend(
        demo === "signed-out" ? {} : { signedIn: true, enrolled: true, assurance: "aal2" },
      ).client;

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
