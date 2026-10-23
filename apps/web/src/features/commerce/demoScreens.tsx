import { Trans, useLingui } from "@lingui/react/macro";
import type { ComponentType, ReactNode } from "react";

import { useProductNames } from "./data.ts";
import { useAgents } from "../../shared/demo/office.ts";
import { cx } from "../../shared/lib/cx.ts";
import { Button } from "../../shared/ui/Button.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  ChatGlyph,
  CircleButton,
  DataTable,
  DemoFrame,
  Dot,
  FilterGlyph,
  IdBlock,
  KV,
  KV2,
  Pill,
  PlusGlyph,
  ProductThumb,
  Screen,
  Status,
  StatusGlyph,
  Strip,
  StripCard,
  Who,
  Zoom,
  bi,
  useBi,
  type Bi,
  type ProductKind,
  type TableRow,
} from "../../shared/ui/kit/index.ts";

/** A column of the demo's tables: its head, how a row fills it, and where it shows. */
interface Column<Row> {
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  /** Numbers and amounts align to the end. */
  end?: boolean;
  /** False: left out on phones, which show fewer columns. */
  phone?: boolean;
  /** "wide": only on wide screens (from 1600 px), like the demo's shop column. */
  only?: "wide";
}

/** The kit's DataTable props from column definitions. */
function columnsTable<Row>(
  columns: readonly Column<Row>[],
  rows: readonly Row[],
  rowKey: (row: Row) => string,
  selected?: (row: Row) => boolean,
): {
  head: ReactNode[];
  rows: TableRow[];
  ends: number[];
  phoneHidden: number[];
  wideOnly: number[];
} {
  const where = (test: (column: Column<Row>) => boolean) =>
    columns.flatMap((column, index) => (test(column) ? [index] : []));
  return {
    head: columns.map((column) => column.header),
    rows: rows.map((row) => ({
      key: rowKey(row),
      ...(selected === undefined ? {} : { selected: selected(row) }),
      cells: columns.map((column) => column.cell(row)),
    })),
    ends: where((column) => column.end === true),
    phoneHidden: where((column) => column.phone === false),
    wideOnly: where((column) => column.only === "wide"),
  };
}

const ltr = (text: ReactNode) => <span className="ltr">{text}</span>;
function Body({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("flex min-h-0 grow flex-col px-6 pb-6", className)}>{children}</div>;
}

/* -------------------------------------------------------------- Suppliers */

interface SupplierRow {
  name: string;
  products: Bi;
  time: Bi;
  quality: string;
  quote: Bi | string;
  active: boolean;
}

const SUPPLIERS: readonly SupplierRow[] = [
  {
    name: "Printful",
    products: bi("הדפסים, פורטרטים, ספלים", "Prints, portraits, mugs"),
    time: bi("2.1 ימים", "2.1 days"),
    quality: "98.4%",
    quote: "—",
    active: true,
  },
  {
    name: "Printify",
    products: bi("מגבות מטבח", "Tea towels"),
    time: bi("3.4 ימים", "3.4 days"),
    quality: "96.1%",
    quote: "—",
    active: true,
  },
  {
    name: "Gelato",
    products: bi("מגבות מטבח (הצעה)", "Tea towels (quote)"),
    time: bi("2.6 ימים", "2.6 days"),
    quality: "—",
    quote: bi("‏$6.40 ליחידה", "$6.40 / unit"),
    active: false,
  },
];

const UNIT_COSTS: readonly [ProductKind, string, string][] = [
  ["star", "Printful", "$15.96"],
  ["pet", "Printful", "$27.36"],
  ["towel", "Printify", "$8.50"],
  ["towel", "Gelato", "$6.40"],
  ["mug", "Printful", "$9.12"],
  ["star", "Gelato", "$14.20"],
  ["pet", "Gelato", "$26.10"],
  ["mug", "Printify", "$8.80"],
];

function SuppliersDemo() {
  const { t } = useLingui();
  const text = useBi();
  const names = useProductNames();
  const agent = useAgents().byId;
  const columns: Column<SupplierRow>[] = [
    { key: "name", header: t`Supplier`, cell: (s) => ltr(s.name) },
    { key: "products", header: t`Products`, cell: (s) => text(s.products), phone: false },
    { key: "time", header: t`Production time`, cell: (s) => text(s.time), phone: false },
    { key: "quality", header: t`Quality`, cell: (s) => ltr(s.quality) },
    {
      key: "quote",
      header: t`Open quote`,
      cell: (s) => (typeof s.quote === "string" ? ltr(s.quote) : text(s.quote)),
      phone: false,
    },
    {
      key: "status",
      header: t`Status`,
      cell: (s) =>
        s.active ? (
          <Status live status="running" label={t`Active`} />
        ) : (
          <Status live status="waitext" />
        ),
    },
    { key: "owner", header: t`Owner`, cell: () => <Who name={agent("tom").name} />, phone: false },
  ];
  return (
    <Screen layout="l2rs">
      <Panel>
        <PanelHeader
          title={<Trans>Suppliers</Trans>}
          meta={ltr(3)}
          actions={<CircleButton label={t`New supplier`} icon={<PlusGlyph />} />}
        />
        <DataTable label={t`Suppliers`} {...columnsTable(columns, SUPPLIERS, (s) => s.name)} />
      </Panel>
      <Panel>
        <PanelHeader
          title={<Trans>Quote</Trans>}
          actions={<CircleButton label={t`Chat with Tom`} icon={<ChatGlyph />} />}
        />
        <Body className="justify-between gap-5">
          <IdBlock label={<Trans>Supplier:</Trans>} value={ltr("Gelato")} />
          <KV
            items={[
              [<Trans>Current price</Trans>, ltr("$8.50")],
              [<Trans>Quoted price</Trans>, ltr("$6.40")],
              [<Trans>Monthly saving</Trans>, ltr("$132")],
              [<Trans>Approval</Trans>, ltr("AP-119")],
            ]}
          />
          <KV2
            items={[
              [
                <Trans>Status:</Trans>,
                <Pill wide>
                  <StatusGlyph live status="waitext" />
                  <Trans>Waiting</Trans>
                </Pill>,
              ],
              [
                <Trans>Risk:</Trans>,
                <Pill wide>
                  <Dot tone="info" />
                  <Trans>Medium</Trans>
                </Pill>,
              ],
            ]}
          />
          <div className="flex justify-center gap-1.5">
            <Button size="lg">
              <Trans>Reject</Trans>
            </Button>
            <Button variant="primary" size="lg">
              <Trans>Approve</Trans>
            </Button>
          </div>
        </Body>
      </Panel>
      <Strip
        title={<Trans>Unit cost by product</Trans>}
        meta={ltr(8)}
        zoom={<Zoom page={0} labels={{ less: t`Fewer`, more: t`More` }} />}
        actions={<CircleButton label={t`Filter`} icon={<FilterGlyph />} />}
      >
        {UNIT_COSTS.map(([kind, supplier, cost], i) => (
          <StripCard
            key={`${kind}-${supplier}`}
            selected={i === 3}
            topStart={ltr(supplier)}
            topEnd={ltr(cost)}

            line={<span className="block truncate">{names[kind]}</span>}
          >
            {<ProductThumb kind={kind} size={48} />}
          </StripCard>
        ))}
      </Strip>
    </Screen>
  );
}

/** In the demo frame: dimmed, inert, the DEMO pill in the top bar (app/shell/DemoRoute.tsx). */
const framed =
  (Content: ComponentType) =>
  ({ title }: { title: string }) => (
    <DemoFrame title={title}>
      <Content />
    </DemoFrame>
  );

export const demoScreens = {
  "commerce/suppliers": framed(SuppliersDemo),
};
