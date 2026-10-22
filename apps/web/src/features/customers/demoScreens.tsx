import { MailDemo, MarketingDemo, TicketsDemo } from "./CustomersDemos.tsx";

/** Customers' demo screens by `area/tab` (app/shell/DemoRoute.tsx). */
export const demoScreens = {
  "customers/tickets": TicketsDemo,
  "customers/mail": MailDemo,
  "customers/marketing": MarketingDemo,
};
