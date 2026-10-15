// The living office's script (Design 1C `OF`, `SCRIPT`): sample employees walk to each other,
// talk in bubbles and go back to their desks on a 64-second loop, and each step is logged for
// the "Live activity" ticker. It is a demo of the office we plan; nothing here is live data.
import { msg } from "@lingui/core/macro";
import type { MessageDescriptor } from "@lingui/core";

import { CORRIDOR_Y, ROOMS, SEAT_IDS, SEATS, type RoomId } from "./plan.ts";
import { AGENTS, type AgentId } from "../../../shared/demo/office.ts";

export interface Walk {
  points: [number, number][];
  index: number;
  done: () => void;
}

export interface Actor {
  room: RoomId;
  x: number;
  y: number;
  /** 1 faces east, -1 west (the plan's x axis). */
  face: 1 | -1;
  seated: boolean;
  walk: Walk | null;
  say: MessageDescriptor | null;
  look: AgentId | null;
  carry: boolean;
  /** A per-employee phase, so idle motions do not move in step. */
  phase: number;
}

export interface LogEntry {
  /** Clock time in the office, "12:04". */
  time: string;
  text: MessageDescriptor;
  id: number;
}

/** A bubble above an employee: speech, a status that wants attention, or a small icon. */
export type Bubble =
  | { kind: "say"; text: MessageDescriptor }
  | { kind: "amber" | "red"; text: MessageDescriptor; go: string }
  | { kind: "icon"; icon: "doc" | "blocked" | "hour" | "clock" }
  | { kind: "zz" };

const LOOP = 64;
const WALK_SPEED = 110;

const statusOf = (id: AgentId) => AGENTS.find((a) => a.id === id)?.status;

export class OfficeScript {
  time = 0;
  playing = true;
  speed: 1 | 2 = 1;
  actors = {} as Record<AgentId, Actor>;
  log: LogEntry[] = [];
  private timers: { at: number; run: () => void }[] = [];
  private nextLogId = 0;
  private readonly listeners = new Set<() => void>();
  private readonly random: () => number;

  constructor(random: () => number = Math.random) {
    this.random = random;
    this.reset();
  }

  setPlaying(playing: boolean): void {
    this.playing = playing;
  }

  setSpeed(speed: 1 | 2): void {
    this.speed = speed;
  }

  /** Called when the log changes (the ticker re-renders). */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.time = 0;
    this.timers = [];
    for (const id of SEAT_IDS) {
      const [room, x, y] = SEATS[id];
      this.actors[id] = {
        room,
        x,
        y,
        face: 1,
        seated: true,
        walk: null,
        say: null,
        look: null,
        carry: false,
        phase: this.random() * 5,
      };
    }
    this.timers = SCRIPT.map(([at, run]) => ({
      at,
      run: () => {
        run(this);
      },
    }));
  }

  /** The office clock: the loop starts at 12:04 and a minute passes every six seconds. */
  clock(): string {
    const minutes = 12 * 60 + 4 + Math.floor(this.time / 6);
    const two = (n: number) => String(n).padStart(2, "0");
    return `${two(Math.floor(minutes / 60))}:${two(minutes % 60)}`;
  }

  logEvent(text: MessageDescriptor): void {
    this.nextLogId += 1;
    this.log = [{ time: this.clock(), text, id: this.nextLogId }, ...this.log].slice(0, 9);
    for (const listener of this.listeners) listener();
  }

  after(delay: number, run: () => void): void {
    this.timers.push({ at: this.time + delay, run });
  }

  /** Advance the script by `dt` seconds of real time. */
  tick(dt: number): void {
    if (!this.playing) return;
    this.time += dt * this.speed;
    if (this.time >= LOOP) {
      this.reset();
      this.logEvent(msg`A new loop in the office`);
    }
    this.timers.sort((a, b) => a.at - b.at);
    while (this.timers.length > 0 && (this.timers[0]?.at ?? Infinity) <= this.time) {
      this.timers.shift()?.run();
    }
    for (const id of SEAT_IDS) {
      const actor = this.actors[id];
      let step = WALK_SPEED * dt * this.speed;
      while (actor.walk !== null && step > 0) {
        const target = actor.walk.points[actor.walk.index];
        if (target === undefined) break;
        const [tx, ty] = target;
        const dx = tx - actor.x;
        const dy = ty - actor.y;
        const distance = Math.hypot(dx, dy);
        if (Math.abs(dx) > 0.5) actor.face = dx < 0 ? -1 : 1;
        if (distance <= step) {
          actor.x = tx;
          actor.y = ty;
          step -= distance;
          actor.walk.index += 1;
          if (actor.walk.index >= actor.walk.points.length) {
            const done = actor.walk.done;
            actor.walk = null;
            done();
          }
        } else {
          actor.x += (dx / distance) * step;
          actor.y += (dy / distance) * step;
          step = 0;
        }
      }
    }
  }

  /** The way from where an employee is to a point: out to the aisle, the corridor, the door. */
  private route(actor: Actor, room: RoomId, x: number, y: number): [number, number][] {
    const from = ROOMS[actor.room];
    const to = ROOMS[room];
    if (
      !actor.seated &&
      actor.room === room &&
      Math.abs(actor.y - y) < 1 &&
      Math.abs(actor.x - x) <= 40
    )
      return [[x, y]];
    const points: [number, number][] = [];
    let cx = actor.x;
    if (actor.seated) {
      cx = actor.x + 36;
      points.push([cx, actor.y]);
    }
    points.push([cx, from.aisle]);
    if (actor.room !== room)
      points.push(
        [from.door, from.aisle],
        [from.door, CORRIDOR_Y],
        [to.door, CORRIDOR_Y],
        [to.door, to.aisle],
      );
    points.push([x, to.aisle], [x, y]);
    return points.filter((p, i) => {
      const previous = points[i - 1];
      return p[0] !== previous?.[0] || p[1] !== previous[1];
    });
  }

  walk(id: AgentId, room: RoomId, x: number, y: number, then?: () => void, sit = false): void {
    const actor = this.actors[id];
    const points = this.route(actor, room, x, y);
    if (sit) points.push([SEATS[id][1], SEATS[id][2]]);
    actor.seated = false;
    actor.walk = {
      points,
      index: 0,
      done: () => {
        actor.room = room;
        if (sit) actor.seated = true;
        then?.();
      },
    };
  }

  /** Walk to stand beside another employee's desk (`side` 1: their east, -1: west). */
  goTo(id: AgentId, to: AgentId, then?: () => void, side: 1 | -1 = 1): void {
    const [room, x, y] = SEATS[to];
    this.walk(id, room, x + 36 * side, y - 44, then);
  }

  goHome(id: AgentId, then?: () => void): void {
    const [room, x, y] = SEATS[id];
    this.walk(id, room, x + 36, y, then, true);
  }

  talk(
    a: AgentId,
    b: AgentId,
    saysA: MessageDescriptor,
    saysB: MessageDescriptor,
    duration: number,
    then?: () => void,
  ): void {
    const A = this.actors[a];
    const B = this.actors[b];
    A.face = B.x < A.x ? -1 : 1;
    B.face = A.x < B.x ? -1 : 1;
    A.say = saysA;
    A.look = b;
    B.look = a;
    this.after(0.9, () => {
      B.say = saysB;
    });
    this.after(duration, () => {
      A.say = null;
      B.say = null;
      B.face = 1;
      A.look = null;
      B.look = null;
      then?.();
    });
  }

  /** The bubble over an employee now: what they say, else their status when it matters. */
  bubble(id: AgentId): Bubble | null {
    const actor = this.actors[id];
    if (actor.say !== null) return { kind: "say", text: actor.say };
    if (actor.walk !== null) return actor.carry ? { kind: "icon", icon: "doc" } : null;
    if (!actor.seated && id !== "omer") return null;
    switch (id) {
      case "noa":
        return { kind: "amber", text: msg`Waiting for you · refund #3152`, go: "/work/approvals" };
      case "amir":
        return { kind: "red", text: msg`tracking.sync failed (3/3)`, go: "/office/team" };
      case "eitan":
        return { kind: "icon", icon: "blocked" };
      case "shon":
      case "tom":
        return { kind: "icon", icon: "hour" };
      case "lia":
        return { kind: "icon", icon: "clock" };
      case "gal":
        return { kind: "zz" };
      default:
        return null;
    }
  }

  isWorking(id: AgentId): boolean {
    return this.actors[id].seated && statusOf(id) === "running";
  }
}

type Step = readonly [number, (s: OfficeScript) => void];

/** What happens in the office, by second of the loop (the demo's SCRIPT). */
const SCRIPT: readonly Step[] = [
  [
    1,
    (s) => {
      s.logEvent(msg`Noa → Eitan · late orders`);
      s.goTo("noa", "eitan", () => {
        s.talk("noa", "eitan", msg`2 late orders?`, msg`No tracking yet`, 5, () => {
          s.logEvent(msg`Noa → Maya · refund #3152`);
          s.goTo(
            "noa",
            "maya",
            () => {
              s.talk("noa", "maya", msg`Refund on #3152?`, msg`Ask Tzvi`, 4.5, () => {
                s.goHome("noa", () => {
                  s.logEvent(msg`Noa back at desk · waiting for you`);
                });
                s.logEvent(msg`Maya → Amir · sync failure`);
                s.goTo("maya", "amir", () => {
                  s.talk("maya", "amir", msg`Sync fixed?`, msg`Token expired`, 6, () => {
                    s.logEvent(msg`Maya back in Executive Office`);
                    s.goHome("maya");
                  });
                });
              });
            },
            -1,
          );
        });
      });
    },
  ],
  [
    4,
    (s) => {
      s.logEvent(msg`Lia → Maya · document`);
      s.actors.lia.carry = true;
      s.goTo("lia", "maya", () => {
        s.talk("lia", "maya", msg`Weekly summary`, msg`Thanks!`, 3, () => {
          s.actors.lia.carry = false;
          s.goHome("lia");
        });
      });
    },
  ],
  [
    20,
    (s) => {
      s.logEvent(msg`Dana → Eitan · Emma R. ticket`);
      s.goTo(
        "dana",
        "eitan",
        () => {
          s.talk("dana", "eitan", msg`What do I tell Emma?`, msg`Ships today`, 4, () => {
            s.goHome("dana");
          });
        },
        -1,
      );
    },
  ],
  [
    30,
    (s) => {
      s.logEvent(msg`Omer → lounge`);
      s.walk("omer", "lounge", 527, 476, () => {
        s.actors.omer.face = 1;
      });
    },
  ],
  [
    44,
    (s) => {
      s.logEvent(msg`Omer back at desk`);
      s.goHome("omer");
    },
  ],
];
