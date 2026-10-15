/**
 * Leaving the app for another site (Etsy's consent screen) with a full page load. One seam, so
 * tests can watch where the browser would go without leaving jsdom.
 */
export const browser = {
  assign(url: string): void {
    window.location.assign(url);
  },
};
