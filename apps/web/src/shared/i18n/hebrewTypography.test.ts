import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

// Hebrew punctuation (docs/design/round2-review.md, "Hebrew RTL"): a one-letter prefix joins a
// Latin word, a number or a code with a maqaf (ב־Etsy, ל־#3152), not a hyphen-minus; geresh
// and gershayim are ׳ and ״ (דק׳, צ׳אט, מנכ״לית), and quotation marks are ״…״, never the
// ASCII ' and ". The Hebrew catalog and the Hebrew sample data of the demo screens follow it.

const SRC = join(import.meta.dirname, "..", "..");
const HEBREW = /[א-ת]/;
const HYPHEN_PREFIX = /(?:^|[\s(״])[ובכלמשה]{1,3}-(?=[A-Za-z0-9#{$])/u;
const ASCII_QUOTE = /['"]/;

function hebrewPunctuationProblems(text: string): string[] {
  if (!HEBREW.test(text)) return [];
  const problems: string[] = [];
  if (HYPHEN_PREFIX.test(text)) problems.push("hyphen-minus after a prefix (use the maqaf ־)");
  if (ASCII_QUOTE.test(text)) problems.push("ASCII quote (use ׳, ״ or ״…״)");
  if (text.includes("...")) problems.push("three dots (use …)");
  return problems;
}

function hebrewMessages(): string[] {
  const po = readFileSync(join(SRC, "locales", "he", "messages.po"), "utf8");
  return [...po.matchAll(/^msgstr "((?:[^"\\]|\\.)*)"$/gm)].map(([, text = ""]) =>
    text.replace(/\\"/g, '"'),
  );
}

/** Hebrew string literals of the source (sample data of the demo screens, `bi(…)`). */
function hebrewLiterals(): { file: string; text: string }[] {
  const files = readdirSync(SRC, { recursive: true, withFileTypes: true }).filter(
    (entry) =>
      entry.isFile() && /\.tsx?$/.test(entry.name) && !/\.(?:test|stories)\.tsx?$/.test(entry.name),
  );
  return files.flatMap((entry) => {
    const path = join(entry.parentPath, entry.name);
    const source = readFileSync(path, "utf8");
    return [...source.matchAll(/(["`])((?:(?!\1)[^\\\n]|\\.)*)\1/g)]
      .map(([, , text = ""]) => text)
      .filter((text) => HEBREW.test(text))
      .map((text) => ({ file: relative(SRC, path), text }));
  });
}

describe("Hebrew punctuation", () => {
  it("finds the problems it guards against", () => {
    expect(hebrewPunctuationProblems("חיבור ל-Etsy")).toHaveLength(1);
    expect(hebrewPunctuationProblems("החזר ל-#3152")).toHaveLength(1);
    expect(hebrewPunctuationProblems("המונח 'Etsy'")).toHaveLength(1);
    expect(hebrewPunctuationProblems('צ"אט')).toHaveLength(1);
    expect(hebrewPunctuationProblems("טוען...")).toHaveLength(1);
    expect(hebrewPunctuationProblems("חיבור ל־Etsy · 12 דק׳ · מנכ״לית · דו־שלבי")).toEqual([]);
    // Brand names keep their own hyphen; English text is not checked.
    expect(hebrewPunctuationProblems("הוזמנת ל־HT-Commerce")).toEqual([]);
    expect(hebrewPunctuationProblems("Don't connect to e-mail")).toEqual([]);
  });

  it("holds in every Hebrew translation", () => {
    const problems = hebrewMessages().flatMap((text) =>
      hebrewPunctuationProblems(text).map((problem) => `${problem}: ${text}`),
    );
    expect(problems).toEqual([]);
  });

  it("holds in the Hebrew sample data of the screens", () => {
    const literals = hebrewLiterals();
    expect(literals.length).toBeGreaterThan(50);
    const problems = literals.flatMap(({ file, text }) =>
      hebrewPunctuationProblems(text).map((problem) => `${file}: ${problem}: ${text}`),
    );
    expect(problems).toEqual([]);
  });
});
