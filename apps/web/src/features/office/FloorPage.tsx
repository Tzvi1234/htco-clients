import "./floor.css";

import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react/macro";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { AgentCard } from "./ChatPage.tsx";
import { OfficeScript } from "./floor3d/engine.ts";
import { ROOMS } from "./floor3d/plan.ts";
import type { OfficeScene } from "./floor3d/scene.ts";
import { hasWebGL } from "./floor3d/webgl.ts";
import floorRender from "../../assets/hero/hero11.webp";
import {
  AGENTS,
  DEPTS,
  SERVICES,
  agent,
  badge,
  dept,
  type AgentId,
  type DeptId,
} from "../../shared/demo/office.ts";
import { cx } from "../../shared/lib/cx.ts";
import { REDUCED_MOTION_QUERY, useMediaQuery } from "../../shared/lib/useMediaQuery.ts";
import { useTweaks } from "../../shared/theme/ThemeProvider.tsx";
import { GearIcon, GridIcon, SearchIcon } from "../../shared/ui/icons.tsx";
import { useToast } from "../../shared/ui/Toast.tsx";
import { Panel, PanelBody, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  AGENT_STATUSES,
  Avatar,
  Avatars,
  BackGlyph,
  Chip,
  CircleButton,
  DemoFrame,
  IdBlock,
  KV,
  ListRow,
  Matrix,
  MoveGlyph,
  N,
  NextGlyph,
  PILL,
  PauseGlyph,
  PlayGlyph,
  Screen,
  Stack,
  Status,
  Strip,
  StripCard,
  Zoom,
  initialOf,
} from "../../shared/ui/kit/index.ts";

/**
 * Office › Floor (Design 1C `P.floor`), a demo frame: the living office as a 3D map where the
 * sample employees work, walk to each other and talk, with a legend and a live ticker; or the
 * list view with the floor render, departments and every employee. three.js loads only here.
 */
export function FloorPage() {
  const { t } = useLingui();
  const [webgl] = useState(hasWebGL);
  const [mode, setMode] = useState<"map" | "list">(() => (hasWebGL() ? "map" : "list"));
  const view = webgl ? mode : "list";
  const modes = (
    <div className="k-seg" role="radiogroup" aria-label={t`View`} data-demo-view="">
      {(["map", "list"] as const).map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={view === m}
          disabled={m === "map" && !webgl}
          className={view === m ? "k-on" : undefined}
          onClick={() => {
            setMode(m);
          }}
        >
          {m === "map" ? t`Map` : t`List`}
        </button>
      ))}
    </div>
  );
  return (
    <DemoFrame title={t({ message: "Floor", context: "navigation" })} views>
      {view === "map" ? <LiveMap modes={modes} /> : <FloorList modes={modes} noWebgl={!webgl} />}
    </DemoFrame>
  );
}

/* ------------------------------------------------------------------ the live 3D map */

function LiveMap({ modes }: { modes: ReactNode }) {
  const { t, i18n } = useLingui();
  const still = useMediaQuery(REDUCED_MOTION_QUERY);
  const { tweaks } = useTweaks();
  const palette = tweaks.palette === "d4" ? "d4" : "sbb";
  const script = useMemo(() => new OfficeScript(), []);
  const [playing, setPlaying] = useState(!still);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const container = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const scene = useRef<OfficeScene | null>(null);
  const [failed, setFailed] = useState(false);
  const log = useSyncExternalStore(
    (listener) => script.subscribe(listener),
    () => script.log,
  );

  useEffect(() => {
    script.setPlaying(playing && !still);
    script.setSpeed(speed);
  }, [script, playing, speed, still]);

  // Keep the latest callbacks for the scene without rebuilding it.
  const toast = useToast();
  const latest = useRef({ t: i18n, toast, still });
  useEffect(() => {
    latest.current = { t: i18n, toast, still };
  }, [i18n, toast, still]);

  useEffect(() => {
    let cancelled = false;
    let created: OfficeScene | null = null;
    void import("./floor3d/scene.ts")
      .then(({ OfficeScene: Scene }) => {
        if (cancelled || container.current === null || overlay.current === null) return;
        const text = (m: MessageDescriptor) => latest.current.t._(m);
        created = new Scene({
          container: container.current,
          overlay: overlay.current,
          palette,
          script,
          text,
          roomName: (room) => latest.current.t._(ROOMS[room].name),
          serviceName: (index) => {
            const service = SERVICES[index];
            return service === undefined ? "" : latest.current.t._(service.name);
          },
          agentName: (id) => latest.current.t._(agent(id).name),
          // A demo frame: robots and status bubbles do not pretend to open anything.
          onAgent: () => {
            latest.current.toast(latest.current.t._(COMING_SOON));
          },
          onGo: () => {
            latest.current.toast(latest.current.t._(COMING_SOON));
          },
          // The setting now, which may have changed while the module was loading.
          still: latest.current.still,
        });
        scene.current = created;
        created.start();
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      created?.dispose();
      scene.current = null;
    };
    // The scene is built once per mount; palette and language changes are applied below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script]);

  useEffect(() => {
    scene.current?.setPalette(palette);
  }, [palette]);

  // The system's reduced-motion setting can change while the map is open.
  useEffect(() => {
    scene.current?.setStill(still);
  }, [still]);

  useEffect(() => {
    scene.current?.relabel();
  }, [i18n.locale]);

  useEffect(() => {
    if (still && script.log.length === 0) script.logEvent(REDUCED);
  }, [still, script]);

  const counts = (status: (typeof AGENT_STATUSES)[number]) =>
    AGENTS.filter((a) => a.status === status).length;

  return (
    <Screen layout="l1">
      <Panel className="relative">
        <PanelHeader
          title={t`Floor 1 · live`}
          meta={
            <span className="fl-head-extra">{t`16 employees · 7 departments · 3 machine rooms`}</span>
          }
          actions={
            <div className="flex items-center gap-1" data-demo-view="">
              {modes}
              <span className="w-2" />
              <button
                type="button"
                className={cx(PILL, "fl-head-extra hover:border-line-hover hover:bg-hover")}
                aria-label={t`Speed ${speed}×`}
                onClick={() => {
                  setSpeed(speed === 1 ? 2 : 1);
                }}
              >
                <N>{`${String(speed)}×`}</N>
              </button>
              <CircleButton
                label={t`Reset view`}
                icon={<MoveGlyph />}
                onClick={() => {
                  scene.current?.resetView();
                }}
              />
              <CircleButton
                label={playing ? t`Pause` : t`Play`}
                icon={playing ? <PauseGlyph /> : <PlayGlyph />}
                active={!playing}
                onClick={() => {
                  setPlaying(!playing);
                }}
              />
            </div>
          }
        />
        <div className="fl-map" ref={container} dir="ltr" data-demo-view="">
          <div className="fl-overlay" ref={overlay} />
          {failed ? (
            <p className="absolute inset-0 m-0 grid place-items-center text-body-sm text-muted">
              {t`The 3D map could not load. Use the list view.`}
            </p>
          ) : null}
        </div>
        <section className="fl-flo fl-legend" aria-label={t`Legend`}>
          <PanelHeader title={t`Legend`} meta={t`Drag to orbit · double-click a room`} />
          <div className="fl-lgd">
            {AGENT_STATUSES.map((status) => (
              <div key={status}>
                <Status status={status} live />
                <span className="ltr text-muted">{counts(status)}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="fl-flo fl-ticker" aria-label={t`Live activity`}>
          <PanelHeader
            title={t`Live activity`}
            actions={
              <Status
                className="me-2"
                status={playing && !still ? "running" : "idle"}
                label={playing && !still ? t`Live` : t`Paused`}
                live
              />
            }
          />
          <ol aria-live="polite">
            {log.length === 0 ? (
              <li className="py-3 text-caption text-muted">{t`The office is waking up…`}</li>
            ) : (
              log.map((entry) => (
                <li key={entry.id} className="k-tl">
                  <span className="k-tm ltr">{entry.time}</span>
                  <span className="text-body-sm">{i18n._(entry.text)}</span>
                </li>
              ))
            )}
          </ol>
        </section>
      </Panel>
    </Screen>
  );
}

const REDUCED = msg`Reduced motion · static view`;
const COMING_SOON = msg`Demo — coming soon`;

/* ------------------------------------------------------------------ the list view */

/** Where each department's hotspot sits on the floor render (fractions of its size). */
const SPOTS: Record<DeptId, readonly [number, number]> = {
  exec: [0.62, 0.335],
  studio: [0.2, 0.4],
  proc: [0.405, 0.2],
  oa: [0.335, 0.7],
  mkt: [0.155, 0.62],
  cs: [0.585, 0.74],
  eng: [0.79, 0.6],
};
const SERVICE_SPOTS: readonly (readonly [number, number])[] = [
  [0.775, 0.135],
  [0.79, 0.285],
  [0.8, 0.42],
];

function FloorList({ modes, noWebgl }: { modes: ReactNode; noWebgl: boolean }) {
  const { t } = useLingui();
  const [deptId, setDept] = useState<DeptId>("exec");
  const [agentId, setAgent] = useState<AgentId>("maya");
  const [page, setPage] = useState<0 | 1>(0);
  const d = dept(deptId);
  const members = AGENTS.filter((a) => a.dept === deptId);
  const count = (status: string) => members.filter((m) => m.status === status).length;
  const pick = (id: DeptId) => {
    const first = AGENTS.find((a) => a.dept === id);
    setDept(id);
    if (first !== undefined) {
      setAgent(first.id);
      setPage(AGENTS.indexOf(first) > 7 ? 1 : 0);
    }
  };
  const step = (by: number) => {
    const i = DEPTS.findIndex((x) => x.id === deptId);
    const next = DEPTS[(i + by + DEPTS.length) % DEPTS.length];
    if (next !== undefined) pick(next.id);
  };
  const shown = AGENTS.slice(page * 8, page * 8 + 8);
  return (
    <Screen layout="l3s" data-demo-view="">
      <Panel className="max-sm:hidden">
        <PanelHeader
          title={t`Department details`}
          actions={<CircleButton label={t`Department settings`} icon={<GearIcon />} />}
        />
        <PanelBody className="justify-between">
          <IdBlock label={t`Department:`} value={t(d.name)} />
          <KV
            items={[
              [t`Code`, <N key="c">{d.code}</N>],
              [t`Members`, <N key="m">{members.length}</N>],
              [t`Running now`, <N key="r">{count("running")}</N>],
              [t`Waiting for you`, <N key="w">{count("waityou")}</N>],
            ]}
          />
          <Matrix
            top={t`Department load`}
            start={t`Quality`}
            end={t`Speed`}
            bottom={t`Cost`}
            value={deptId === "eng" ? "64" : deptId === "oa" ? "41" : "80"}
            caption={t`Stable performance`}
          />
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader
          title={t`Floor 1`}
          meta={<span className="fl-head-extra">{t`7 departments · 3 service`}</span>}
          actions={
            <div className="flex items-center gap-1">
              {noWebgl ? <Chip>{t`No WebGL · list view`}</Chip> : null}
              {modes}
              <span className="w-1" />
              <CircleButton label={t`Full screen`} icon={<MoveGlyph />} />
            </div>
          }
        />
        <div className="k-stage px-[72px] pb-6 max-sm:px-4">
          <div className="fl-floor">
            <img src={floorRender} alt={t`Office floor`} />
            {DEPTS.map((x) => {
              const [left, top] = SPOTS[x.id];
              const people = AGENTS.filter((a) => a.dept === x.id);
              return (
                <button
                  key={x.id}
                  type="button"
                  aria-pressed={x.id === deptId}
                  className={cx("fl-hs", x.id === deptId && "k-on")}
                  // eslint-disable-next-line htco/logical-properties -- a spot on the floor render, a picture that does not mirror
                  style={{ left: `${String(left * 100)}%`, top: `${String(top * 100)}%` }}
                  onClick={() => {
                    pick(x.id);
                  }}
                >
                  <Avatars size="xs" initials={people.map((p) => initialOf(t(p.name)))} />
                  <span className="max-sm:hidden">{t(x.name)}</span>
                </button>
              );
            })}
            {SERVICES.map((s, i) => {
              const [left, top] = SERVICE_SPOTS[i] ?? [0, 0];
              return (
                <span
                  key={i}
                  className="fl-hs fl-svc max-sm:hidden"
                  // eslint-disable-next-line htco/logical-properties -- a spot on the floor render, a picture that does not mirror
                  style={{ left: `${String(left * 100)}%`, top: `${String(top * 100)}%` }}
                >
                  {t(s.name)}
                </span>
              );
            })}
          </div>
          <CircleButton
            className="k-side k-s"
            label={t`Previous department`}
            icon={<BackGlyph />}
            onClick={() => {
              step(-1);
            }}
          />
          <CircleButton
            className="k-side k-e"
            label={t`Next department`}
            icon={<NextGlyph />}
            onClick={() => {
              step(1);
            }}
          />
        </div>
      </Panel>

      <Stack className="max-sm:hidden">
        <AgentCard id={agentId} title={t`Claude · model`} />
        <Panel>
          <PanelHeader
            title={t`Service departments`}
            actions={<CircleButton label={t`Automations`} icon={<NextGlyph />} />}
          />
          <PanelBody className="justify-center pt-0">
            {SERVICES.map((s) => (
              <ListRow
                key={s.items}
                lead={
                  <span
                    className="k-hatch size-10 shrink-0 rounded-[12px] border border-dashed border-line-hover"
                    aria-hidden="true"
                  />
                }
                title={
                  <span className="flex justify-between gap-2">
                    {t(s.name)}
                    <Status status={s.status} live />
                  </span>
                }
                line={<N>{s.items.split(" · ").slice(0, 2).join(" · ")}</N>}
              />
            ))}
          </PanelBody>
        </Panel>
      </Stack>

      <Strip
        title={t`All employees`}
        meta={<N>{page === 1 ? "9–16 / 16" : "1–8 / 16"}</N>}
        zoom={<Zoom page={page} onPage={setPage} labels={{ less: t`Fewer`, more: t`More` }} />}
        actions={
          <>
            <CircleButton label={t`Find agent`} icon={<SearchIcon />} />
            <CircleButton label={t`Grid view`} icon={<GridIcon />} />
            <CircleButton label={t`Settings`} icon={<GearIcon />} className="max-sm:hidden" />
          </>
        }
      >
        {shown.map((a, i) => (
          <StripCard
            key={a.id}
            selected={agentId === a.id}
            style={{ animationDelay: `${String(i * 30)}ms` }}
            className="motion-safe:animate-enter"
            onClick={() => {
              setAgent(a.id);
              setDept(a.dept);
            }}
            topStart={t(a.name)}
            topEnd={<N>{badge(a)}</N>}
            line={<Status status={a.status} live />}
          >
            <Avatar initial={initialOf(t(a.name))} ink={agentId === a.id} />
          </StripCard>
        ))}
      </Strip>
    </Screen>
  );
}
