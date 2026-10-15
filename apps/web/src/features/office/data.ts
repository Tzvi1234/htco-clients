// Sample conversations for the office's demo frames (Design 1C `CONV` and the team room's
// threads). Shown only inside DemoFrame; nothing here is live.
import { msg } from "@lingui/core/macro";
import type { MessageDescriptor } from "@lingui/core";

import type { AgentId } from "../../shared/demo/office.ts";

export interface Conversation {
  id: AgentId;
  last: MessageDescriptor;
  /** A time ("09:14") or a day ("Yesterday"). */
  at: string | MessageDescriptor;
  unread: number;
}

export const YESTERDAY = msg`Yesterday`;

export const CONVERSATIONS: readonly Conversation[] = [
  {
    id: "maya",
    last: msg`Found 2 late orders. Approval request attached.`,
    at: "09:14",
    unread: 2,
  },
  { id: "noa", last: msg`Refund on #3152 is waiting for you.`, at: "09:02", unread: 1 },
  { id: "nika", last: msg`4 new mockups ready for review.`, at: "08:47", unread: 0 },
  { id: "alex", last: msg`api v1.14 deploying, 60% done.`, at: "08:30", unread: 0 },
  { id: "amir", last: msg`tracking.sync returns 502, looking.`, at: "08:14", unread: 0 },
  { id: "tom", last: msg`Waiting on the Gelato quote.`, at: YESTERDAY, unread: 0 },
  { id: "dana", last: msg`All of yesterday’s tickets closed.`, at: YESTERDAY, unread: 0 },
  { id: "lia", last: msg`Weekly summary lands Friday.`, at: YESTERDAY, unread: 0 },
];

export interface TeamThread {
  id: "t1" | "t2" | "t3" | "t4";
  title: MessageDescriptor;
  people: readonly AgentId[];
  at: string | MessageDescriptor;
  live: boolean;
}

export const THREADS: readonly TeamThread[] = [
  {
    id: "t1",
    title: msg`Late orders + tracking sync failure`,
    people: ["noa", "eitan", "maya", "amir"],
    at: "09:21",
    live: true,
  },
  {
    id: "t2",
    title: msg`New star map mockups`,
    people: ["nika", "noam", "shon"],
    at: "08:40",
    live: false,
  },
  {
    id: "t3",
    title: msg`Gelato quote for towels`,
    people: ["tom", "roni"],
    at: YESTERDAY,
    live: false,
  },
  {
    id: "t4",
    title: msg`Nightly quality audit`,
    people: ["noa", "omer"],
    at: YESTERDAY,
    live: false,
  },
];
