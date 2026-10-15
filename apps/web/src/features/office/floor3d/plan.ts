// The living office's floor plan (Design 1C `ROOM`, `SEAT`): a top-down plan of 1000 × 640
// units shared by the walking script and the 3D scene, where world = plan / 10, centred.
import { msg } from "@lingui/core/macro";
import type { MessageDescriptor } from "@lingui/core";

import type { AgentId } from "../../../shared/demo/office.ts";

export type RoomId = "studio" | "exec" | "proc" | "oa" | "cs" | "mkt" | "lounge" | "eng";

export interface Room {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  /** Where the door is along the corridor wall. */
  door: number;
  /** The aisle inside the room, between the desks and the door. */
  aisle: number;
  /** A room on the top (north) side of the corridor. */
  top: boolean;
  /** Open plan: no walls (the lounge). */
  open: boolean;
  name: MessageDescriptor;
}

const room = (
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  door: number,
  aisle: number,
  name: MessageDescriptor,
  extra: { top?: boolean; open?: boolean } = {},
): Room => ({
  x0,
  x1,
  y0,
  y1,
  door,
  aisle,
  name,
  top: extra.top ?? false,
  open: extra.open ?? false,
});

export const ROOMS: Readonly<Record<RoomId, Room>> = {
  studio: room(30, 330, 30, 280, 180, 220, msg`Product Studio`, { top: true }),
  exec: room(340, 640, 30, 280, 490, 220, msg`Executive Office`, { top: true }),
  proc: room(650, 850, 30, 280, 750, 220, msg`Procurement & Finance`, { top: true }),
  oa: room(30, 180, 360, 610, 105, 420, msg`Order Assurance`),
  cs: room(190, 340, 360, 610, 265, 420, msg`Customer Support`),
  mkt: room(350, 500, 360, 610, 425, 420, msg`Marketing`),
  lounge: room(510, 600, 360, 610, 555, 420, msg`Lounge`, { open: true }),
  eng: room(610, 850, 360, 610, 730, 420, msg`Engineering`),
};

export const ROOM_IDS = Object.keys(ROOMS) as RoomId[];

/** Each employee's desk: room and plan position (the chair). */
export const SEATS: Readonly<Record<AgentId, readonly [RoomId, number, number]>> = {
  noa: ["exec", 376, 140],
  maya: ["exec", 448, 140],
  omer: ["exec", 520, 140],
  lia: ["exec", 592, 140],
  shon: ["studio", 66, 140],
  noam: ["studio", 138, 140],
  nika: ["studio", 210, 140],
  daniel: ["studio", 282, 140],
  tom: ["proc", 700, 140],
  roni: ["proc", 772, 140],
  eitan: ["oa", 90, 500],
  dana: ["cs", 250, 500],
  gal: ["mkt", 410, 500],
  alex: ["eng", 650, 500],
  amir: ["eng", 722, 500],
  iris: ["eng", 794, 500],
};

export const SEAT_IDS = Object.keys(SEATS) as AgentId[];

/** The three machine rooms east of the corridor (plan y ranges). */
export const MACHINE_ROOMS: readonly (readonly [number, number])[] = [
  [30, 210],
  [220, 410],
  [420, 610],
];

/** The plan's corridor line between the two rows of rooms. */
export const CORRIDOR_Y = 320;

export const toWorld = (x: number, y: number): [number, number] => [x / 10 - 50, y / 10 - 32];

export type BotShape = "dome" | "capsule" | "cube" | "orb" | "tv" | "pear";
export type BotBody = "w" | "l" | "m" | "d" | "k" | "o";
export type BotAccessory =
  | "crown"
  | "lens"
  | "spiral"
  | "bow"
  | "scope"
  | "pen"
  | "brush"
  | "tag"
  | "clip"
  | "calc"
  | "parcel"
  | "mega"
  | "headset"
  | "code"
  | "wrench"
  | "ring";

/** Each employee's robot: body shape, body colour and the accessory that says their job. */
export const BOTS: Readonly<Record<AgentId, readonly [BotShape, BotBody, BotAccessory]>> = {
  maya: ["dome", "w", "crown"],
  noa: ["capsule", "l", "lens"],
  omer: ["cube", "m", "spiral"],
  lia: ["pear", "w", "bow"],
  shon: ["tv", "d", "scope"],
  noam: ["orb", "w", "pen"],
  nika: ["dome", "o", "brush"],
  daniel: ["cube", "l", "tag"],
  tom: ["capsule", "m", "clip"],
  roni: ["tv", "w", "calc"],
  eitan: ["capsule", "d", "parcel"],
  gal: ["orb", "l", "mega"],
  dana: ["pear", "m", "headset"],
  alex: ["cube", "k", "code"],
  amir: ["dome", "l", "wrench"],
  iris: ["orb", "m", "ring"],
};
