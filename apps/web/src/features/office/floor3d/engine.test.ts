import { describe, expect, it } from "vitest";

import { OfficeScript } from "./engine.ts";
import { SEATS } from "./plan.ts";

/** Runs the script for `seconds` in small steps, like animation frames. */
function run(script: OfficeScript, seconds: number, step = 0.05) {
  for (let i = 0; i < Math.round(seconds / step); i++) script.tick(step);
}

const messages = (script: OfficeScript) => script.log.map((entry) => entry.text.message);

describe("the living office's script (Design 1C OF)", () => {
  it("starts at 12:04 with everyone at their desk and the office waking up", () => {
    const script = new OfficeScript(() => 0.5);
    expect(script.clock()).toBe("12:04");
    expect(script.log).toEqual([]);
    expect(script.actors.noa).toMatchObject({ seated: true, x: SEATS.noa[1], y: SEATS.noa[2] });
  });

  it("logs what happens, newest first, and walks Noa over to Eitan", () => {
    const script = new OfficeScript(() => 0.5);
    run(script, 1.2);
    expect(messages(script)[0]).toBe("Noa → Eitan · late orders");
    expect(script.actors.noa.walk).not.toBeNull();
    expect(script.bubble("noa")).toBeNull();

    run(script, 5);
    expect(messages(script)[0]).toBe("Lia → Maya · document");
    expect(script.bubble("lia")).toEqual({ kind: "icon", icon: "doc" });
  });

  it("shows what employees say while they talk, then their status again at their desk", () => {
    const script = new OfficeScript(() => 0.5);
    expect(script.bubble("noa")).toMatchObject({ kind: "amber", go: "/work/approvals" });
    expect(script.bubble("amir")).toMatchObject({ kind: "red", go: "/office/team" });
    expect(script.bubble("gal")).toEqual({ kind: "zz" });

    let said = false;
    for (let t = 0; t < 30 && !said; t += 0.05) {
      script.tick(0.05);
      said = script.bubble("noa")?.kind === "say";
    }
    expect(said).toBe(true);
  });

  it("stands still while paused and runs twice as fast at 2×", () => {
    const paused = new OfficeScript(() => 0.5);
    paused.setPlaying(false);
    run(paused, 3);
    expect(paused.time).toBe(0);
    expect(paused.log).toEqual([]);

    const fast = new OfficeScript(() => 0.5);
    fast.setSpeed(2);
    run(fast, 3);
    expect(fast.time).toBeCloseTo(6, 1);
  });

  it("starts a new loop after 64 seconds with everyone back at their desk", () => {
    const script = new OfficeScript(() => 0.5);
    run(script, 64.2);
    expect(messages(script)[0]).toBe("A new loop in the office");
    expect(script.time).toBeLessThan(1);
    expect(script.actors.maya).toMatchObject({ seated: true, walk: null });
  });

  it("brings everyone home within the loop", () => {
    const script = new OfficeScript(() => 0.5);
    run(script, 63);
    for (const actor of Object.values(script.actors)) expect(actor.walk).toBeNull();
    expect(script.actors.noa.seated).toBe(true);
    expect(script.actors.omer.seated).toBe(true);
  });
});
