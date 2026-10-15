import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  for (const name of ["theme", "pal", "t1", "t2", "t3"]) {
    document.documentElement.removeAttribute(`data-${name}`);
  }
  document.documentElement.lang = "";
  document.documentElement.dir = "";
  localStorage.clear();
});
