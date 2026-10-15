import "@fontsource-variable/heebo";
import "@fontsource-variable/inter";
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
// Inside another site's frame the app renders nothing, so it cannot be used for clickjacking.
if (!refuseFraming(window)) {
  createRoot(container).render(
    <StrictMode>
      <App
        locale={initialLocale(storage, navigator.languages)}
        theme={initialTheme(storage)}
        storage={storage}
      />
    </StrictMode>,
  );
}
