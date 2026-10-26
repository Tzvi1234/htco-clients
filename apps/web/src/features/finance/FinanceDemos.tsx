import { Trans, useLingui } from "@lingui/react/macro";
import type { ReactNode } from "react";

import { useAgents, type AgentId } from "../../shared/demo/office.ts";
import { Panel, PanelBody, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  CircleButton,
  DataTable,
  DemoFrame,
  Dot,
  BarChart,
  DownloadGlyph,
  IdBlock,
  KV,
  KV2,
  Matrix,
  ProgressBar,
  NextGlyph,
  Stack,
  Strip,
  StripCard,
  Tile,
  TrendGlyph,
  Who,
  Zoom,
  useZoomLabels,
  GearGlyph,
} from "../../shared/ui/kit/index.ts";

const L = ({ children }: { children: ReactNode }) => <span className="ltr">{children}</span>;

/** Finance › Overview (`P.overview`): the month, daily revenue, and each shop's share. */
export function FinanceOverviewDemo({ title }: { title: string }) {
  const { t } = useLingui();
  const shops: [string, string, string, number, "attention" | "info"][] = [
    ["HTZ Prints", "$9,640", "64.6%", 26, "attention"],
    ["HTZ Home", "$5,280", "35.4%", 14, "info"],
  ];
  return (
    <DemoFrame title={title} layout="l3">
      <Panel>
        <PanelHeader
          title={<Trans>October</Trans>}
          actions={<CircleButton label={t`Settings`} icon={<GearGlyph />} />}
        />
        <PanelBody className="justify-between gap-6">
          <IdBlock label={t`Revenue this month:`} value={<L>$14,920</L>} />
          <KV
            items={[
              [t`Gross profit`, <L key="a">$6,214</L>],
              [t`Margin`, <L key="b">41.6%</L>],
              [t`Etsy fees`, <L key="c">$1,447</L>],
              [t`AI costs`, <L key="d">$12.40</L>],
            ]}
          />
          <Matrix
            top={t`Financial health`}
            start={t`Margin`}
            end={t`Growth`}
            bottom={t`Cash`}
            value="84"
            caption={t`Steady growth`}
          />
        </PanelBody>
      </Panel>
      <Panel>
        <PanelHeader
          title={<Trans>Daily revenue</Trans>}
          meta={<L>1–15.10</L>}
          actions={<CircleButton label={t`Export`} icon={<DownloadGlyph />} />}
        />
        <PanelBody className="items-center justify-center gap-6">
          <BarChart
            label={t`Daily revenue, 1 to 15 October: $780 to $1,284, highest today`}
            values={[
              840, 920, 780, 1010, 1100, 960, 880, 1150, 990, 1040, 1210, 1090, 970, 1180, 1284,
            ]}
            highlight={14}

            labels={["1", "", "", "", "5", "", "", "", "", "10", "", "", "", "", "15"]}
            valueLabels="key"
            format={(v) => `$${v.toLocaleString("en-US")}`}
          />
          <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-4">
            <Tile label={t`Today`} value={<L>$1,284</L>} />
            <Tile label={t`This week`} value={<L>$7,064</L>} />
            <Tile label={t`Daily avg.`} value={<L>$995</L>} />
            <Tile label={t`Refunds`} value={<L>$31.20</L>} />
          </div>
        </PanelBody>
      </Panel>
      <Stack className="max-sm:hidden">
        {shops.map(([name, value, share, dots, tone]) => (
          <Panel key={name}>
            <PanelHeader
              title={<Trans>By shop</Trans>}
              actions={<CircleButton label={t`Ledger`} icon={<NextGlyph />} />}
            />
            <PanelBody className="justify-between gap-4">
              <IdBlock label={<L>{name}</L>} value={<L>{value}</L>} />
              <ProgressBar value={dots} max={40} />
              <KV2
                items={[
                  [
                    t`Share:`,
                    <>
                      <Dot tone={tone} />
                      <L>{share}</L>
                    </>,
                  ],
                  [
                    t`Trend:`,
                    <>
                      <TrendGlyph size={10} />
                      <L>+8%</L>
                    </>,
                  ],
                ]}
              />
            </PanelBody>
          </Panel>
        ))}
      </Stack>
    </DemoFrame>
  );
}

/** Finance › Ledger (`P.ledger`): balances, the ledger, and net by day. */
export function LedgerDemo({ title }: { title: string }) {
  const { t } = useLingui();
  const { byId } = useAgents();
  const zoom = useZoomLabels();
  const all = t`All shops`;
  const rows: [string, string, string, string, string, AgentId][] = [
    ["15.10", t`Daily sales`, t`Revenue`, all, "+$1,284.00", "roni"],
    ["15.10", t`Etsy fees`, t`Fees`, all, "−$124.60", "roni"],
    ["14.10", t`Printful invoice #4471`, t`Production`, "HTZ Prints", "−$312.40", "roni"],
    ["14.10", t`Refund #3131`, t`Refunds`, "HTZ Home", "−$24.00", "dana"],
    ["14.10", t`Daily sales`, t`Revenue`, all, "+$1,180.00", "roni"],
    ["13.10", t`AI costs`, t`Software`, all, "−$0.96", "roni"],
    ["13.10", "Etsy Ads", t`Marketing`, "HTZ Prints", "−$5.00", "gal"],
    ["13.10", t`Daily sales`, t`Revenue`, all, "+$970.00", "roni"],
  ];
  const days: [string, number, number][] = [
    ["08.10", 812, 710],
    ["09.10", 905, 790],
    ["10.10", 688, 602],
    ["11.10", 1012, 884],
    ["12.10", 940, 820],
    ["13.10", 964, 845],
    ["14.10", 843, 733],
    ["15.10", 1159, 1010],
  ];
  const weekdays = [t`Wed`, t`Thu`, t`Fri`, t`Sat`, t`Sun`, t`Mon`, t`Tue`, t`Wed`];
  return (
    <DemoFrame title={title} layout="l2s">
      <Panel>
        <PanelHeader title={<Trans>Balances</Trans>} />
        <PanelBody className="justify-between gap-6">
          <IdBlock label={t`Etsy balance:`} value={<L>$3,812.40</L>} />
          <KV
            items={[
              [t`Next payout`, <L key="a">17.10</L>],
              [t`Open invoices`, <L key="b">2</L>],
              [t`Expenses (month)`, <L key="c">$8,706</L>],
              [t`Controller`, byId("roni").name],
            ]}
          />
          <ProgressBar value={26} max={40} />
        </PanelBody>
      </Panel>
      <Panel>
        <PanelHeader
          title={<Trans>Ledger</Trans>}
          meta={<Trans>October</Trans>}
          actions={<CircleButton label={t`Export CSV`} icon={<DownloadGlyph />} />}
        />
        <DataTable
          label={t`Ledger`}
          ends={[4]}
          phoneHidden={[2, 3, 5]}
          head={[t`Date`, t`Description`, t`Category`, t`Shop`, t`Amount`, t`Recorded by`]}
          rows={rows.map(([date, description, category, shop, amount, by], i) => ({
            key: String(i),
            cells: [
              <L key="d">{date}</L>,
              description,
              category,
              <L key="s">{shop}</L>,
              <L key="a">{amount}</L>,
              <Who key="w" name={byId(by).name} />,
            ],
          }))}
        />
      </Panel>
      <Strip
        title={<Trans>Net by day</Trans>}
        meta={<L>8–15.10</L>}
        zoom={<Zoom labels={zoom} page={0} />}
        actions={<CircleButton label={t`Export`} icon={<DownloadGlyph />} />}
      >
        {days.map(([day, gross, net], i) => (
          <StripCard
            key={day}
            topStart={<L>{day}</L>}
            topEnd={weekdays[i]}
            selected={i === 7}
            line={
              <>
                <span className="text-muted">{t`Gross`}</span> <L>${gross}</L>
              </>
            }
          >
            <div className="font-display text-title-lg leading-[1.2] font-light">
              <L>${net}</L>
            </div>
          </StripCard>
        ))}
      </Strip>
    </DemoFrame>
  );
}
