// The 3D office's material table (Design 1C `PAL3`): one per palette. WebGL materials cannot
// read CSS custom properties, so the scene keeps the demo's values here, matched to the tokens of
// each palette (accent orange or lilac, lemon for "needs you" in Design 4). The dark theme keeps
// the light model, as the demo does, on a darker stage.
import type { OfficeStatus } from "../../../shared/ui/kit/index.ts";
import type { BotBody, RoomId } from "./plan.ts";

export interface ScenePalette {
  slab: string;
  corr: string;
  corrLine: string;
  svcA: string;
  svcB: string;
  floors: Record<RoomId, string>;
  wall: string;
  cap: string;
  skirt: string;
  frame: string;
  desk: string;
  deskSide: string;
  metal: string;
  chair: string;
  seat: string;
  monitor: string;
  key: string;
  rugExec: string;
  rugExecEdge: string;
  rug: string;
  cabinet: string;
  handle: string;
  pot: string;
  leaf: string;
  leaf2: string;
  rack: string;
  tray: string;
  glass: string;
  kraft: string;
  tape: string;
  accent: string;
  ink: string;
  paper: string;
  mug: string;
  books: readonly string[];
  mood: readonly string[];
  visor: string;
  eye: number;
  hemiGround: number;
  status: Record<OfficeStatus, number>;
  screen: Record<OfficeStatus, number>;
  leds: readonly [number, number, number, number, number, number];
  body: Record<BotBody, readonly [string, string]>;
}

export const SCENE_PALETTES: Readonly<Record<"sbb" | "d4", ScenePalette>> = {
  sbb: {
    slab: "#D2D2D1",
    corr: "#DDDDDC",
    corrLine: "#BDBDBC",
    svcA: "#D9D9D8",
    svcB: "#C9C9C8",
    floors: {
      studio: "#EDEDEC",
      exec: "#F0F0EF",
      proc: "#EAEAE9",
      oa: "#EBEBEA",
      cs: "#EEEEED",
      mkt: "#E9E9E8",
      lounge: "#E4E4E3",
      eng: "#ECECEB",
    },
    wall: "#FAFAF9",
    cap: "#3A3A3A",
    skirt: "#BDBDBC",
    frame: "#2B2B2B",
    desk: "#F7F7F5",
    deskSide: "#E4E4E2",
    metal: "#2A2A2A",
    chair: "#353535",
    seat: "#CFCFCE",
    monitor: "#3A3A3A",
    key: "#E6E6E4",
    rugExec: "#FF7F36",
    rugExecEdge: "#E5651F",
    rug: "#DCDCDB",
    cabinet: "#FFFFFF",
    handle: "#7A7A7A",
    pot: "#FFFFFF",
    leaf: "#7E8A7F",
    leaf2: "#98A398",
    rack: "#2E2E2E",
    tray: "#9D9D9D",
    glass: "#E6EAEB",
    kraft: "#D9C9AE",
    tape: "#EFE6D6",
    accent: "#FF7F36",
    ink: "#141414",
    paper: "#FFFFFF",
    mug: "#FFFFFF",
    books: ["#141414", "#9D9D9D", "#FF7F36", "#D6D6D4", "#FFFFFF"],
    mood: ["#FF7F36", "#141414", "#9D9D9D", "#D6D6D4", "#FFFFFF", "#CC4800"],
    visor: "#121212",
    eye: 0xffffff,
    hemiGround: 0xbebebc,
    status: {
      running: 0xa6b83a,
      idle: 0xbdbdbd,
      queued: 0xbdbdbd,
      waitext: 0x3d9bff,
      waityou: 0xff7f36,
      blocked: 0x141414,
      failed: 0xff5151,
      offline: 0x5a5a5a,
    },
    screen: {
      running: 0xf4f4f2,
      idle: 0xbdbdbd,
      queued: 0xbdbdbd,
      waitext: 0x9cc8ff,
      waityou: 0xffb384,
      blocked: 0x6f6f6f,
      failed: 0xff7a7a,
      offline: 0x2a2a2a,
    },
    leds: [0xa6b83a, 0x4e6a12, 0xff7f36, 0x7a3a16, 0xff5151, 0x5a1a1a],
    body: {
      w: ["#F7F7F6", "#2E2E2E"],
      l: ["#D6D6D4", "#2E2E2E"],
      m: ["#A9A9A7", "#F2F2F1"],
      d: ["#4A4A4A", "#D6D6D4"],
      k: ["#1C1C1C", "#A9A9A7"],
      o: ["#FF7F36", "#2E2E2E"],
    },
  },
  d4: {
    slab: "#E7E8E2",
    corr: "#F3F4EE",
    corrLine: "#CBCCC6",
    svcA: "#ECEDE7",
    svcB: "#D9DAD4",
    floors: {
      studio: "#E4DDF4",
      exec: "#F6E2F6",
      proc: "#EBE6F7",
      oa: "#F6E4F6",
      cs: "#E4DDF4",
      mkt: "#F6E2F6",
      lounge: "#F3F4EE",
      eng: "#EBE6F7",
    },
    wall: "#FFFFFF",
    cap: "#1A1A1A",
    skirt: "#D9DAD4",
    frame: "#000000",
    desk: "#FFFFFF",
    deskSide: "#E7E8E2",
    metal: "#111111",
    chair: "#111111",
    seat: "#D8CFEE",
    monitor: "#2E2E2E",
    key: "#E7E8E2",
    rugExec: "#EEC5EF",
    rugExecEdge: "#DDA9DF",
    rug: "#E7E8E2",
    cabinet: "#FFFFFF",
    handle: "#111111",
    pot: "#FFFFFF",
    leaf: "#B9A9E8",
    leaf2: "#D8CFEE",
    rack: "#1A1A1A",
    tray: "#CBCCC6",
    glass: "#FBFAFE",
    kraft: "#E7E8E2",
    tape: "#D8CFEE",
    accent: "#8C76D6",
    ink: "#000000",
    paper: "#FFFFFF",
    mug: "#EEC5EF",
    books: ["#000000", "#D8CFEE", "#EEC5EF", "#E7E8E2", "#8C76D6"],
    mood: ["#D8CFEE", "#EEC5EF", "#000000", "#8C76D6", "#E7E8E2", "#EDD803"],
    visor: "#111111",
    eye: 0xffffff,
    hemiGround: 0xd9d4e8,
    status: {
      running: 0x8c76d6,
      idle: 0xd9dad4,
      queued: 0xd9dad4,
      waitext: 0xc27bc4,
      waityou: 0xedd803,
      blocked: 0x000000,
      failed: 0xf0443a,
      offline: 0x7a7a74,
    },
    screen: {
      running: 0xf6f3ff,
      idle: 0xd9dad4,
      queued: 0xd9dad4,
      waitext: 0xf0d2f1,
      waityou: 0xf5ec7a,
      blocked: 0x7a7a74,
      failed: 0xf7867f,
      offline: 0x2a2a2a,
    },
    leds: [0x8c76d6, 0x3e3170, 0xeec5ef, 0x6e4c6f, 0xf0443a, 0x5a1a1a],
    body: {
      w: ["#FFFFFF", "#111111"],
      l: ["#D8CFEE", "#111111"],
      m: ["#EEC5EF", "#FFFFFF"],
      d: ["#B9A9E8", "#111111"],
      k: ["#111111", "#D8CFEE"],
      o: ["#8C76D6", "#111111"],
    },
  },
};
