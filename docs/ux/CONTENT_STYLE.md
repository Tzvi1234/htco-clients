# Content Style

How HTCO writes in the product, in Hebrew and English. The brand voice is summarized in the [brand book](../../design/README.md#voice-and-content); this page is the detailed reference.

## Principles

1. **Say what happened, what it means, what to do.** "Couldn't refresh orders from Etsy. Showing data from 14 min ago. Retrying in 30 s."
2. **Name the source and the age** of every figure that comes from another system: "Etsy · 4 min ago". Unverified figures say "Estimated".
3. **Plain and specific.** No marketing language, no exclamation marks, no emoji.
4. **Errors explain and guide.** Cause, consequence, next step. No apologies, no blame, no raw exception text.
5. **Never claim more than the server confirmed.** "Fix applied on Etsy" only after the re-read verified it; otherwise "Fix sent, checking…".

## Capitalization and grammar

- Sentence case for titles, buttons, labels and menus ("Connect shop", not "Connect Shop").
- Buttons start with a verb. Confirmation buttons repeat the verb of the question ("Disconnect shop?" → "Disconnect shop").
- Hebrew buttons use the gender-neutral infinitive ("לאשר", "לדחות", "לחבר חנות"). Hebrew body text addresses the user in plural or impersonal forms where natural.

## Agents and the system

- The system speaks in the third person in status lines and logs: "Quality Supervisor flagged a size claim."
- An agent speaking in a conversation uses the first person, factually, and attaches receipts: "I compared the title with the supplier spec. The title says large; the spec says 12 cm."
- Agents are called by their role, never by human names, and never claim feelings.

## Numbers, dates, money and codes

| Item | English | Hebrew |
|---|---|---|
| Date | Oct 14, 2026 | 14 באוק׳ 2026 |
| Time | 09:14 (24-hour in both) | 09:14 |
| Relative time | 4 min ago | לפני 4 דק׳ |
| Money | $103.67 · ₪380.40 | ‎$103.67 · ‏380.40 ₪ (from the locale formatter) |
| Percent | +12.4% | ‎+12.4% |
| Receipt, SKU, tracking | `3412987650` (monospace, left-to-right) | the same, isolated left-to-right |

- Always format with the platform's locale formatter; never build number or date strings by hand.
- Money comes from the API as a decimal string plus currency; the client formats it and never calculates with it.

## Status words

Use the same words everywhere for the same state (see the brand book's status language): Running, Needs you, Waiting for …, Done, Delivered, Failed, Blocked, Offline.

## Empty, loading and error states

| State | Pattern |
|---|---|
| Empty | What will appear here and the one action that makes it appear |
| Loading (first load) | Skeleton of the real layout; never more than a few seconds before an error state |
| Stale | Show the data with its age and a retry banner |
| Error | Cause, safety ("Nothing was changed"), retry, request ID |
| No permission | Which role is needed and how to ask for it |
