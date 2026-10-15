// The living office in 3D (Design 1C `map3d`, three.js): rooms, desks and the 16 robot
// employees, animated by the office script, with room labels and speech bubbles as DOM overlays.
// Loaded only on Office › Floor (FloorMap imports this module on demand). No eval, no remote
// code: three.js is bundled, textures are drawn on canvases.
import type { MessageDescriptor } from "@lingui/core";
import * as THREE from "three";

import type { Bubble, OfficeScript } from "./engine.ts";
import { SCENE_PALETTES, type ScenePalette } from "./palette.ts";
import {
  BOTS,
  MACHINE_ROOMS,
  ROOM_IDS,
  ROOMS,
  SEAT_IDS,
  SEATS,
  toWorld,
  type BotShape,
  type RoomId,
} from "./plan.ts";
import { AGENTS, type AgentId } from "../../../shared/demo/office.ts";

// The demo was drawn with three r128: no colour management and legacy light units.
THREE.ColorManagement.enabled = false;
const LIGHT = Math.PI;

const CAM0 = { az: 40, el: 40, zoom: 1 };
/** Character scale: robots are modelled in world units. */
const CS = 1.4;
const SEAT_Y = 1.58;
const DESK_Y = 2.62;
const H_T = 3.0;
const H_P = 2.5;
const H_D = 1.6;
const H_L = 1.2;

export type SceneText = (message: MessageDescriptor) => string;

export interface OfficeSceneOptions {
  container: HTMLElement;
  overlay: HTMLElement;
  palette: "sbb" | "d4";
  script: OfficeScript;
  text: SceneText;
  /** Room and machine room names in the current language. */
  roomName: (room: RoomId) => string;
  serviceName: (index: number) => string;
  agentName: (id: AgentId) => string;
  onAgent: (id: AgentId) => void;
  onGo: (to: string) => void;
  /** Reduced motion: the script stays paused; the camera still moves when asked. */
  still: boolean;
}

interface Robot {
  group: THREE.Group;
  body: THREE.Group;
  legs: [THREE.Group, THREE.Group];
  arms: [THREE.Group, THREE.Group];
  eyes: THREE.Group;
  eyesY: number;
  mouth: THREE.Mesh;
  band: THREE.MeshBasicMaterial;
  ring: THREE.Mesh | null;
  top: number;
  lookX: number;
  lookY: number;
}

interface Led {
  x: number;
  y: number;
  z: number;
  kind: 0 | 1 | 2;
  phase: number;
}

const hash01 = (n: number) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

/** One living office on a canvas. `dispose()` frees the GPU resources and the listeners. */
export class OfficeScene {
  private readonly o: OfficeSceneOptions;
  private P: ScenePalette;
  private readonly renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 600);
  private readonly materials = new Map<string, THREE.MeshStandardMaterial>();
  private readonly geometries = new Map<string, THREE.BufferGeometry>();
  private readonly textures: THREE.Texture[] = [];
  private readonly tex: Record<string, THREE.CanvasTexture> = {};
  private robots = {} as Record<AgentId, Robot>;
  private screens = {} as Record<
    AgentId,
    { screen: THREE.MeshBasicMaterial; led: THREE.MeshBasicMaterial }
  >;
  private pick: THREE.Object3D[] = [];
  private leds: { mesh: THREE.InstancedMesh; list: Led[]; color: THREE.Color } | null = null;
  private spark: THREE.Mesh | null = null;
  private az = CAM0.az;
  private el = CAM0.el;
  private zoom = CAM0.zoom;
  private target = { ...CAM0 };
  private focus: THREE.Vector3 | null = null;
  private look: THREE.Vector3 | null = null;
  private drag: { x: number; y: number; az: number; el: number; moved: boolean } | null = null;
  private hover: AgentId | null = null;
  private width = 0;
  private height = 0;
  private last = 0;
  private frame = 0;
  private running = false;
  private readonly labels: { el: HTMLElement; at: () => [number, number, number] }[] = [];
  private readonly bubbles = {} as Record<AgentId, { el: HTMLElement; key: string; w: number }>;
  private tag: HTMLElement | null = null;
  private readonly cleanup: (() => void)[] = [];
  private readonly projector = new THREE.Vector3();

  constructor(options: OfficeSceneOptions) {
    this.o = options;
    this.P = SCENE_PALETTES[options.palette];
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    this.renderer = renderer;
    options.container.prepend(renderer.domElement);
    this.build();
    this.buildOverlay();
    this.bind();
    const resize = new ResizeObserver(() => {
      this.resize();
      if (!this.running) this.render(0);
    });
    resize.observe(options.container);
    this.cleanup.push(() => {
      resize.disconnect();
    });
    this.resize();
  }

  /* ------------------------------------------------------------------ lifecycle */

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = 0;
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = this.last === 0 ? 0 : Math.min(0.1, (now - this.last) / 1000);
      this.last = now;
      this.o.script.tick(dt);
      this.render(dt);
      this.frame = requestAnimationFrame(loop);
    };
    this.frame = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  dispose(): void {
    this.stop();
    for (const undo of this.cleanup) undo();
    this.disposeScene();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.o.overlay.replaceChildren();
  }

  setPalette(palette: "sbb" | "d4"): void {
    if (SCENE_PALETTES[palette] === this.P) return;
    this.P = SCENE_PALETTES[palette];
    this.disposeScene();
    this.scene = new THREE.Scene();
    this.build();
    this.render(0);
  }

  /** Room labels and bubbles in the current language. */
  relabel(): void {
    this.buildOverlay();
    this.render(0);
  }

  resetView(): void {
    this.target = { ...CAM0 };
    this.focus = null;
  }

  /* ------------------------------------------------------------------ helpers */

  private mat(
    color: string,
    extra: THREE.MeshStandardMaterialParameters = {},
  ): THREE.MeshStandardMaterial {
    const key =
      color +
      JSON.stringify(extra, (k, v: unknown) => (k === "map" || k === "emissive" ? undefined : v));
    let material = this.materials.get(key);
    if (material === undefined) {
      material = new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0, ...extra });
      this.materials.set(key, material);
    }
    return material;
  }

  private geo<G extends THREE.BufferGeometry>(key: string, make: () => G): G {
    const found = this.geometries.get(key);
    if (found !== undefined) return found as G;
    const made = make();
    this.geometries.set(key, made);
    return made;
  }

  private box(w: number, h: number, d: number) {
    return this.geo(
      `b${String(w)}_${String(h)}_${String(d)}`,
      () => new THREE.BoxGeometry(w, h, d),
    );
  }

  private cyl(r1: number, r2: number, h: number, s = 20) {
    return this.geo(
      `c${String(r1)}_${String(r2)}_${String(h)}_${String(s)}`,
      () => new THREE.CylinderGeometry(r1, r2, h, s),
    );
  }

  private sphere(r: number, ws = 20, hs = 14) {
    return this.geo(`s${String(r)}_${String(ws)}`, () => new THREE.SphereGeometry(r, ws, hs));
  }

  private torus(r: number, t: number, arc = Math.PI * 2) {
    return this.geo(
      `t${String(r)}_${String(t)}_${String(arc)}`,
      () => new THREE.TorusGeometry(r, t, 10, 36, arc),
    );
  }

  private lathe(key: string, points: readonly (readonly [number, number])[], segments = 28) {
    return this.geo(
      key,
      () =>
        new THREE.LatheGeometry(
          points.map(([x, y]) => new THREE.Vector2(Math.max(0, x), y)),
          segments,
        ),
    );
  }

  private capsule(r: number, len: number) {
    const points: [number, number][] = [];
    for (let i = 0; i <= 8; i++) {
      const a = -Math.PI / 2 + (i / 8) * (Math.PI / 2);
      points.push([Math.cos(a) * r, -len / 2 + Math.sin(a) * r]);
    }
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * (Math.PI / 2);
      points.push([Math.cos(a) * r, len / 2 + Math.sin(a) * r]);
    }
    return this.lathe(`cap${String(r)}_${String(len)}`, points, 18);
  }

  /** A rounded, bevelled box: plan radius r, edge bevel b. */
  private rbox(w: number, h: number, d: number, r = 0.2, b = 0.06) {
    return this.geo(`rb${String(w)}_${String(h)}_${String(d)}_${String(r)}_${String(b)}`, () => {
      const bevel = Math.min(b, h / 2 - 0.002, w / 2 - 0.01, d / 2 - 0.01);
      const shape = roundedRect(w - 2 * bevel, d - 2 * bevel, Math.max(0.002, r - bevel));
      const g = new THREE.ExtrudeGeometry(shape, {
        depth: Math.max(0.002, h - 2 * bevel),
        bevelEnabled: bevel > 0,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelSegments: 2,
        curveSegments: 5,
      });
      g.rotateX(-Math.PI / 2);
      g.translate(0, -(h - 2 * bevel) / 2, 0);
      return g;
    });
  }

  private mesh(
    g: THREE.BufferGeometry,
    m: string | THREE.Material,
    x = 0,
    y = 0,
    z = 0,
    cast = true,
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(g, typeof m === "string" ? this.mat(m) : m);
    mesh.position.set(x, y, z);
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    return mesh;
  }

  private canvasTexture(
    w: number,
    h: number,
    draw: (c: CanvasRenderingContext2D) => void,
    repeat = false,
  ): THREE.CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const context = canvas.getContext("2d");
    if (context !== null) draw(context);
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    if (repeat) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    }
    this.textures.push(texture);
    return texture;
  }

  private texture(name: string): THREE.CanvasTexture {
    const found = this.tex[name];
    if (found === undefined) throw new Error(`No texture ${name}`);
    return found;
  }

  /* ------------------------------------------------------------------ build */

  private textures2d(): void {
    const P = this.P;
    const T = this.tex;
    T["tile"] = this.canvasTexture(
      128,
      128,
      (x) => {
        x.fillStyle = "#FFFFFF";
        x.fillRect(0, 0, 128, 128);
        x.fillStyle = "rgba(0,0,0,.075)";
        x.fillRect(0, 0, 128, 2);
        x.fillRect(0, 0, 2, 128);
        x.fillStyle = "rgba(255,255,255,.6)";
        x.fillRect(0, 2, 128, 1);
        x.fillRect(2, 0, 1, 128);
      },
      true,
    );
    T["ao"] = this.canvasTexture(4, 64, (x) => {
      const g = x.createLinearGradient(0, 0, 0, 64);
      g.addColorStop(0, "rgba(0,0,0,.30)");
      g.addColorStop(0.35, "rgba(0,0,0,.10)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = g;
      x.fillRect(0, 0, 4, 64);
    });
    T["blob"] = this.canvasTexture(64, 64, (x) => {
      const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(0,0,0,.42)");
      g.addColorStop(0.55, "rgba(0,0,0,.16)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = g;
      x.fillRect(0, 0, 64, 64);
    });
    T["fade"] = this.canvasTexture(128, 128, (x) => {
      const g = x.createRadialGradient(64, 64, 20, 64, 64, 64);
      g.addColorStop(0, "rgba(0,0,0,.22)");
      g.addColorStop(0.6, "rgba(0,0,0,.08)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = g;
      x.fillRect(0, 0, 128, 128);
    });
    T["hatch"] = this.canvasTexture(
      64,
      64,
      (x) => {
        x.fillStyle = P.svcA;
        x.fillRect(0, 0, 64, 64);
        x.strokeStyle = P.svcB;
        x.lineWidth = 5;
        for (let i = -64; i < 128; i += 16) {
          x.beginPath();
          x.moveTo(i, 0);
          x.lineTo(i + 64, 64);
          x.stroke();
        }
      },
      true,
    );
    T["corr"] = this.canvasTexture(
      256,
      32,
      (x) => {
        x.fillStyle = "#FFFFFF";
        x.fillRect(0, 0, 256, 32);
        x.fillStyle = P.corrLine;
        for (let i = 8; i < 256; i += 32) {
          x.beginPath();
          x.arc(i, 16, 2.4, 0, 7);
          x.fill();
        }
      },
      true,
    );
    T["screen"] = this.canvasTexture(128, 80, (x) => {
      x.fillStyle = "#FFFFFF";
      x.fillRect(0, 0, 128, 80);
      x.fillStyle = "rgba(0,0,0,.16)";
      x.fillRect(8, 8, 44, 6);
      for (let i = 0; i < 5; i++) x.fillRect(8, 22 + i * 10, 30 + ((i * 37) % 60), 4);
      x.fillStyle = "rgba(0,0,0,.08)";
      x.fillRect(86, 22, 34, 44);
    });
    T["code"] = this.canvasTexture(128, 80, (x) => {
      x.fillStyle = "#141414";
      x.fillRect(0, 0, 128, 80);
      x.fillStyle = P.accent;
      x.font = "bold 38px monospace";
      x.textAlign = "center";
      x.fillText("</>", 64, 52);
    });
    T["rack"] = this.canvasTexture(128, 256, (x) => {
      x.fillStyle = "#262626";
      x.fillRect(0, 0, 128, 256);
      for (let i = 0; i < 6; i++) {
        const y = 12 + i * 40;
        x.fillStyle = "#343434";
        x.fillRect(10, y, 108, 32);
        x.fillStyle = "#1A1A1A";
        for (let v = 0; v < 9; v++) x.fillRect(16 + v * 7, y + 8, 3, 16);
        x.fillStyle = "#555";
        x.fillRect(104, y + 6, 6, 20);
      }
      x.strokeStyle = "#4A4A4A";
      x.lineWidth = 3;
      x.strokeRect(4, 4, 120, 248);
    });
    T["board"] = this.canvasTexture(256, 128, (x) => {
      x.fillStyle = "#FFFFFF";
      x.fillRect(0, 0, 256, 128);
      x.strokeStyle = "#222";
      x.lineWidth = 3;
      x.strokeRect(20, 24, 52, 30);
      x.strokeRect(100, 24, 52, 30);
      x.strokeRect(180, 24, 52, 30);
      x.beginPath();
      x.moveTo(72, 39);
      x.lineTo(100, 39);
      x.moveTo(152, 39);
      x.lineTo(180, 39);
      x.stroke();
      x.strokeStyle = P.accent;
      x.lineWidth = 4;
      x.beginPath();
      x.moveTo(24, 108);
      x.lineTo(70, 88);
      x.lineTo(110, 98);
      x.lineTo(160, 74);
      x.lineTo(230, 80);
      x.stroke();
      x.fillStyle = "rgba(0,0,0,.25)";
      for (let i = 0; i < 4; i++) x.fillRect(176, 92 + i * 8, 40 + ((i * 13) % 20), 3);
    });
    T["mood"] = this.canvasTexture(256, 128, (x) => {
      x.fillStyle = "#F3F3F2";
      x.fillRect(0, 0, 256, 128);
      const rects = [
        [12, 12, 60, 46],
        [80, 10, 44, 60],
        [132, 14, 54, 40],
        [196, 10, 48, 52],
        [14, 68, 44, 48],
        [66, 78, 58, 40],
        [134, 62, 40, 54],
        [182, 70, 62, 46],
      ] as const;
      rects.forEach(([rx, ry, rw, rh], i) => {
        x.fillStyle = P.mood[i % P.mood.length] ?? "#FFFFFF";
        x.fillRect(rx, ry, rw, rh);
        x.fillStyle = "rgba(0,0,0,.35)";
        x.beginPath();
        x.arc(rx + rw / 2, ry + 4, 2.4, 0, 7);
        x.fill();
      });
    });
  }

  private build(): void {
    const P = this.P;
    this.textures2d();
    const sc = this.scene;
    sc.add(new THREE.HemisphereLight(0xffffff, P.hemiGround, 0.6 * LIGHT));
    const sun = new THREE.DirectionalLight(0xfffdf8, 0.62 * LIGHT);
    sun.position.set(-32, 64, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, {
      left: -62,
      right: 62,
      top: 46,
      bottom: -46,
      near: 1,
      far: 180,
    });
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    sun.shadow.radius = 3;
    sc.add(sun);
    const fill = new THREE.DirectionalLight(0xf2f5ff, 0.16 * LIGHT);
    fill.position.set(40, 30, -20);
    sc.add(fill);
    const statics: THREE.Object3D[] = [];
    this.buildRooms(statics);
    mergeStatic(sc, statics);
    this.robots = {} as Record<AgentId, Robot>;
    this.pick = [];
    for (const id of SEAT_IDS) {
      const [, px, py] = SEATS[id];
      const [x, z] = toWorld(px, py);
      const robot = this.buildBot(id);
      robot.group.position.set(x, 0, z);
      sc.add(robot.group);
      this.robots[id] = robot;
      if (AGENTS.find((a) => a.id === id)?.status === "offline") {
        robot.group.traverse((o) => {
          if (o instanceof THREE.Mesh && o.userData["shadow"] !== true) {
            const m = (o.material as THREE.Material).clone();
            m.transparent = true;
            m.opacity = 0.5;
            o.material = m;
          }
        });
      }
    }
    this.spark = new THREE.Mesh(
      this.sphere(0.2, 10, 8),
      new THREE.MeshBasicMaterial({ color: P.accent }),
    );
    sc.add(this.spark);
  }

  private buildRooms(ST: THREE.Object3D[]): void {
    const P = this.P;
    const sc = this.scene;
    const add = <O extends THREE.Object3D>(o: O): O => {
      ST.push(o);
      return o;
    };
    const aoM = new THREE.MeshBasicMaterial({
      map: this.texture("ao"),
      transparent: true,
      depthWrite: false,
    });
    const blobM = new THREE.MeshBasicMaterial({
      map: this.texture("blob"),
      transparent: true,
      depthWrite: false,
    });
    const ao = (cx: number, cz: number, len: number, ang: number, w = 1.3) => {
      const m = new THREE.Mesh(
        this.geo(`aoP${String(len)}_${String(w)}`, () =>
          new THREE.PlaneGeometry(len, w).rotateX(-Math.PI / 2),
        ),
        aoM,
      );
      m.rotation.y = ang;
      m.position.set(cx + (Math.sin(ang) * w) / 2, 0.075, cz + (Math.cos(ang) * w) / 2);
      m.renderOrder = 1;
      add(m);
    };
    const blob = (x: number, z: number, sx: number, sz: number) => {
      const m = new THREE.Mesh(
        this.geo("blobP", () => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)),
        blobM,
      );
      m.scale.set(sx, 1, sz);
      m.position.set(x, 0.08, z);
      m.renderOrder = 1;
      add(m);
    };
    const wall = (x0: number, z0: number, x1: number, z1: number, h: number, t = 0.5) => {
      const horizontal = Math.abs(z1 - z0) < 1e-6;
      const len = horizontal ? Math.abs(x1 - x0) : Math.abs(z1 - z0);
      if (len < 0.05) return;
      const cx = (x0 + x1) / 2;
      const cz = (z0 + z1) / 2;
      const w = horizontal ? len : t;
      const d = horizontal ? t : len;
      add(this.mesh(this.box(w, h, d), this.mat(P.wall, { roughness: 0.9 }), cx, h / 2, cz));
      add(
        this.mesh(
          this.box(w + 0.03, h >= H_T ? 0.09 : 0.06, d + 0.03),
          P.cap,
          cx,
          h + (h >= H_T ? 0.045 : 0.03),
          cz,
          false,
        ),
      );
      add(this.mesh(this.box(w + 0.08, 0.2, d + 0.08), P.skirt, cx, 0.1, cz, false));
      if (horizontal) {
        ao(cx, cz + t / 2 + 0.04, len, 0);
        ao(cx, cz - t / 2 - 0.04, len, Math.PI);
      } else {
        ao(cx + t / 2 + 0.04, cz, len, Math.PI / 2);
        ao(cx - t / 2 - 0.04, cz, len, -Math.PI / 2);
      }
    };
    const wallX = (
      xa: number,
      xb: number,
      z: number,
      h: number,
      gaps: [number, number][],
      t: number,
    ) => {
      let x = xa;
      for (const [g0, g1] of [...gaps].sort((a, b) => a[0] - b[0])) {
        if (g0 > x) wall(x, z, g0, z, h, t);
        x = Math.max(x, g1);
      }
      if (xb > x) wall(x, z, xb, z, h, t);
    };
    const wallZ = (
      x: number,
      za: number,
      zb: number,
      h: number,
      gaps: [number, number][],
      t: number,
    ) => {
      let z = za;
      for (const [g0, g1] of [...gaps].sort((a, b) => a[0] - b[0])) {
        if (g0 > z) wall(x, z, x, g0, h, t);
        z = Math.max(z, g1);
      }
      if (zb > z) wall(x, z, x, zb, h, t);
    };
    const doorFrame = (x: number, z: number, axis: "x" | "z", hw = 2.2, h = 2.7) => {
      if (axis === "x") {
        for (const s of [-1, 1])
          add(this.mesh(this.box(0.24, h, 0.62), P.frame, x + s * hw, h / 2, z));
        add(this.mesh(this.box(hw * 2 + 0.24, 0.22, 0.62), P.frame, x, h - 0.11, z));
        add(this.mesh(this.box(hw * 2, 0.03, 0.7), P.skirt, x, 0.075, z, false));
      } else {
        for (const s of [-1, 1])
          add(this.mesh(this.box(0.62, h, 0.24), P.frame, x, h / 2, z + s * hw));
        add(this.mesh(this.box(0.62, 0.22, hw * 2 + 0.24), P.frame, x, h - 0.11, z));
        add(this.mesh(this.box(0.7, 0.03, hw * 2), P.skirt, x, 0.075, z, false));
      }
    };
    // slab and a soft ground fade
    const slab = this.mesh(this.rbox(96.4, 1.2, 60.6, 1.2, 0.25), P.slab, 0, -0.6, 0);
    slab.castShadow = false;
    add(slab);
    const fade = new THREE.Mesh(
      new THREE.PlaneGeometry(150, 105).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        map: this.texture("fade"),
        transparent: true,
        depthWrite: false,
      }),
    );
    fade.position.y = -1.22;
    sc.add(fade);
    // floors
    for (const id of ROOM_IDS) {
      const r = ROOMS[id];
      const [x0, z0] = toWorld(r.x0, r.y0);
      const [x1, z1] = toWorld(r.x1, r.y1);
      const t = this.texture("tile").clone();
      t.needsUpdate = true;
      this.textures.push(t);
      t.repeat.set((x1 - x0) / 2.5, (z1 - z0) / 2.5);
      const f = new THREE.Mesh(
        this.box(x1 - x0 + 1, 0.07, z1 - z0 + 1),
        new THREE.MeshStandardMaterial({ color: P.floors[id], map: t, roughness: 0.9 }),
      );
      f.position.set((x0 + x1) / 2, 0.035, (z0 + z1) / 2);
      f.receiveShadow = true;
      sc.add(f);
    }
    {
      const t = this.texture("corr").clone();
      t.needsUpdate = true;
      this.textures.push(t);
      t.repeat.set(82 / 8, 1);
      const f = new THREE.Mesh(
        this.box(82.5, 0.06, 8),
        new THREE.MeshStandardMaterial({ color: P.corr, map: t, roughness: 0.9 }),
      );
      f.position.set(-6, 0.03, 0);
      f.receiveShadow = true;
      sc.add(f);
    }
    const hatch = this.texture("hatch");
    hatch.repeat.set(3, 5);
    const hm = new THREE.MeshStandardMaterial({ map: hatch, roughness: 0.9 });
    for (const [y0, y1] of MACHINE_ROOMS) {
      const [x0, z0] = toWorld(860, y0);
      const [x1, z1] = toWorld(970, y1);
      const f = new THREE.Mesh(this.box(x1 - x0 + 0.5, 0.08, z1 - z0 + 0.5), hm);
      f.position.set((x0 + x1) / 2, 0.04, (z0 + z1) / 2);
      f.receiveShadow = true;
      sc.add(f);
    }
    // exterior and partitions (world: top rooms z -29..-4, bottom 4..29, service x 36..47)
    const dg = (d: number): [number, number] => [d - 2.2, d + 2.2];
    wall(-47.3, -29.3, 47.3, -29.3, H_T, 0.6);
    wall(-47.3, -29.3, -47.3, 29.3, H_T, 0.6);
    wall(-47.3, 29.3, 47.3, 29.3, H_L, 0.6);
    wall(47.3, -29.3, 47.3, 29.3, H_L, 0.6);
    wallX(-47, 35.5, -4, H_D, [dg(-32), dg(-1), dg(25)], 0.5);
    wallX(-47, 35.5, 4, H_D, [dg(-39.5), dg(-23.5), dg(-7.5), dg(23), [0.6, 10.4]], 0.5);
    for (const d of [-32, -1, 25]) doorFrame(d, -4, "x");
    for (const d of [-39.5, -23.5, -7.5, 23]) doorFrame(d, 4, "x");
    for (const [x, a, b] of [
      [-16.5, -29, -4],
      [14.5, -29, -4],
      [-31.5, 4, 29],
      [-15.5, 4, 29],
      [0.5, 4, 29],
      [10.5, 4, 29],
    ] as const)
      wall(x, a, x, b, H_P, 1.0);
    wallZ(35.5, -29, 29, H_P, [dg(-20.5), dg(0), dg(17.5)], 1.0);
    for (const d of [-20.5, 0, 17.5]) doorFrame(35.5, d, "z", 2.2, 2.9);
    wall(36, -10.5, 47, -10.5, H_P, 1.0);
    wall(36, 9.5, 47, 9.5, H_P, 1.0);
    // window strips on the north and west walls
    const glass = this.mat(P.glass, {
      roughness: 0.15,
      metalness: 0.05,
      emissive: new THREE.Color(P.glass),
      emissiveIntensity: 0.25,
    });
    for (const [a, b] of [
      [-46, -17.5],
      [-15.5, 14],
      [15, 35],
    ] as const) {
      const n = Math.max(2, Math.round((b - a) / 4.4));
      const w = (b - a) / n;
      for (let i = 0; i < n; i++)
        add(this.mesh(this.box(w - 0.3, 1.3, 0.08), glass, a + w * (i + 0.5), 1.95, -28.96, false));
      add(this.mesh(this.box(b - a, 0.12, 0.2), P.frame, (a + b) / 2, 1.25, -28.9, false));
      add(this.mesh(this.box(b - a, 0.12, 0.2), P.frame, (a + b) / 2, 2.66, -28.9, false));
      for (let i = 0; i <= n; i++)
        add(this.mesh(this.box(0.12, 1.42, 0.2), P.frame, a + w * i, 1.95, -28.9, false));
    }
    for (const [a, b] of [
      [-28, -6],
      [6, 28],
    ] as const) {
      const n = Math.round((b - a) / 4.4);
      const w = (b - a) / n;
      for (let i = 0; i < n; i++)
        add(this.mesh(this.box(0.08, 1.3, w - 0.3), glass, -46.96, 1.95, a + w * (i + 0.5), false));
      add(this.mesh(this.box(0.2, 0.12, b - a), P.frame, -46.9, 1.25, (a + b) / 2, false));
      add(this.mesh(this.box(0.2, 0.12, b - a), P.frame, -46.9, 2.66, (a + b) / 2, false));
      for (let i = 0; i <= n; i++)
        add(this.mesh(this.box(0.2, 1.42, 0.12), P.frame, -46.9, 1.95, a + w * i, false));
    }
    // reusable props
    const leafGeo = () => this.geo("leaf", () => new THREE.IcosahedronGeometry(1, 1));
    const plant = (x: number, z: number, s = 1) => {
      add(
        this.mesh(
          this.lathe("pot", [
            [0, 0],
            [0.55, 0],
            [0.75, 1.05],
            [0.8, 1.1],
            [0, 1.1],
          ]),
          P.pot,
          x,
          0,
          z,
        ),
      ).scale.setScalar(s);
      [
        [0, 1.9, 0, 0.75],
        [0.45, 1.55, 0.2, 0.55],
        [-0.4, 1.6, -0.15, 0.6],
        [0.1, 2.45, -0.1, 0.5],
        [-0.25, 2.2, 0.35, 0.48],
      ].forEach(([a = 0, b = 0, c = 0, r = 0], i) => {
        const l = this.mesh(leafGeo(), i % 2 ? P.leaf2 : P.leaf, x + a * s, b * s, z + c * s);
        l.scale.set(r * s, r * 1.15 * s, r * s);
        add(l);
      });
      blob(x, z, 2.4 * s, 2.4 * s);
    };
    const cabinet = (x: number, z: number, w: number, h: number, d: number) => {
      const g = new THREE.Group();
      g.add(this.mesh(this.rbox(w, h, d, 0.15, 0.05), P.cabinet, 0, h / 2, 0));
      const n = Math.max(1, Math.round(w / 1.4));
      for (let i = 0; i < n; i++) {
        const cx = -w / 2 + (w / n) * (i + 0.5);
        g.add(
          this.mesh(
            this.box(0.03, h - 0.3, 0.03),
            P.skirt,
            -w / 2 + (w / n) * i,
            h / 2,
            d / 2 + 0.01,
            false,
          ),
        );
        g.add(
          this.mesh(
            this.box(0.08, 0.5, 0.1),
            P.handle,
            cx + (w / n) * 0.3,
            h * 0.6,
            d / 2 + 0.04,
            false,
          ),
        );
      }
      g.position.set(x, 0, z);
      add(g);
      blob(x, z, w + 1.2, d + 1.4);
    };
    const shelf = (x: number, z: number, w: number) => {
      const g = new THREE.Group();
      const H = 3.1;
      g.add(this.mesh(this.box(0.12, H, 1.0), P.cabinet, -w / 2, H / 2, 0));
      g.add(this.mesh(this.box(0.12, H, 1.0), P.cabinet, w / 2, H / 2, 0));
      for (let i = 0; i < 4; i++) {
        const y = 0.2 + i * 0.95;
        g.add(this.mesh(this.box(w, 0.1, 1.0), P.cabinet, 0, y, 0));
        if (i < 3) {
          let bx = -w / 2 + 0.25;
          let j = i * 3;
          while (bx < w / 2 - 0.5) {
            const bw = 0.22 + ((j * 7) % 4) * 0.06;
            const bh = 0.55 + ((j * 5) % 3) * 0.12;
            g.add(
              this.mesh(
                this.box(bw, bh, 0.7),
                P.books[j % P.books.length] ?? P.ink,
                bx + bw / 2,
                y + 0.05 + bh / 2,
                0,
              ),
            );
            bx += bw + 0.04;
            j++;
            if (j % 5 === 4) bx += 0.4;
          }
        }
      }
      g.position.set(x, 0, z);
      add(g);
      blob(x, z, w + 1, 1.8);
    };
    // workstations
    SEAT_IDS.forEach((id, n) => {
      const [, px, py] = SEATS[id];
      const [x, z] = toWorld(px, py);
      add(this.mesh(this.cyl(0.12, 0.12, 1.1, 10), P.metal, x, 0.75, z));
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + 0.3;
        const leg = this.mesh(
          this.box(0.9, 0.1, 0.16),
          P.metal,
          x + Math.cos(a) * 0.45,
          0.22,
          z + Math.sin(a) * 0.45,
        );
        leg.rotation.y = -a;
        add(leg);
        add(
          this.mesh(
            this.sphere(0.13, 8, 6),
            P.metal,
            x + Math.cos(a) * 0.88,
            0.13,
            z + Math.sin(a) * 0.88,
          ),
        );
      }
      add(this.mesh(this.rbox(2.1, 0.36, 2.0, 0.45, 0.12), P.chair, x, SEAT_Y - 0.18, z));
      add(this.mesh(this.rbox(2.0, 1.9, 0.34, 0.45, 0.12), P.chair, x, SEAT_Y + 1.0, z - 1.05));
      add(this.mesh(this.box(0.18, 0.9, 0.18), P.metal, x, SEAT_Y + 0.2, z - 1.0));
      blob(x, z, 3.2, 3.2);
      const dz = z + 3.3;
      add(this.mesh(this.rbox(3.9, 0.16, 2.4, 0.22, 0.06), P.desk, x, DESK_Y, dz));
      for (const [a, b] of [
        [-1.7, -1.0],
        [1.7, -1.0],
        [-1.7, 1.0],
        [1.7, 1.0],
      ] as const)
        add(
          this.mesh(
            this.cyl(0.07, 0.07, DESK_Y - 0.08, 8),
            P.metal,
            x + a,
            (DESK_Y - 0.08) / 2,
            dz + b,
          ),
        );
      add(this.mesh(this.box(3.4, 1.15, 0.06), P.deskSide, x, DESK_Y - 0.75, dz + 1.08));
      add(this.mesh(this.rbox(1.0, 1.7, 2.0, 0.12, 0.04), P.deskSide, x + 1.2, 0.95, dz));
      add(this.mesh(this.box(0.5, 0.06, 0.06), P.handle, x + 1.2, 1.5, dz - 1.02, false));
      blob(x, dz, 4.9, 3.6);
      const mz = dz + 0.75;
      add(this.mesh(this.rbox(1.0, 0.06, 0.6, 0.2, 0.02), P.monitor, x, DESK_Y + 0.11, mz));
      add(this.mesh(this.cyl(0.07, 0.07, 0.8, 8), P.monitor, x, DESK_Y + 0.5, mz + 0.05));
      add(this.mesh(this.rbox(2.5, 1.55, 0.14, 0.1, 0.04), P.monitor, x, DESK_Y + 1.45, mz));
      const screen = new THREE.MeshBasicMaterial({ color: 0xffffff, map: this.texture("screen") });
      const scr = new THREE.Mesh(
        this.geo("scrP", () => new THREE.PlaneGeometry(2.3, 1.35)),
        screen,
      );
      scr.position.set(x, DESK_Y + 1.45, mz - 0.075);
      scr.rotation.y = Math.PI;
      sc.add(scr);
      const led = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const ledMesh = new THREE.Mesh(this.box(0.9, 0.07, 0.03), led);
      ledMesh.position.set(x, DESK_Y + 0.75, mz + 0.085);
      sc.add(ledMesh);
      this.screens[id] = { screen, led };
      add(
        this.mesh(this.rbox(1.5, 0.09, 0.55, 0.08, 0.03), P.key, x - 0.15, DESK_Y + 0.12, dz - 0.5),
      );
      add(
        this.mesh(this.rbox(0.3, 0.1, 0.45, 0.14, 0.04), P.key, x + 1.05, DESK_Y + 0.12, dz - 0.45),
      );
      if (n % 3 !== 1) {
        add(this.mesh(this.cyl(0.24, 0.22, 0.48, 14), P.mug, x - 1.45, DESK_Y + 0.32, dz + 0.1));
        const handle = this.mesh(this.torus(0.15, 0.05), P.mug);
        handle.position.set(x - 1.7, DESK_Y + 0.32, dz + 0.1);
        handle.rotation.y = Math.PI / 2;
        add(handle);
      } else {
        add(
          this.mesh(
            this.lathe("dpot", [
              [0, 0],
              [0.28, 0],
              [0.34, 0.42],
              [0, 0.42],
            ]),
            P.pot,
            x - 1.45,
            DESK_Y + 0.08,
            dz + 0.3,
          ),
        );
        const l = this.mesh(leafGeo(), P.leaf, x - 1.45, DESK_Y + 0.8, dz + 0.3);
        l.scale.set(0.42, 0.5, 0.42);
        add(l);
      }
      if (id === "dana" || id === "eitan" || id === "tom")
        add(
          this.mesh(
            this.rbox(1.0, 0.05, 1.3, 0.05, 0.02),
            P.paper,
            x + 0.9,
            DESK_Y + 0.11,
            dz + 0.35,
          ),
        );
    });
    // Executive: rug, whiteboard, cabinet, plants
    add(this.mesh(this.rbox(29, 0.06, 10, 1.2, 0.025), P.rugExec, -1, 0.1, -16.4, false));
    add(this.mesh(this.rbox(29.6, 0.04, 10.6, 1.4, 0.015), P.rugExecEdge, -1, 0.085, -16.4, false));
    {
      const board = new THREE.Mesh(
        this.box(8, 3.2, 0.12),
        new THREE.MeshStandardMaterial({
          color: "#FFFFFF",
          map: this.texture("board"),
          roughness: 0.35,
        }),
      );
      board.position.set(-7.5, 3.05, -28.62);
      sc.add(board);
      add(this.mesh(this.box(8.3, 0.14, 0.22), P.frame, -7.5, 4.72, -28.58, false));
      add(this.mesh(this.box(8.3, 0.14, 0.22), P.frame, -7.5, 1.38, -28.58, false));
      add(this.mesh(this.box(0.14, 3.4, 0.22), P.frame, -11.62, 3.05, -28.58, false));
      add(this.mesh(this.box(0.14, 3.4, 0.22), P.frame, -3.38, 3.05, -28.58, false));
      add(this.mesh(this.box(4, 0.12, 0.5), P.frame, -7.5, 1.3, -28.35, false));
      cabinet(8, -27.6, 5.2, 2.2, 1.6);
      plant(-14, -26.8, 1.15);
      plant(12.3, -6.3, 0.9);
    }
    // Product Studio: mood board, shelf, plants
    {
      const mood = new THREE.Mesh(
        this.box(9, 3.4, 0.1),
        new THREE.MeshStandardMaterial({
          color: "#FFFFFF",
          map: this.texture("mood"),
          roughness: 0.8,
        }),
      );
      mood.position.set(-35, 3.0, -28.62);
      sc.add(mood);
      add(this.mesh(this.box(9.3, 0.16, 0.2), P.frame, -35, 4.78, -28.58, false));
      shelf(-22.5, -27.8, 5.4);
      plant(-45, -26.8, 1.1);
      plant(-18.6, -6.4, 0.85);
    }
    // Procurement: cabinets, binders, plant
    cabinet(20, -27.6, 6.2, 2.6, 1.6);
    cabinet(30.5, -27.6, 5.2, 1.6, 1.6);
    plant(33.3, -6.4, 0.9);
    for (let i = 0; i < 4; i++)
      add(
        this.mesh(
          this.box(0.3, 0.9, 0.75),
          P.books[i % P.books.length] ?? P.ink,
          28.5 + i * 0.42,
          2.05,
          -27.6,
        ),
      );
    // Order Assurance: printer and parcels
    {
      const px = -44.2;
      const pz = 25.8;
      add(this.mesh(this.rbox(2.6, 1.7, 2.2, 0.1, 0.04), P.cabinet, px, 0.85, pz));
      add(this.mesh(this.rbox(2.7, 1.15, 2.3, 0.25, 0.1), P.monitor, px, 2.27, pz));
      add(this.mesh(this.box(1.7, 0.05, 1.2), P.paper, px, 2.88, pz + 0.2, false));
      add(this.mesh(this.box(1.8, 0.12, 0.4), P.skirt, px, 2.1, pz + 1.18, false));
      add(
        this.mesh(
          this.sphere(0.08, 8, 6),
          new THREE.MeshBasicMaterial({ color: P.status.running }),
          px + 0.95,
          2.6,
          pz + 1.15,
        ),
      );
      blob(px, pz, 3.6, 3.2);
      for (const [x, z, w, h, d, y0] of [
        [-36, 26.2, 2.0, 1.4, 1.6, 0],
        [-33.8, 26.4, 1.6, 1.1, 1.4, 0],
        [-35.1, 26.2, 1.5, 1.0, 1.3, 1.4],
        [-38.4, 27, 1.3, 0.9, 1.1, 0],
      ] as const) {
        add(this.mesh(this.rbox(w, h, d, 0.06, 0.04), P.kraft, x, y0 + h / 2, z));
        add(this.mesh(this.box(w + 0.02, 0.025, 0.32), P.tape, x, y0 + h + 0.01, z, false));
      }
      blob(-35.5, 26.4, 6, 3);
      plant(-45.4, 6.3, 0.8);
    }
    // Customer Support: headset stand, plant, cabinet
    {
      const hx = -17.5;
      const hz = 26.5;
      add(this.mesh(this.cyl(0.5, 0.6, 0.1, 16), P.metal, hx, 0.05, hz));
      add(this.mesh(this.cyl(0.06, 0.06, 2.4, 8), P.metal, hx, 1.25, hz));
      for (let i = 0; i < 2; i++) {
        const t = this.mesh(this.torus(0.55, 0.09, Math.PI), P.ink);
        t.position.set(hx, 2.2 - i * 0.65, hz);
        t.rotation.y = Math.PI / 2;
        add(t);
      }
      plant(-29.6, 6.4, 0.8);
      cabinet(-25, 27.6, 4.6, 1.4, 1.4);
      const t = this.mesh(this.torus(0.62, 0.1, Math.PI), P.ink);
      t.position.set(-21.2, DESK_Y + 0.2, 23);
      t.rotation.x = -Math.PI / 2;
      add(t);
    }
    // Marketing
    shelf(-4, 27.6, 4.2);
    plant(-13.6, 6.4, 0.9);
    // Lounge
    add(this.mesh(this.cyl(4.6, 4.6, 0.05, 40), P.rug, 5.4, 0.09, 16.8, false));
    add(this.mesh(this.cyl(1.9, 1.9, 0.16, 32), P.desk, 5.5, 2.15, 17));
    add(this.mesh(this.cyl(0.18, 0.18, 2.1, 10), P.metal, 5.5, 1.05, 17));
    add(this.mesh(this.cyl(0.9, 0.9, 0.08, 20), P.metal, 5.5, 0.06, 17));
    blob(5.5, 17, 4.6, 4.6);
    for (const [x, z] of [
      [8.4, 14.6],
      [3.2, 20.2],
      [8.6, 19.8],
    ] as const) {
      add(this.mesh(this.cyl(0.85, 0.75, 0.3, 20), P.seat, x, 1.45, z));
      add(this.mesh(this.cyl(0.1, 0.1, 1.3, 8), P.metal, x, 0.65, z));
      add(this.mesh(this.cyl(0.55, 0.55, 0.06, 16), P.metal, x, 0.03, z));
      blob(x, z, 2, 2);
    }
    add(this.mesh(this.rbox(3.4, 2.4, 1.6, 0.12, 0.04), P.cabinet, 5.5, 1.2, 27.6));
    add(this.mesh(this.rbox(1.0, 1.2, 0.9, 0.12, 0.04), P.monitor, 4.6, 3.0, 27.5));
    add(this.mesh(this.cyl(0.18, 0.16, 0.36, 12), P.mug, 6.3, 2.58, 27.4));
    plant(9.2, 27.2, 0.9);
    // Engineering
    cabinet(30.5, 27.6, 5.6, 1.6, 1.4);
    plant(33.6, 6.4, 0.95);
    add(this.mesh(this.rbox(1.8, 3.2, 1.6, 0.1, 0.04), P.rack, 13.2, 1.6, 27.5));
    // machine rooms: racks with LED rows and cable trays
    const leds: Led[] = [];
    MACHINE_ROOMS.forEach(([y0, y1], ri) => {
      const [, z0] = toWorld(860, y0);
      const [, z1] = toWorld(970, y1);
      const n = 4;
      const len = z1 - z0 - 3.2;
      const sp = len / n;
      const face = new THREE.MeshStandardMaterial({
        color: "#FFFFFF",
        map: this.texture("rack"),
        roughness: 0.6,
      });
      for (let j = 0; j < n; j++) {
        const rz = z0 + 1.6 + sp * (j + 0.5);
        add(this.mesh(this.rbox(2.4, 4.4, sp - 0.35, 0.08, 0.04), P.rack, 40.2, 2.2, rz));
        const f = new THREE.Mesh(
          this.geo(`rackF${String(sp)}`, () => new THREE.PlaneGeometry(sp - 0.6, 4.1)),
          face,
        );
        f.position.set(41.42, 2.2, rz);
        f.rotation.y = Math.PI / 2;
        sc.add(f);
        for (let b = 0; b < 6; b++)
          for (let q = 0; q < 3; q++) {
            const bad = ri === 0 && j === 1 && b < 2;
            leds.push({
              x: 41.47,
              y: 3.95 - b * 0.64,
              z: rz - (sp - 0.6) / 2 + 0.35 + q * 0.26,
              kind: bad ? 2 : q === 2 && b === 3 ? 1 : 0,
              phase: (ri * 7 + j * 3 + b * 5 + q) % 7,
            });
          }
      }
      add(this.mesh(this.box(1.6, 0.08, len), P.tray, 40.2, 4.62, (z0 + z1) / 2));
      add(this.mesh(this.box(0.08, 0.3, len), P.tray, 39.44, 4.75, (z0 + z1) / 2));
      add(this.mesh(this.box(0.08, 0.3, len), P.tray, 40.96, 4.75, (z0 + z1) / 2));
      for (let c = 0; c < 3; c++)
        add(
          this.mesh(this.cyl(0.07, 0.07, len - 0.4, 6), P.ink, 39.8 + c * 0.2, 4.72, (z0 + z1) / 2),
        ).rotation.x = Math.PI / 2;
      blob(40.2, (z0 + z1) / 2, 4.4, len + 1);
    });
    const ledMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.085, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
      leds.length,
    );
    const m4 = new THREE.Matrix4();
    const c0 = new THREE.Color(P.leds[0]);
    leds.forEach((l, i) => {
      m4.makeTranslation(l.x, l.y, l.z);
      ledMesh.setMatrixAt(i, m4);
      ledMesh.setColorAt(i, c0);
    });
    ledMesh.instanceMatrix.needsUpdate = true;
    sc.add(ledMesh);
    this.leds = { mesh: ledMesh, list: leds, color: new THREE.Color() };
  }

  private bodyOf(shape: BotShape, bm: THREE.Material) {
    const g = new THREE.Group();
    if (shape === "dome") {
      const arc = Array.from({ length: 9 }, (_, i): [number, number] => {
        const a = ((i + 1) / 9) * (Math.PI / 2);
        return [Math.cos(a) * 1.5, 3.5 + Math.sin(a) * 1.45];
      });
      g.add(
        this.mesh(
          this.lathe("bdome", [
            [0, 1.0],
            [1.15, 1.0],
            [1.45, 1.25],
            [1.5, 1.6],
            [1.5, 3.5],
            ...arc,
          ]),
          bm,
        ),
      );
      return { g, top: 4.95, face: 3.25, fz: 1.5, hw: 1.5 };
    }
    if (shape === "capsule") {
      g.add(this.mesh(this.capsule(1.3, 2.1), bm, 0, 3.35));
      return { g, top: 5.75, face: 3.85, fz: 1.3, hw: 1.3 };
    }
    if (shape === "cube") {
      g.add(this.mesh(this.rbox(3.0, 3.7, 2.6, 0.75, 0.38), bm, 0, 2.85));
      return { g, top: 4.7, face: 3.25, fz: 1.3, hw: 1.5 };
    }
    if (shape === "orb") {
      const o = this.mesh(this.sphere(1.6, 28, 20), bm, 0, 2.75);
      o.scale.set(1, 0.98, 1);
      g.add(o);
      g.add(this.mesh(this.cyl(0.85, 1.0, 0.35, 24), bm, 0, 1.1));
      return { g, top: 4.33, face: 3.0, fz: 1.5, hw: 1.6 };
    }
    if (shape === "tv") {
      g.add(
        this.mesh(
          this.lathe("btor", [
            [0, 1.0],
            [1.05, 1.0],
            [1.2, 1.2],
            [1.2, 2.4],
            [0.9, 2.6],
            [0, 2.6],
          ]),
          bm,
        ),
      );
      g.add(this.mesh(this.rbox(3.3, 2.3, 2.4, 0.6, 0.32), bm, 0, 3.75));
      return { g, top: 4.9, face: 3.75, fz: 1.2, hw: 1.65 };
    }
    g.add(
      this.mesh(
        this.lathe("bpear", [
          [0, 1.0],
          [1.25, 1.0],
          [1.6, 1.35],
          [1.7, 1.9],
          [1.55, 2.6],
          [1.25, 3.3],
          [1.2, 3.8],
          [1.08, 4.35],
          [0.75, 4.8],
          [0.35, 5.02],
          [0, 5.06],
        ]),
        bm,
      ),
    );
    return { g, top: 5.06, face: 3.7, fz: 1.25, hw: 1.7 };
  }

  private buildBot(id: AgentId): Robot {
    const P = this.P;
    const [shape, colour, accessory] = BOTS[id];
    const [bc, tc] = P.body[colour];
    const group = new THREE.Group();
    const body = new THREE.Group();
    group.add(body);
    const bm = this.mat(bc, { roughness: 0.5 });
    const tm = this.mat(tc, { roughness: 0.55 });
    const K = P.ink;
    const AC = P.accent;
    const B = this.bodyOf(shape, bm);
    body.add(B.g);
    const band = new THREE.MeshBasicMaterial({ color: P.status.idle });
    const bandMesh = new THREE.Mesh(this.torus(1, 0.075), band);
    bandMesh.rotation.x = Math.PI / 2;
    bandMesh.scale.set(B.hw * 0.86, B.hw * 0.86, 1);
    bandMesh.position.y = 1.12;
    body.add(bandMesh);
    body.add(
      this.mesh(
        this.rbox(2.3, 1.28, 0.34, 0.56, 0.12),
        this.mat(P.visor, { roughness: 0.22, metalness: 0.1 }),
        0,
        B.face,
        B.fz - 0.12,
      ),
    );
    const eyes = new THREE.Group();
    eyes.position.set(0, B.face + 0.06, B.fz + 0.06);
    const eyeMat = new THREE.MeshBasicMaterial({ color: P.eye });
    for (const x of [-0.48, 0.48]) {
      const e = new THREE.Mesh(this.sphere(0.21, 14, 10), eyeMat);
      e.scale.set(1, 1.35, 0.5);
      e.position.x = x;
      eyes.add(e);
    }
    body.add(eyes);
    const mouth = new THREE.Mesh(this.torus(0.16, 0.035, Math.PI), eyeMat);
    mouth.rotation.z = Math.PI;
    mouth.position.set(0, B.face - 0.3, B.fz + 0.07);
    body.add(mouth);
    const arms = [-1, 1].map((s) => {
      const p = new THREE.Group();
      p.position.set(s * (B.hw + 0.12), 2.55, 0);
      p.add(this.mesh(this.capsule(0.24, 0.62), tm, 0, -0.55, 0));
      p.add(this.mesh(this.sphere(0.3, 14, 10), tm, 0, -1.1, 0));
      body.add(p);
      return p;
    }) as [THREE.Group, THREE.Group];
    const legs = [-1, 1].map((s) => {
      const p = new THREE.Group();
      p.position.set(s * 0.62, 1.15, 0);
      p.add(this.mesh(this.capsule(0.28, 0.45), tm, 0, -0.42, 0));
      p.add(this.mesh(this.rbox(0.72, 0.34, 0.95, 0.3, 0.1), tm, 0, -0.98, 0.12));
      group.add(p);
      return p;
    }) as [THREE.Group, THREE.Group];
    const H = new THREE.Group();
    H.position.set(0, -1.15, 0.15);
    arms[1].add(H);
    const T = B.top;
    let ring: THREE.Mesh | null = null;
    switch (accessory) {
      case "crown": {
        const cg = new THREE.Group();
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          cg.add(
            this.mesh(
              this.geo("crn", () => new THREE.ConeGeometry(0.2, 0.6, 8)),
              AC,
              Math.cos(a) * 0.62,
              0.38,
              Math.sin(a) * 0.62,
            ),
          );
          cg.add(
            this.mesh(this.sphere(0.09, 8, 6), AC, Math.cos(a) * 0.62, 0.72, Math.sin(a) * 0.62),
          );
        }
        cg.add(this.mesh(this.cyl(0.72, 0.72, 0.24, 24), AC, 0, 0, 0));
        cg.position.y = T - 0.05;
        body.add(cg);
        break;
      }
      case "lens": {
        const r = this.mesh(this.torus(0.4, 0.09), K);
        r.position.set(0, 0.55, 0.25);
        H.add(r);
        const gl = this.mesh(
          this.cyl(0.36, 0.36, 0.04, 20),
          this.mat("#FFFFFF", { transparent: true, opacity: 0.45, roughness: 0.1 }),
          0,
          0.55,
          0.25,
        );
        gl.rotation.x = Math.PI / 2;
        H.add(gl);
        H.add(this.mesh(this.cyl(0.07, 0.07, 0.6, 8), K, 0, 0, 0.25));
        break;
      }
      case "spiral": {
        body.add(this.mesh(this.cyl(0.05, 0.05, 0.8, 6), K, 0, T + 0.38, 0));
        const r = this.mesh(this.torus(0.24, 0.07), AC);
        r.position.set(0, T + 0.98, 0);
        body.add(r);
        break;
      }
      case "bow": {
        const b1 = this.mesh(
          this.geo("bow", () => new THREE.ConeGeometry(0.32, 0.6, 4)),
          AC,
        );
        b1.rotation.z = Math.PI / 2;
        b1.position.set(0.55, T - 0.25, 0.3);
        body.add(b1);
        const b2 = b1.clone();
        b2.rotation.z = -Math.PI / 2;
        b2.position.x = 1.15;
        body.add(b2);
        body.add(this.mesh(this.sphere(0.14, 8, 6), AC, 0.85, T - 0.25, 0.3));
        break;
      }
      case "scope": {
        const s = this.mesh(this.cyl(0.2, 0.28, 1.2, 12), "#EDEDEC", 0.7, T + 0.45, 0);
        s.rotation.z = -0.7;
        body.add(s);
        const e = this.mesh(this.cyl(0.3, 0.3, 0.1, 12), K, 1.12, T + 0.88, 0);
        e.rotation.z = -0.7;
        body.add(e);
        break;
      }
      case "pen": {
        const p = this.mesh(this.cyl(0.09, 0.09, 1.2, 8), AC, 0, 0.2, 0.3);
        p.rotation.x = 0.9;
        H.add(p);
        break;
      }
      case "brush": {
        const h = this.mesh(this.cyl(0.08, 0.08, 1.4, 8), K, 0, 0.35, 0.25);
        h.rotation.x = 0.5;
        H.add(h);
        const tip = this.mesh(this.cyl(0.2, 0.06, 0.45, 8), P.paper, 0, 1.0, 0.6);
        tip.rotation.x = 0.5;
        H.add(tip);
        break;
      }
      case "tag": {
        const t = this.mesh(this.rbox(0.6, 0.85, 0.08, 0.12, 0.02), P.paper, 0, -0.5, 0.2);
        t.rotation.z = 0.25;
        H.add(t);
        H.add(this.mesh(this.sphere(0.06, 6, 4), K, 0, -0.15, 0.25));
        break;
      }
      case "clip":
        H.add(this.mesh(this.rbox(0.95, 1.25, 0.1, 0.1, 0.03), P.paper, 0, 0.1, 0.35));
        H.add(this.mesh(this.box(0.45, 0.14, 0.14), K, 0, 0.72, 0.38));
        break;
      case "calc":
        body.add(this.mesh(this.rbox(1.0, 0.75, 0.14, 0.12, 0.04), K, 0, 1.85, B.fz - 0.12));
        break;
      case "parcel": {
        const pg = new THREE.Group();
        pg.add(this.mesh(this.rbox(1.5, 1.1, 1.3, 0.1, 0.05), P.kraft, 0, 0.55, 0));
        pg.add(this.mesh(this.box(1.52, 0.03, 0.3), P.tape, 0, 1.11, 0));
        pg.position.set(-2.4, 0, 0.6);
        group.add(pg);
        body.add(
          this.mesh(
            this.lathe("cap1", [
              [0, 0],
              [1.1, 0],
              [1.0, 0.35],
              [0.6, 0.62],
              [0, 0.7],
            ]),
            AC,
            0,
            T - 0.35,
            0,
          ),
        );
        body.add(this.mesh(this.box(1.2, 0.08, 0.8), AC, 0, T - 0.33, 0.95));
        break;
      }
      case "mega": {
        const m = this.mesh(
          this.geo("mega", () => new THREE.ConeGeometry(0.45, 1.0, 14, 1, true)),
          this.mat(P.paper, { side: THREE.DoubleSide }),
          0,
          0.3,
          0.5,
        );
        m.rotation.x = -Math.PI / 2;
        H.add(m);
        break;
      }
      case "headset": {
        const t = this.mesh(this.torus(B.hw + 0.08, 0.1, Math.PI), K);
        t.position.set(0, B.face + 0.15, 0);
        body.add(t);
        for (const s of [-1, 1]) {
          const e = this.mesh(
            this.cyl(0.32, 0.32, 0.22, 14),
            K,
            s * (B.hw + 0.08),
            B.face + 0.1,
            0,
          );
          e.rotation.z = Math.PI / 2;
          body.add(e);
        }
        const mic = this.mesh(this.cyl(0.05, 0.05, 1.1, 6), K, -(B.hw - 0.2), B.face - 0.45, 0.75);
        mic.rotation.x = 1.2;
        mic.rotation.z = 0.4;
        body.add(mic);
        body.add(this.mesh(this.sphere(0.11, 8, 6), AC, -(B.hw - 0.55), B.face - 0.7, 1.25));
        break;
      }
      case "code": {
        for (const x of [-0.6, 0.6]) {
          body.add(this.mesh(this.cyl(0.05, 0.05, 0.8, 6), K, x, T + 0.4, 0));
          body.add(this.mesh(this.sphere(0.16, 8, 6), AC, x, T + 0.85, 0));
        }
        const s = new THREE.Mesh(
          this.geo("codeP", () => new THREE.PlaneGeometry(1.2, 0.75)),
          new THREE.MeshBasicMaterial({ map: this.texture("code") }),
        );
        s.position.set(0, 1.95, B.fz + 0.03);
        body.add(s);
        break;
      }
      case "wrench": {
        const h = this.mesh(this.cyl(0.1, 0.1, 1.3, 8), "#3A3A3A", 0, 0.35, 0.25);
        h.rotation.x = 0.4;
        H.add(h);
        const r = this.mesh(this.torus(0.28, 0.09, Math.PI * 1.6), "#3A3A3A");
        r.position.set(0, 1.05, 0.5);
        r.rotation.x = 0.4;
        H.add(r);
        break;
      }
      case "ring":
        ring = this.mesh(this.torus(2.25, 0.07), AC);
        ring.position.y = 3.0;
        ring.rotation.x = Math.PI / 2.4;
        body.add(ring);
        break;
    }
    const shadow = new THREE.Mesh(
      this.geo("blobP", () => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)),
      new THREE.MeshBasicMaterial({
        map: this.texture("blob"),
        transparent: true,
        depthWrite: false,
      }),
    );
    shadow.scale.set(4.2, 1, 3.4);
    shadow.position.y = 0.09;
    shadow.renderOrder = 1;
    shadow.userData["shadow"] = true;
    group.add(shadow);
    group.traverse((o) => {
      if (o instanceof THREE.Mesh && o !== shadow) {
        o.userData["id"] = id;
        this.pick.push(o);
      }
    });
    group.scale.setScalar(CS);
    return {
      group,
      body,
      legs,
      arms,
      eyes,
      eyesY: eyes.position.y,
      mouth,
      band,
      ring,
      top: B.top,
      lookX: 0,
      lookY: 0,
    };
  }

  private disposeScene(): void {
    this.scene.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.InstancedMesh) {
        (o.geometry as THREE.BufferGeometry).dispose();
        const materials = Array.isArray(o.material)
          ? (o.material as THREE.Material[])
          : [o.material as THREE.Material];
        for (const m of materials) m.dispose();
      }
    });
    for (const g of this.geometries.values()) g.dispose();
    for (const m of this.materials.values()) m.dispose();
    for (const t of this.textures) t.dispose();
    this.geometries.clear();
    this.materials.clear();
    this.textures.length = 0;
    this.pick = [];
    this.leds = null;
  }

  /* ------------------------------------------------------------------ overlay */

  private buildOverlay(): void {
    const o = this.o;
    const overlay = o.overlay;
    overlay.replaceChildren();
    this.labels.length = 0;
    for (const id of ROOM_IDS) {
      const el = document.createElement("span");
      el.className = "fl-lb3";
      el.textContent = o.roomName(id);
      overlay.append(el);
      const r = ROOMS[id];
      this.labels.push({
        el,
        at: () => {
          const [x0, z0] = toWorld(r.x0, r.y0);
          const [x1, z1] = toWorld(r.x1, r.y1);
          return r.top
            ? [(x0 + x1) / 2, H_T + 0.7, z0 - 0.2]
            : [(x0 + x1) / 2, H_L + 0.55, z1 + 0.3];
        },
      });
    }
    MACHINE_ROOMS.forEach(([y0, y1], i) => {
      const el = document.createElement("span");
      el.className = "fl-lb3 fl-svc";
      el.textContent = o.serviceName(i);
      overlay.append(el);
      this.labels.push({
        el,
        at: () => {
          const [, z0] = toWorld(0, y0);
          const [, z1] = toWorld(0, y1);
          return [47.4, H_L + 0.6, (z0 + z1) / 2];
        },
      });
    });
    for (const id of SEAT_IDS) {
      const el = document.createElement("div");
      el.className = "fl-b3w";
      overlay.append(el);
      this.bubbles[id] = { el, key: "", w: 0 };
    }
    const tag = document.createElement("span");
    tag.className = "fl-tag3";
    overlay.append(tag);
    this.tag = tag;
  }

  private bubbleElement(b: Bubble): HTMLElement {
    const el = document.createElement("div");
    if (b.kind === "icon") {
      el.className = "fl-b3 fl-ic";
      el.append(iconSvg(b.icon));
      return el;
    }
    if (b.kind === "zz") {
      el.className = "fl-b3 fl-zz";
      el.textContent = "z z";
      return el;
    }
    el.className = `fl-b3 ${b.kind === "amber" ? "fl-amb" : b.kind === "red" ? "fl-red" : "fl-say"}`;
    el.textContent = this.o.text(b.text);
    if (b.kind !== "say") {
      el.dataset["go"] = b.go;
      el.setAttribute("role", "link");
      el.tabIndex = 0;
    }
    return el;
  }

  /* ------------------------------------------------------------------ frame */

  private resize(): void {
    const el = this.o.container;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w === this.width && h === this.height) return;
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h, false);
  }

  private setupCamera(dt: number): void {
    const c = this.camera;
    const k = dt > 0 ? 1 - Math.exp(-dt * 7) : 1;
    this.az += (this.target.az - this.az) * k;
    this.el += (this.target.el - this.el) * k;
    this.zoom += (this.target.zoom - this.zoom) * k;
    const az = (this.az * Math.PI) / 180;
    const elv = (this.el * Math.PI) / 180;
    const R = 160;
    const dir = new THREE.Vector3(
      Math.sin(az) * Math.cos(elv),
      Math.sin(elv),
      Math.cos(az) * Math.cos(elv),
    );
    c.up.set(0, 1, 0);
    c.position.copy(dir).multiplyScalar(R);
    c.lookAt(0, 0, 0);
    c.updateMatrixWorld();
    let x0 = 1e9;
    let x1 = -1e9;
    let y0 = 1e9;
    let y1 = -1e9;
    const v = new THREE.Vector3();
    for (const X of [-47.8, 47.8])
      for (const Z of [-29.8, 29.8])
        for (const Y of [-0.6, 3.2]) {
          v.set(X, Y, Z).applyMatrix4(c.matrixWorldInverse);
          x0 = Math.min(x0, v.x);
          x1 = Math.max(x1, v.x);
          y0 = Math.min(y0, v.y);
          y1 = Math.max(y1, v.y);
        }
    const aspect = this.width / Math.max(1, this.height);
    let hw = ((x1 - x0) / 2) * 1.035;
    let hh = ((y1 - y0) / 2) * 1.06;
    if (hw / hh > aspect) hh = hw / aspect;
    else hw = hh * aspect;
    const centre = new THREE.Vector3((x0 + x1) / 2, (y0 + y1) / 2, 0).applyMatrix4(c.matrixWorld);
    const target = this.focus ?? centre;
    if (this.look === null || dt <= 0) this.look = target.clone();
    else this.look.lerp(target, k);
    c.position.copy(this.look).addScaledVector(dir, R);
    c.lookAt(this.look);
    Object.assign(c, { left: -hw, right: hw, top: hh, bottom: -hh });
    c.zoom = this.zoom;
    c.updateProjectionMatrix();
  }

  private project(x: number, y: number, z: number): [number, number] {
    const v = this.projector.set(x, y, z).project(this.camera);
    return [((v.x + 1) / 2) * this.width, ((1 - v.y) / 2) * this.height];
  }

  private render(dt: number): void {
    if (this.width === 0 || this.height === 0) return;
    this.setupCamera(this.drag === null ? dt : Math.max(dt, 0.05) * 3);
    const S = this.o.script;
    const P = this.P;
    const T = S.time;
    const RT = performance.now() / 1000;
    for (const id of SEAT_IDS) {
      const a = S.actors[id];
      const b = this.robots[id];
      const status = AGENTS.find((x) => x.id === id)?.status ?? "idle";
      const [x, z] = toWorld(a.x, a.y);
      b.group.position.x = x;
      b.group.position.z = z;
      let ry = b.group.rotation.y;
      if (a.walk !== null) {
        const p = a.walk.points[a.walk.index];
        if (p !== undefined) {
          const [tx, tz] = toWorld(p[0], p[1]);
          if (Math.hypot(tx - x, tz - z) > 0.05) ry = Math.atan2(tx - x, tz - z);
        }
      } else if (a.look !== null) {
        const other = S.actors[a.look];
        const [ox, oz] = toWorld(other.x, other.y);
        ry = Math.atan2(ox - x, oz - z);
      } else if (a.seated) ry = 0;
      else if (id === "omer") ry = Math.PI * 0.3;
      let d = ry - b.group.rotation.y;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      b.group.rotation.y += d * 0.2;
      const working = a.seated && status === "running";
      const off = status === "offline";
      const ph = T * 9.5 + a.phase;
      let bob = 0;
      const [armL, armR] = b.arms;
      const [legL, legR] = b.legs;
      if (a.walk !== null) {
        const s = Math.sin(ph);
        legL.rotation.x = s * 0.75;
        legR.rotation.x = -s * 0.75;
        armL.rotation.x = -s * 0.6;
        armR.rotation.x = s * 0.6;
        armL.rotation.z = -0.08;
        armR.rotation.z = 0.08;
        bob = Math.abs(Math.cos(ph)) * 0.22;
        b.body.rotation.z = Math.sin(ph) * 0.05;
        b.body.rotation.x = 0.06;
        b.group.position.y = 0;
      } else {
        b.body.rotation.z = 0;
        if (a.seated) {
          legL.rotation.x = -Math.PI / 2;
          legR.rotation.x = -Math.PI / 2;
          b.group.position.y = SEAT_Y + (0.3 - 1.15) * CS;
          b.body.rotation.x = 0.04;
          if (working) {
            const s = Math.sin(T * 15 + a.phase);
            armL.rotation.x = -1.2 + s * 0.12;
            armR.rotation.x = -1.2 - s * 0.12;
            bob = Math.abs(s) * 0.05;
          } else if (off) {
            armL.rotation.x = -0.25;
            armR.rotation.x = -0.25;
            b.body.rotation.x = 0.22;
          } else {
            armL.rotation.x = -0.85;
            armR.rotation.x = -0.85 + Math.sin(T * 1.3 + a.phase) * 0.05;
            bob = Math.sin(T * 1.6 + a.phase) * 0.04;
          }
          armL.rotation.z = 0;
          armR.rotation.z = 0;
        } else {
          b.group.position.y = 0;
          legL.rotation.x = 0;
          legR.rotation.x = 0;
          b.body.rotation.x = 0;
          armL.rotation.x = Math.sin(T * 1.4 + a.phase) * 0.06;
          armR.rotation.x = -Math.sin(T * 1.4 + a.phase) * 0.06;
          armL.rotation.z = -0.12;
          armR.rotation.z = 0.12;
          bob = Math.sin(T * 1.6 + a.phase) * 0.05;
        }
        if (a.say !== null) {
          armR.rotation.x = -1.0 + Math.sin(T * 5 + a.phase) * 0.25;
          armR.rotation.z = 0.35 + Math.sin(T * 3.3) * 0.2;
          b.body.rotation.x += Math.sin(T * 6) * 0.03;
        }
      }
      b.body.position.y = bob;
      b.body.scale.y = 1 + Math.sin(T * 1.6 + a.phase) * 0.012;
      const blink = (T + a.phase) % 4.2 < 0.13 || off;
      b.eyes.scale.y = blink ? (off ? 0.12 : 0.15) : 1;
      const seg = Math.floor((RT + a.phase * 2) / 2.6);
      let lx = (hash01(seg + a.phase * 10) - 0.5) * 0.32;
      let ly = (hash01(seg * 1.7 + a.phase) - 0.5) * 0.16;
      if (a.look !== null || a.walk !== null) {
        lx = 0;
        ly = 0.02;
      }
      if (working) {
        ly = -0.07;
        lx = Math.sin(T * 0.8 + a.phase) * 0.08;
      }
      b.lookX += (lx - b.lookX) * 0.12;
      b.lookY += (ly - b.lookY) * 0.12;
      b.eyes.position.x = b.lookX;
      b.eyes.position.y = b.eyesY + b.lookY;
      b.mouth.scale.set(1, a.say !== null ? 1 + Math.abs(Math.sin(T * 11)) * 0.8 : 1, 1);
      if (b.ring !== null) b.ring.rotation.z = T * 1.4;
      b.band.color.setHex(P.status[status]);
      if (status === "failed" || status === "waityou")
        b.band.color.multiplyScalar(0.6 + 0.4 * Math.abs(Math.sin(T * 3)));
      const sc = this.screens[id];
      sc.screen.color.setHex(a.seated ? P.screen[status] : P.screen.idle);
      if (status === "running" && a.seated)
        sc.screen.color.multiplyScalar(0.9 + 0.1 * Math.sin(T * 3 + a.phase));
      sc.led.color.setHex(P.status[status]);
    }
    if (this.leds !== null) {
      const { mesh, list, color } = this.leds;
      const L = P.leds;
      list.forEach((l, i) => {
        const hex =
          l.kind === 2
            ? Math.floor(T * 4) % 2
              ? L[4]
              : L[5]
            : l.kind === 1
              ? Math.floor(T * 2.2 + l.phase) % 4 < 2
                ? L[2]
                : L[3]
              : Math.floor(T * 2.2 + l.phase) % 5
                ? L[0]
                : L[1];
        color.setHex(hex);
        mesh.setColorAt(i, color);
      });
      if (mesh.instanceColor !== null) mesh.instanceColor.needsUpdate = true;
    }
    if (this.spark !== null) {
      const [nx, nz] = toWorld(SEATS.nika[1], SEATS.nika[2]);
      const k = (T * 1.2) % 1;
      this.spark.position.set(nx + 0.8 + Math.sin(T * 5) * 0.6, 5.2 + k * 2.4, nz + 0.6);
      this.spark.scale.setScalar(1 - k);
    }
    this.renderer.render(this.scene, this.camera);
    this.placeOverlay();
  }

  /** Room labels are fixed obstacles; bubbles avoid them and each other; faults win. */
  private placeOverlay(): void {
    const S = this.o.script;
    const placedLabels: { x: number; y: number; w: number; el: HTMLElement }[] = [];
    for (const label of this.labels) {
      const [x, y] = this.project(...label.at());
      label.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%)`;
      label.el.style.visibility = "";
      placedLabels.push({ x, y, w: label.el.offsetWidth || 80, el: label.el });
    }
    const items: {
      id: AgentId;
      el: HTMLElement;
      p: [number, number];
      pri: number;
      w: number;
      h: number;
    }[] = [];
    for (const id of SEAT_IDS) {
      const bubble = S.bubble(id);
      const slot = this.bubbles[id];
      const key = bubble === null ? "" : JSON.stringify(bubble);
      if (slot.key !== key) {
        slot.key = key;
        slot.el.replaceChildren();
        if (bubble !== null) slot.el.append(this.bubbleElement(bubble));
        slot.w = (slot.el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
      }
      if (bubble === null) {
        slot.el.style.display = "none";
        continue;
      }
      slot.el.style.display = "";
      if (slot.w === 0)
        slot.w = (slot.el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
      const robot = this.robots[id];
      const p = this.project(
        robot.group.position.x,
        robot.group.position.y + robot.top * CS + 1.0,
        robot.group.position.z,
      );
      const pri =
        bubble.kind === "red" || bubble.kind === "amber" ? 3 : bubble.kind === "say" ? 2 : 1;
      items.push({ id, el: slot.el, p, pri, w: slot.w + 6, h: 26 });
    }
    items.sort((a, b) => b.pri - a.pri);
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    const overlaps = (
      x: number,
      y: number,
      w: number,
      h: number,
      q: { x: number; y: number; w: number; h: number },
    ) => Math.abs(q.x - x) < (q.w + w) / 2 && Math.abs(q.y - (y - 13)) < (q.h + h) / 2;
    for (const it of items) {
      let y = it.p[1];
      let ok = false;
      for (const dy of [0, -28, -56, -84]) {
        const yy = y + dy;
        if (placed.some((q) => overlaps(it.p[0], yy, it.w, it.h, q))) continue;
        const hits = placedLabels.filter(
          (q) =>
            Math.abs(q.x - it.p[0]) < (q.w + it.w) / 2 &&
            Math.abs(q.y - (yy - 13)) < (24 + it.h) / 2,
        );
        if (hits.length > 0 && it.pri < 3) continue;
        for (const q of hits) q.el.style.visibility = "hidden";
        y = yy;
        ok = true;
        break;
      }
      if (!ok) {
        if (it.pri < 3) {
          it.el.style.display = "none";
          continue;
        }
        y = it.p[1];
      }
      const cx = Math.max(it.w / 2 + 6, Math.min(this.width - it.w / 2 - 6, it.p[0]));
      y = Math.max(34, y);
      placed.push({ x: cx, y: y - 13, w: it.w, h: it.h });
      it.el.style.display = "";
      it.el.style.setProperty("--ld", `${Math.max(0, it.p[1] - y).toFixed(0)}px`);
      it.el.style.transform = `translate(${cx.toFixed(1)}px,${y.toFixed(1)}px)`;
    }
    const tag = this.tag;
    if (tag !== null) {
      if (this.hover === null) tag.style.display = "none";
      else {
        const g = this.robots[this.hover].group;
        const [x, y] = this.project(g.position.x, 0, g.position.z + 2);
        tag.textContent = this.o.agentName(this.hover);
        tag.style.display = "flex";
        tag.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,0)`;
      }
    }
  }

  /* ------------------------------------------------------------------ input */

  private bind(): void {
    const cv = this.renderer.domElement;
    const ray = new THREE.Raycaster();
    const m = new THREE.Vector2();
    const setRay = (e: MouseEvent) => {
      const r = cv.getBoundingClientRect();
      m.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(m, this.camera);
    };
    const hitAt = (e: MouseEvent): AgentId | null => {
      setRay(e);
      const hit = ray.intersectObjects(this.pick, false)[0];
      const id = hit?.object.userData["id"] as AgentId | undefined;
      return id ?? null;
    };
    const kick = () => {
      if (!this.running) this.render(0.05);
    };
    const on = <K extends keyof HTMLElementEventMap>(
      el: HTMLElement,
      type: K,
      fn: (e: HTMLElementEventMap[K]) => void,
      opts?: AddEventListenerOptions,
    ) => {
      el.addEventListener(type, fn, opts);
      this.cleanup.push(() => {
        el.removeEventListener(type, fn, opts);
      });
    };
    on(cv, "pointerdown", (e) => {
      this.drag = {
        x: e.clientX,
        y: e.clientY,
        az: this.target.az,
        el: this.target.el,
        moved: false,
      };
      cv.setPointerCapture(e.pointerId);
    });
    on(cv, "pointermove", (e) => {
      if (this.drag !== null) {
        const dx = e.clientX - this.drag.x;
        const dy = e.clientY - this.drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) this.drag.moved = true;
        this.target.az = Math.max(8, Math.min(82, this.drag.az - dx * 0.18));
        this.target.el = Math.max(22, Math.min(62, this.drag.el + dy * 0.14));
        kick();
        return;
      }
      const id = hitAt(e);
      this.hover = id;
      cv.style.cursor = id === null ? "grab" : "pointer";
      kick();
    });
    on(cv, "pointerup", (e) => {
      const d = this.drag;
      this.drag = null;
      if (d !== null && !d.moved) {
        const id = hitAt(e);
        if (id !== null) this.o.onAgent(id);
      }
    });
    on(cv, "pointerleave", () => {
      this.hover = null;
    });
    on(cv, "dblclick", (e) => {
      setRay(e);
      const p = new THREE.Vector3();
      if (ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), p) === null)
        return;
      const room = roomAt(p.x, p.z);
      if (room === null) {
        this.resetView();
        return;
      }
      const [x, z] = toWorld(room[0], room[1]);
      this.focus = new THREE.Vector3(x, 1.5, z);
      this.target.zoom = 2.25;
    });
    on(
      cv,
      "wheel",
      (e) => {
        e.preventDefault();
        this.target.zoom = Math.max(
          0.9,
          Math.min(3.2, this.target.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12)),
        );
      },
      { passive: false },
    );
    const goFrom = (e: Event) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-go]");
      const to = el?.dataset["go"];
      if (to !== undefined) this.o.onGo(to);
    };
    on(this.o.overlay, "click", goFrom);
    on(this.o.overlay, "keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") goFrom(e);
    });
  }
}

/** The centre of the room (or machine room) under a world point, in plan units. */
function roomAt(wx: number, wz: number): [number, number] | null {
  const px = (wx + 50) * 10;
  const py = (wz + 32) * 10;
  for (const id of ROOM_IDS) {
    const r = ROOMS[id];
    if (px >= r.x0 && px <= r.x1 && py >= r.y0 && py <= r.y1)
      return [(r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2];
  }
  const s = MACHINE_ROOMS.find(([a, b]) => px >= 860 && px <= 970 && py >= a && py <= b);
  return s === undefined ? null : [915, (s[0] + s[1]) / 2];
}

function roundedRect(w: number, d: number, radius: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -d / 2;
  const r = Math.max(0.001, Math.min(radius, w / 2 - 0.001, d / 2 - 0.001));
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d);
  s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Merge static meshes by material: a few draw calls for the whole building. */
function mergeStatic(scene: THREE.Scene, roots: THREE.Object3D[]): void {
  const groups = new Map<
    string,
    { material: THREE.Material; cast: boolean; order: number; geometries: THREE.BufferGeometry[] }
  >();
  const meshes: THREE.Mesh[] = [];
  for (const root of roots) {
    root.updateMatrixWorld(true);
    root.traverse((c) => {
      if (c instanceof THREE.Mesh) meshes.push(c as THREE.Mesh);
    });
  }
  for (const m of meshes) {
    const source = m.geometry;
    const g = source.index !== null ? source.toNonIndexed() : source.clone();
    g.applyMatrix4(m.matrixWorld);
    const material = m.material as THREE.Material;
    const key = `${material.uuid}|${m.castShadow ? "1" : "0"}|${String(m.renderOrder)}`;
    let entry = groups.get(key);
    if (entry === undefined) {
      entry = { material, cast: m.castShadow, order: m.renderOrder, geometries: [] };
      groups.set(key, entry);
    }
    entry.geometries.push(g);
  }
  for (const { material, cast, order, geometries } of groups.values()) {
    let n = 0;
    for (const g of geometries) n += g.attributes["position"]?.count ?? 0;
    const pos = new Float32Array(n * 3);
    const nor = new Float32Array(n * 3);
    const uv = new Float32Array(n * 2);
    let offset = 0;
    for (const g of geometries) {
      const p = g.attributes["position"];
      if (p === undefined) continue;
      pos.set(p.array, offset * 3);
      const normal = g.attributes["normal"];
      if (normal !== undefined) nor.set(normal.array, offset * 3);
      const coords = g.attributes["uv"];
      if (coords !== undefined) uv.set(coords.array, offset * 2);
      offset += p.count;
      g.dispose();
    }
    const merged = new THREE.BufferGeometry();
    merged.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    merged.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    merged.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    const mesh = new THREE.Mesh(merged, material);
    mesh.castShadow = cast;
    mesh.receiveShadow = !material.transparent;
    mesh.renderOrder = order;
    scene.add(mesh);
  }
}

const SVG = "http://www.w3.org/2000/svg";

/** The small status icons in bubbles (the demo's `ICB`), drawn with the tokens. */
function iconSvg(icon: "doc" | "blocked" | "hour" | "clock"): SVGSVGElement {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", "-6 -6 12 12");
  svg.setAttribute("width", "12");
  svg.setAttribute("height", "12");
  svg.setAttribute("aria-hidden", "true");
  const add = (tag: string, attrs: Record<string, string>) => {
    const el = document.createElementNS(SVG, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    svg.append(el);
  };
  if (icon === "blocked")
    add("rect", {
      x: "-3.5",
      y: "-3.5",
      width: "7",
      height: "7",
      rx: "1",
      fill: "var(--text-primary)",
    });
  if (icon === "hour")
    add("path", {
      d: "M-3.5-4.5h7M-3.5 4.5h7M-2.8-4.5c0 3 5.6 3 5.6 6s-5.6 3-5.6 3M2.8-4.5c0 3-5.6 3-5.6 6",
      fill: "none",
      stroke: "var(--info-dot)",
      "stroke-width": "1.2",
    });
  if (icon === "clock") {
    add("circle", {
      r: "4.3",
      fill: "none",
      stroke: "var(--text-secondary)",
      "stroke-width": "1.2",
    });
    add("path", {
      d: "M0-2.5V0l1.8 1.2",
      fill: "none",
      stroke: "var(--text-secondary)",
      "stroke-width": "1.2",
      "stroke-linecap": "round",
    });
  }
  if (icon === "doc")
    add("path", {
      d: "M-3.5-4.5h4.5l2.5 2.5v6.5h-7z",
      fill: "var(--bg-card)",
      stroke: "var(--text-primary)",
      "stroke-width": "1",
    });
  return svg;
}
