import { Trans, useLingui } from "@lingui/react/macro";
import type { ComponentType, ReactNode } from "react";

import {
  ORDERS,
  ORDER_GLYPH,
  PRODUCT_PRICES,
  PRODUCT_SHOP,
  SHOP_NAMES,
  useOrderStatusLabels,
  useProductNames,
  type DemoOrder,
  type OrderStatus,
} from "./data.ts";
import { useAgent } from "../work/agents.ts";
import { cx } from "../../shared/lib/cx.ts";
import { Button } from "../../shared/ui/Button.tsx";
import { GearIcon } from "../../shared/ui/icons.tsx";
import { Panel, PanelHeader } from "../../shared/ui/Panel.tsx";
import {
  Card,
  ChatGlyph,
  CheckGlyph,
  CircleButton,
  CloseGlyph,
  CountUp,
  DataTable,
  DemoFrame,
  Dot,
  DotColumns,
  DownloadGlyph,
  FilterGlyph,
  IdBlock,
  InkDisc,
  KV,
  KV2,
  Matrix,
  Pill,
  PlusGlyph,
  ProductThumb,
  Screen,
  SearchGlyph,
  SectionLabel,
  Stack,
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
const money = (n: number) => `$${n.toFixed(2)}`;

function Body({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("flex min-h-0 grow flex-col px-6 pb-6", className)}>{children}</div>;
}

/** `.fl .tab`: a filter capsule with its count; the chosen one is ink. */
function FilterTab({
  on = false,
  children,
  count,
}: {
  on?: boolean;
  children: ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      className={cx(
        "inline-flex h-8 items-center gap-1.5 rounded-pill border px-3 text-caption whitespace-nowrap transition-colors",
        on
          ? "border-inverse bg-inverse text-on-inverse"
          : "border-line-strong hover:border-line-hover",
      )}
    >
      {children}
      {count === undefined ? null : (
        <span className={cx("ltr text-[11px]", on ? "text-on-inverse-muted" : "text-muted")}>
          {count}
        </span>
      )}
    </button>
  );
}

/** `.ck`: the round check of a selectable row. */
function RoundCheck({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "inline-flex size-[18px] items-center justify-center rounded-pill border",
        on ? "border-inverse bg-inverse text-on-inverse" : "border-line-hover",
      )}
    >
      {on ? <CheckGlyph size={10} /> : null}
    </span>
  );
}

/* ----------------------------------------------------------------- Orders */

const SELECTED = new Set(["3176", "3171"]);
const FILTERS: readonly (OrderStatus | "all")[] = ["all", "paid", "prod", "ship", "deliv", "late"];

function OrdersDemo() {
  const { t } = useLingui();
  const statusLabel = useOrderStatusLabels();
  const names = useProductNames();
  const agent = useAgent();
  const count = (s: OrderStatus | "all") =>
    ORDERS.filter((o) => s === "all" || o.status === s).length;
  const sum = ORDERS.reduce((total, o) => total + o.total, 0);
  const columns: Column<DemoOrder>[] = [
    {
      key: "check",
      header: <span className="sr-only">{t`Selected`}</span>,
      cell: (o) => <RoundCheck on={SELECTED.has(o.n)} />,
    },
    { key: "order", header: t`Order`, cell: (o) => ltr(`#${o.n}`) },
    { key: "customer", header: t`Customer`, cell: (o) => ltr(o.customer), phone: false },
    { key: "shop", header: t`Shop`, cell: (o) => SHOP_NAMES[o.shop], phone: false, only: "wide" },
    {
      key: "items",
      header: t`Items`,
      cell: (o) => (
        <span className="inline-flex items-center gap-2">
          <ProductThumb kind={o.item} size={24} radius={6} />
          <span className="max-sm:max-w-[120px] max-sm:truncate">{names[o.item]}</span>
          {o.qty > 1 ? <span className="ltr text-muted">{`×${String(o.qty)}`}</span> : null}
        </span>
      ),
    },
    { key: "total", header: t`Total`, end: true, cell: (o) => ltr(money(o.total)) },
    {
      key: "status",
      header: t`Status`,
      cell: (o) => <Status live status={ORDER_GLYPH[o.status]} label={statusLabel[o.status]} />,
    },
    {
      key: "tracking",
      header: t`Tracking`,
      phone: false,
      cell: (o) => (o.tracking === "" ? <span className="text-muted">—</span> : ltr(o.tracking)),
    },
    {
      key: "agent",
      header: t`Handled by`,
      phone: false,
      cell: (o) => <Who name={agent(o.agent).name} />,
    },
  ];
  return (
    <Screen layout="l2">
      <Panel>
        <PanelHeader
          title={<Trans>Filters</Trans>}
          actions={<CircleButton label={t`Clear`} icon={<CloseGlyph />} />}
        />
        <Body className="justify-between gap-6">
          <IdBlock
            label={<Trans>Orders shown:</Trans>}
            value={ltr(<CountUp value={String(ORDERS.length)} />)}
          />
          <div>
            <SectionLabel>
              <Trans>Status</Trans>
            </SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((s) => (
                <FilterTab key={s} on={s === "all"} count={count(s)}>
                  {s === "all" ? <Trans>All</Trans> : statusLabel[s]}
                </FilterTab>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>
              <Trans>Shop</Trans>
            </SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              <FilterTab on>
                <Trans>All shops</Trans>
              </FilterTab>
              <FilterTab>{SHOP_NAMES.prints}</FilterTab>
              <FilterTab>{SHOP_NAMES.home}</FilterTab>
            </div>
          </div>
          <KV
            items={[
              [
                <Trans>Total shown</Trans>,
                ltr(`$${sum.toLocaleString("en-US", { minimumFractionDigits: 2 })}`),
              ],
              [<Trans>Late</Trans>, ltr(count("late"))],
              [<Trans>Average order</Trans>, ltr(money(sum / ORDERS.length))],
              [<Trans>Handled by agents</Trans>, ltr("100%")],
            ]}
          />
          <div className="max-sm:hidden">
            <DotColumns
              values={[22, 31, 27, 35, 29, 33, 37]}
              rows={6}
              highlight={6}
              gap={36}
              labels={["9", "10", "11", "12", "13", "14", "15"]}
              label={t`Orders per day, 9 to 15 October, 37 today`}
            />
          </div>
        </Body>
      </Panel>
      <Panel>
        <PanelHeader
          title={<Trans>Orders</Trans>}
          meta={ltr("#3141 – #3178")}
          actions={
            <>
              <span className="inline-flex h-10 w-[220px] items-center gap-2 rounded-pill border border-line-strong px-3.5 text-body-sm text-muted max-md:hidden">
                <SearchGlyph size={14} />
                <Trans>Search orders</Trans>
              </span>
              <CircleButton label={t`Export CSV`} icon={<DownloadGlyph />} />
            </>
          }
        />
        <div className="mx-3 mb-2 flex h-12 shrink-0 items-center justify-between rounded-pill bg-raised ps-5 pe-2 text-body-sm motion-safe:animate-pop-in">
          <span>
            {ltr(SELECTED.size)} <Trans>selected</Trans>
          </span>
          <div className="flex gap-1.5">
            <Button className="max-sm:hidden">
              <Trans>Clear</Trans>
            </Button>
            <Button className="max-sm:hidden">
              <Trans>Message customers</Trans>
            </Button>
            <Button variant="primary">
              <Trans>Check tracking</Trans>
            </Button>
          </div>
        </div>
        <DataTable
          label={t`Orders`}
          {...columnsTable(
            columns,
            ORDERS,
            (o) => o.n,
            (o) => SELECTED.has(o.n),
          )}
        />
      </Panel>
    </Screen>
  );
}

/* --------------------------------------------------------------- Products */

const CATALOG: readonly { kind: ProductKind; sku: string; sold: Bi }[] = [
  { kind: "star", sku: "STAR-01", sold: bi("92 מכירות · 4.9", "92 sold · 4.9") },
  { kind: "pet", sku: "PET-02", sold: bi("41 מכירות · 5.0", "41 sold · 5.0") },
  { kind: "towel", sku: "TOWEL-03", sold: bi("63 מכירות · 4.7", "63 sold · 4.7") },
  { kind: "mug", sku: "MUG-04", sold: bi("58 מכירות · 4.8", "58 sold · 4.8") },
];

function ProductsDemo() {
  const { t } = useLingui();
  const names = useProductNames();
  const text = useBi();
  const kind: ProductKind = "star";
  const price = PRODUCT_PRICES[kind];
  return (
    <Screen layout="l3">
      <Panel>
        <PanelHeader
          title={<Trans>Product details</Trans>}
          actions={<CircleButton label={t`Edit`} icon={<GearIcon size={16} />} />}
        />
        <Body className="justify-between gap-6">
          <IdBlock label={<Trans>SKU:</Trans>} value={ltr("STAR-01")}>
            <div className="text-body-sm">{names[kind]}</div>
          </IdBlock>
          <div className="flex justify-center">
            <span className="motion-safe:animate-[htco-float_6s_ease-in-out_infinite]">
              <ProductThumb kind={kind} size={140} radius={16} />
            </span>
          </div>
          <KV
            items={[
              [<Trans>Price</Trans>, ltr(`$${String(price)}`)],
              [<Trans>Production cost</Trans>, ltr(money(price * 0.38))],
              [<Trans>Shop</Trans>, SHOP_NAMES[PRODUCT_SHOP[kind]]],
              [<Trans>Supplier</Trans>, ltr("Printful")],
            ]}
          />
        </Body>
      </Panel>
      <Panel className="lg:col-[2/4]">
        <PanelHeader
          title={<Trans>Catalog</Trans>}
          meta={ltr(4)}
          actions={<CircleButton label={t`New product`} icon={<PlusGlyph />} />}
        />
        <Body className="gap-2 overflow-auto">
          <div className="grid grow grid-cols-4 gap-2 max-md:grid-cols-2">
            {CATALOG.map(({ kind: k, sku, sold }, i) => (
              <button
                type="button"
                key={k}
                className={cx(
                  "flex min-w-0 flex-col items-center justify-between rounded-card border p-4 text-center transition-[background-color,translate] hover:-translate-y-0.5",
                  i === 0 ? "border-selected bg-selected" : "border-line hover:bg-hover",
                )}
              >
                <span className="mb-2.5 flex w-full justify-between text-caption">
                  {ltr(sku)}
                  <span className="font-light text-muted">
                    {ltr(`$${String(PRODUCT_PRICES[k])}`)}
                  </span>
                </span>
                <ProductThumb kind={k} size={150} radius={16} className="max-sm:!size-[112px]" />
                <span className="mt-3 text-body">{names[k]}</span>
                <span className="mt-1.5 text-caption text-secondary">{text(sold)}</span>
              </button>
            ))}
          </div>
          <Card dashed className="flex items-center gap-4">
            <InkDisc>
              <PlusGlyph size={14} />
            </InkDisc>
            <div>
              <div className="text-body">
                {text(
                  bi(
                    "ניקה מכינה 4 הדמיות חדשות למפת כוכבים",
                    "Nika is preparing 4 new star map mockups",
                  ),
                )}
              </div>
              <div className="text-caption text-secondary">
                {text(
                  bi(
                    "ממתין לאישור AP-120 לפני פרסום",
                    "Waiting for approval AP-120 before publishing",
                  ),
                )}
              </div>
            </div>
          </Card>
        </Body>
      </Panel>
    </Screen>
  );
}

/* --------------------------------------------------------------- Shipping */

function ShippingDemo() {
  const { t } = useLingui();
  const statusLabel = useOrderStatusLabels();
  const shipments = ORDERS.filter((o) => o.status === "ship" || o.status === "late");
  const columns: Column<DemoOrder>[] = [
    { key: "order", header: t`Order`, cell: (o) => ltr(`#${o.n}`) },
    { key: "customer", header: t`Customer`, cell: (o) => ltr(o.customer) },
    { key: "carrier", header: t`Carrier`, cell: () => ltr("USPS"), phone: false },
    { key: "tracking", header: t`Tracking`, cell: (o) => ltr(o.tracking), phone: false },
    {
      key: "status",
      header: t`Status`,
      cell: (o) => (
        <Status
          live
          status={o.status === "late" ? "waityou" : "waitext"}
          label={statusLabel[o.status]}
        />
      ),
    },
    { key: "eta", header: t`ETA`, cell: (o) => ltr(o.status === "late" ? "—" : "18.10") },
  ];
  return (
    <Screen layout="l3">
      <Panel>
        <PanelHeader
          title={<Trans>Shipments</Trans>}
          actions={<CircleButton label={t`Settings`} icon={<GearIcon size={16} />} />}
        />
        <Body className="justify-between gap-6">
          <IdBlock label={<Trans>In transit:</Trans>} value={ltr(<CountUp value="12" />)} />
          <KV
            items={[
              [<Trans>Shipped today</Trans>, ltr(9)],
              [<Trans>Late</Trans>, ltr(2)],
              [<Trans>Avg. transit</Trans>, <Trans>4.2 days</Trans>],
              [<Trans>Tracking sync</Trans>, <Status live status="failed" />],
            ]}
          />
          <div className="max-sm:hidden">
            <Matrix
              top={<Trans>Delivery performance</Trans>}
              start={<Trans>On time</Trans>}
              end={<Trans>Cost</Trans>}
              bottom={<Trans>Speed</Trans>}
              value="88"
              caption={<Trans>On target</Trans>}
              k={4}
              label={t`Delivery performance 88%, on target`}
            />
          </div>
        </Body>
      </Panel>
      <Panel>
        <PanelHeader
          title={<Trans>Active shipments</Trans>}
          meta={ltr(12)}
          actions={<CircleButton label={t`Export`} icon={<DownloadGlyph />} />}
        />
        <DataTable label={t`Active shipments`} {...columnsTable(columns, shipments, (o) => o.n)} />
      </Panel>
      <Stack>
        {(
          [
            ["USPS", "Ground Advantage", "9", "$4.85"],
            ["UPS", "Ground", "3", "$7.20"],
          ] as const
        ).map(([carrier, service, count, price]) => (
          <Panel key={carrier}>
            <PanelHeader
              title={ltr(service)}
              actions={<CircleButton label={t`Settings`} icon={<GearIcon size={16} />} />}
            />
            <Body className="justify-between gap-4">
              <IdBlock label={<Trans>Carrier:</Trans>} value={ltr(carrier)} />
              <KV2
                items={[
                  [
                    <Trans>Shipments:</Trans>,
                    <Pill wide>
                      <Dot tone="ink" />
                      {ltr(count)}
                    </Pill>,
                  ],
                  [
                    <Trans>Avg. label:</Trans>,
                    <Pill wide>
                      <Dot tone="success" />
                      {ltr(price)}
                    </Pill>,
                  ],
                ]}
              />
            </Body>
          </Panel>
        ))}
      </Stack>
    </Screen>
  );
}

/* -------------------------------------------------------------- Suppliers */

interface SupplierRow {
  name: string;
  products: Bi;
  time: Bi;
  quality: string;
  quote: string;
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
    quote: "$6.40 / unit",
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
  const agent = useAgent();
  const columns: Column<SupplierRow>[] = [
    { key: "name", header: t`Supplier`, cell: (s) => ltr(s.name) },
    { key: "products", header: t`Products`, cell: (s) => text(s.products), phone: false },
    { key: "time", header: t`Production time`, cell: (s) => text(s.time), phone: false },
    { key: "quality", header: t`Quality`, cell: (s) => ltr(s.quality) },
    { key: "quote", header: t`Open quote`, cell: (s) => ltr(s.quote), phone: false },
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
  "commerce/orders": framed(OrdersDemo),
  "commerce/products": framed(ProductsDemo),
  "commerce/shipping": framed(ShippingDemo),
  "commerce/suppliers": framed(SuppliersDemo),
};
