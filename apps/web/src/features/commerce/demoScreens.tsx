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
  CircleButton,
  CountUp,
  Dot,
  IdBlock,
  InkDisc,
  KeyValues,
  Pill,
  PillPair,
  SectionLabel,
  StatusGlyph,
  StatusText,
  Who,
} from "../../shared/ui/kit/Bits.tsx";
import { DotColumns, Matrix } from "../../shared/ui/kit/Charts.tsx";
import {
  ChatGlyph,
  CheckGlyph,
  DownloadGlyph,
  FilterGlyph,
  PlusGlyph,
  SearchGlyph,
  XGlyph,
} from "../../shared/ui/kit/glyphs.tsx";
import { Screen, Stack } from "../../shared/ui/kit/Layout.tsx";
import { Strip, StripCard } from "../../shared/ui/kit/Strip.tsx";
import { DataTable, type Column } from "../../shared/ui/kit/Table.tsx";
import { ProductThumb, type ProductKind } from "../../shared/ui/kit/Thumb.tsx";
import { bi, useBi, type Bi } from "../../shared/ui/kit/bi.ts";

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
      className: "w-11",
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
          {o.qty > 1 ? <span className="ltr text-muted">{`×${o.qty}`}</span> : null}
        </span>
      ),
    },
    { key: "total", header: t`Total`, end: true, cell: (o) => ltr(money(o.total)) },
    {
      key: "status",
      header: t`Status`,
      cell: (o) => <StatusText status={ORDER_GLYPH[o.status]} label={statusLabel[o.status]} />,
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
      cell: (o) => <Who person={agent(o.agent)} />,
    },
  ];
  return (
    <Screen layout="l2">
      <Panel>
        <PanelHeader
          title={<Trans>Filters</Trans>}
          actions={<CircleButton label={t`Clear`} icon={<XGlyph />} />}
        />
        <Body className="justify-between gap-6">
          <IdBlock
            label={<Trans>Orders shown:</Trans>}
            id={ltr(<CountUp value={String(ORDERS.length)} />)}
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
          <KeyValues
            items={[
              {
                label: <Trans>Total shown</Trans>,
                value: ltr(`$${sum.toLocaleString("en-US", { minimumFractionDigits: 2 })}`),
              },
              { label: <Trans>Late</Trans>, value: ltr(count("late")) },
              { label: <Trans>Average order</Trans>, value: ltr(money(sum / ORDERS.length)) },
              { label: <Trans>Handled by agents</Trans>, value: ltr("100%") },
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
          columns={columns}
          rows={ORDERS}
          rowKey={(o) => o.n}
          selected={(o) => SELECTED.has(o.n)}
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
          <IdBlock label={<Trans>SKU:</Trans>} id={ltr("STAR-01")}>
            <div className="text-body-sm">{names[kind]}</div>
          </IdBlock>
          <div className="flex justify-center">
            <span className="motion-safe:animate-[htco-float_6s_ease-in-out_infinite]">
              <ProductThumb kind={kind} size={140} radius={16} />
            </span>
          </div>
          <KeyValues
            items={[
              { label: <Trans>Price</Trans>, value: ltr(`$${price}`) },
              { label: <Trans>Production cost</Trans>, value: ltr(money(price * 0.38)) },
              { label: <Trans>Shop</Trans>, value: SHOP_NAMES[PRODUCT_SHOP[kind]] },
              { label: <Trans>Supplier</Trans>, value: ltr("Printful") },
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
                  <span className="font-light text-muted">{ltr(`$${PRODUCT_PRICES[k]}`)}</span>
                </span>
                <ProductThumb kind={k} size={150} radius={16} />
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
        <StatusText
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
          <IdBlock label={<Trans>In transit:</Trans>} id={ltr(<CountUp value="12" />)} />
          <KeyValues
            items={[
              { label: <Trans>Shipped today</Trans>, value: ltr(9) },
              { label: <Trans>Late</Trans>, value: ltr(2) },
              { label: <Trans>Avg. transit</Trans>, value: <Trans>4.2 days</Trans> },
              { label: <Trans>Tracking sync</Trans>, value: <StatusText status="failed" /> },
            ]}
          />
          <div className="max-sm:hidden">
            <Matrix
              top={<Trans>Delivery performance</Trans>}
              left={<Trans>On time</Trans>}
              right={<Trans>Cost</Trans>}
              bottom={<Trans>Speed</Trans>}
              value="88"
              caption={<Trans>On target</Trans>}
              strength={4}
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
        <DataTable
          label={t`Active shipments`}
          columns={columns}
          rows={shipments}
          rowKey={(o) => o.n}
        />
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
              <IdBlock label={<Trans>Carrier:</Trans>} id={ltr(carrier)} />
              <PillPair
                items={[
                  {
                    label: <Trans>Shipments:</Trans>,
                    pill: (
                      <Pill wide>
                        <Dot tone="ink" />
                        {ltr(count)}
                      </Pill>
                    ),
                  },
                  {
                    label: <Trans>Avg. label:</Trans>,
                    pill: (
                      <Pill wide>
                        <Dot tone="good" />
                        {ltr(price)}
                      </Pill>
                    ),
                  },
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
          <StatusText status="running" label={t`Active`} />
        ) : (
          <StatusText status="waitext" />
        ),
    },
    { key: "owner", header: t`Owner`, cell: () => <Who person={agent("tom")} />, phone: false },
  ];
  return (
    <Screen layout="l2rs">
      <Panel>
        <PanelHeader
          title={<Trans>Suppliers</Trans>}
          meta={ltr(3)}
          actions={<CircleButton label={t`New supplier`} icon={<PlusGlyph />} />}
        />
        <DataTable label={t`Suppliers`} columns={columns} rows={SUPPLIERS} rowKey={(s) => s.name} />
      </Panel>
      <Panel>
        <PanelHeader
          title={<Trans>Quote</Trans>}
          actions={<CircleButton label={t`Chat with Tom`} icon={<ChatGlyph />} />}
        />
        <Body className="justify-between gap-5">
          <IdBlock label={<Trans>Supplier:</Trans>} id={ltr("Gelato")} />
          <KeyValues
            items={[
              { label: <Trans>Current price</Trans>, value: ltr("$8.50") },
              { label: <Trans>Quoted price</Trans>, value: ltr("$6.40") },
              { label: <Trans>Monthly saving</Trans>, value: ltr("$132") },
              { label: <Trans>Approval</Trans>, value: ltr("AP-119") },
            ]}
          />
          <PillPair
            items={[
              {
                label: <Trans>Status:</Trans>,
                pill: (
                  <Pill wide>
                    <StatusGlyph status="waitext" />
                    <Trans>Waiting</Trans>
                  </Pill>
                ),
              },
              {
                label: <Trans>Risk:</Trans>,
                pill: (
                  <Pill wide>
                    <Dot tone="info" />
                    <Trans>Medium</Trans>
                  </Pill>
                ),
              },
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
        actions={<CircleButton label={t`Filter`} icon={<FilterGlyph />} />}
      >
        {UNIT_COSTS.map(([kind, supplier, cost], i) => (
          <StripCard
            key={`${kind}-${supplier}`}
            selected={i === 3}
            topStart={ltr(supplier)}
            topEnd={ltr(cost)}
            middle={<ProductThumb kind={kind} size={48} />}
            line={<span className="block truncate">{names[kind]}</span>}
          />
        ))}
      </Strip>
    </Screen>
  );
}

export const demoScreens: Record<string, ComponentType> = {
  "commerce/orders": OrdersDemo,
  "commerce/products": ProductsDemo,
  "commerce/shipping": ShippingDemo,
  "commerce/suppliers": SuppliersDemo,
};
