import { useLingui } from "@lingui/react/macro";
import type { ReactNode } from "react";

import { GearIcon } from "../../shared/ui/icons.tsx";
import { DownloadGlyph } from "../../shared/ui/kit/glyphs.tsx";
import {
  Cb,
  DemoFrame,
  Dot,
  DotBar,
  DotColumns,
  IdBlock,
  KV,
  KV2,
  N,
  Pill,
  StatusGlyph,
  Tile,
} from "../../shared/ui/kit/kit.tsx";
import { PageHeader } from "../../shared/ui/PageHeader.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";

const DAILY = [0.6, 0.9, 0.7, 1.1, 0.8, 0.5, 0.4, 1.2, 0.9, 0.7, 1.0, 0.8, 0.6, 0.9, 1.92];
const DAYS = ["1", "", "", "", "5", "", "", "", "", "10", "", "", "", "", "15"];

/** Office › AI ops (Design 1C `P.aiops`), a demo frame: the AI budget, daily spend and models. */
export function AiOpsPage() {
  const { t } = useLingui();
  return (
    <>
      <PageHeader title={t({ message: "AI ops", context: "navigation" })} />
      <DemoFrame>
        <div className="k-grid k-l3 k-enter">
          <Panel>
            <PanelHeader
              title={t`AI budget`}
              meta={t`October`}
              actions={<Cb label={t`Limits`} icon={GearIcon} />}
            />
            <div className="k-pb k-between gap-4">
              <IdBlock label={t`Spent this month:`} value={<N>$12.40</N>}>
                <div className="text-caption text-secondary">
                  {t`of`} <N>$50.00</N>
                </div>
              </IdBlock>
              <DotBar count={50} filled={12} label={t`$12.40 of $50.00 spent`} />
              <KV
                items={[
                  [t`Daily cap`, <N key="a">$5.00</N>],
                  [t`Today`, <N key="b">$1.92</N>],
                  [t`Month-end forecast`, <N key="c">$24.80</N>],
                  [t`Remaining`, <N key="d">$37.60</N>],
                ]}
              />
              <KV2
                items={[
                  [
                    t`Mode:`,
                    <Pill wide key="m">
                      <Dot tone="g" />
                      {t`On budget`}
                    </Pill>,
                  ],
                  [
                    t`Alert at:`,
                    <Pill wide key="x">
                      <Dot tone="o" />
                      <N>80%</N>
                    </Pill>,
                  ],
                ]}
              />
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title={t`Daily spend`}
              meta={<N>1–15.10</N>}
              actions={<Cb label={t`Export`} icon={DownloadGlyph} />}
            />
            <div className="k-pb items-center justify-center gap-6">
              <div className="max-w-full overflow-x-auto">
                <DotColumns
                  values={DAILY}
                  rows={14}
                  highlight={14}
                  pitch={12}
                  gap={30}
                  labels={DAYS}
                  label={t`Daily AI spend, 1 to 15 October`}
                />
              </div>
              <div className="k-grid4 w-full">
                <Tile label="Claude" value={<N>$10.10</N>} sub={t`15 employees`} />
                <Tile label="GPT Images" value={<N>$2.30</N>} sub={t`Nika`} />
                <Tile label={t`Calls`} value={<N>1,942</N>} sub={t`this month`} />
                <Tile label={t`Per call`} value={<N>$0.006</N>} />
              </div>
            </div>
          </Panel>

          <div className="k-stack">
            <ModelCard
              vendor="Anthropic"
              model="Claude"
              note={t`For all employees`}
              usage="$10.10"
              usageTone="k"
              second={[
                t`Status:`,
                <>
                  <StatusGlyph status="running" live />
                  {t`Healthy`}
                </>,
              ]}
            />
            <ModelCard
              vendor="OpenAI"
              model="GPT Images"
              note={t`For Nika only`}
              usage="$2.30"
              usageTone="o"
              second={[
                t`Images:`,
                <>
                  <Dot tone="k" />
                  <N>46</N>
                </>,
              ]}
            />
          </div>
        </div>
      </DemoFrame>
    </>
  );
}

function ModelCard({
  vendor,
  model,
  note,
  usage,
  usageTone,
  second,
}: {
  vendor: string;
  model: string;
  note: string;
  usage: string;
  usageTone: "k" | "o";
  second: readonly [string, ReactNode];
}) {
  const { t } = useLingui();
  return (
    <Panel>
      <PanelHeader
        title={<N>{vendor}</N>}
        actions={<Cb label={t`Model settings`} icon={GearIcon} />}
      />
      <div className="k-pb k-between">
        <IdBlock label={t`Model:`} value={model}>
          <div className="text-caption text-secondary">{note}</div>
        </IdBlock>
        <KV2
          items={[
            [
              t`Usage:`,
              <Pill wide key="u">
                <Dot tone={usageTone} />
                <N>{usage}</N>
              </Pill>,
            ],
            [
              second[0],
              <Pill wide key="s">
                {second[1]}
              </Pill>,
            ],
          ]}
        />
      </div>
    </Panel>
  );
}
