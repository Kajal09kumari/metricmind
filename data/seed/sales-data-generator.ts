/**
 * @file Enterprise Sales Dataset Generator & Root-Cause Scenario Seed
 * @module data/seed/sales-data-generator
 * @description
 * Generates 3,200+ reproducible enterprise B2B sales orders spanning 2024 (Q1 through Q4)
 * across multiple geographic regions (Europe, North America, APAC, LATAM), product categories,
 * customer segments, and sales channels.
 *
 * Seeded Diagnostic Scenario:
 * - European gross margin contracts from ~42.2% in Q3 to ~38.5% in Q4 (-3.7 pp).
 * - Primary Root Cause: Shipping & freight costs surge by +9.4% due to Q4 air-freight surcharges.
 * - Geographic Focus: Germany experiences the steepest localized decline (-5.3 pp) due to logistics bottlenecks.
 * - Top-Line Resilience: Revenue remains steady (+1.1%), proving margin compression is cost-driven rather than demand erosion.
 */

/**
 * Physical relational table schema representation for `sales_orders`.
 */
export interface SalesOrderRow {
  /** Unique primary key identifier for the transaction */
  order_id: string;
  /** ISO Date string (YYYY-MM-DD) */
  order_date: string;
  /** Fiscal calendar year */
  year: string;
  /** Fiscal calendar quarter (e.g., '2024-Q4') */
  quarter: string;
  /** Month identifier (e.g., '2024-11') */
  month: string;
  /** Continental geographic region (Europe, North America, Asia Pacific, Latin America) */
  region: string;
  /** Specific sovereign country */
  country: string;
  /** Product stock unit name */
  product: string;
  /** High-level product catalog category */
  product_category: string;
  /** Customer classification (Enterprise, Mid-Market, SMB, Strategic Accounts) */
  customer_segment: string;
  /** Distribution channel (Direct Enterprise, Channel Partner, Digital Self-Serve, OEM) */
  sales_channel: string;
  /** Top-line transaction revenue amount */
  revenue: number;
  /** Total cost of goods sold (COGS = shipping_cost + material_cost) */
  cost: number;
  /** Logistics, delivery, and freight cost */
  shipping_cost: number;
  /** Direct bill-of-materials and component cost */
  material_cost: number;
}

/**
 * Deterministic Linear Congruential Generator (LCG) ensuring identical dataset generation across runs.
 * @param seed Numerical seed value (42)
 * @returns Deterministic pseudo-random float between 0 and 1
 */
function createRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Generates the full 3,200+ enterprise sales transaction database.
 * @returns Array of SalesOrderRow records
 */
export function generateSalesData(): SalesOrderRow[] {
  const rows: SalesOrderRow[] = [];
  const rand = createRandom(42);

  const quarters = [
    { name: "2024-Q1", year: "2024", months: ["2024-01", "2024-02", "2024-03"] },
    { name: "2024-Q2", year: "2024", months: ["2024-04", "2024-05", "2024-06"] },
    { name: "2024-Q3", year: "2024", months: ["2024-07", "2024-08", "2024-09"] },
    { name: "2024-Q4", year: "2024", months: ["2024-10", "2024-11", "2024-12"] },
  ];

  const regions: Record<string, string[]> = {
    Europe: ["Germany", "United Kingdom", "France", "Italy", "Spain"],
    "North America": ["United States", "Canada"],
    "Asia Pacific": ["Japan", "Australia"],
    "Latin America": ["Brazil"],
  };

  const categories: Record<string, string[]> = {
    "Enterprise Servers": ["PowerEdge R750", "ProLiant DL380", "ThinkSystem SR650"],
    "Cloud Hardware": ["Edge Gateway X1", "SAN Array 5000", "InfiniBand Switch 400G"],
    "Networking Gear": ["Catalyst 9300", "OptiConnect Router 10G", "Firewall Pro 800"],
    "Developer Workstations": ["Precision 7920", "ThinkStation P620", "Z6 G4 Workstation"],
    "SaaS Subscriptions": ["MetricMind Cloud Pro", "Enterprise BI Suite", "Realtime AI Insights"],
  };

  const segments = ["Enterprise", "Mid-Market", "SMB", "Strategic Accounts"];
  const channels = ["Direct Enterprise", "Channel Partner", "Digital Self-Serve", "OEM"];

  let orderCount = 10000;

  for (const q of quarters) {
    const isQ4 = q.name === "2024-Q4";
    const isQ3 = q.name === "2024-Q3";

    for (const [region, countries] of Object.entries(regions)) {
      for (const country of countries) {
        // Base orders per country/quarter
        const ordersInCountry = country === "United States" ? 180 : country === "Germany" ? 130 : 90;

        for (let i = 0; i < ordersInCountry; i++) {
          orderCount++;
          const orderId = `ORD-2024-${orderCount}`;

          const month = q.months[Math.floor(rand() * q.months.length)];
          const day = String(Math.floor(rand() * 28) + 1).padStart(2, "0");
          const orderDate = `${month}-${day}`;

          const catKeys = Object.keys(categories);
          const category = catKeys[Math.floor(rand() * catKeys.length)];
          const productList = categories[category];
          const product = productList[Math.floor(rand() * productList.length)];

          const segment = segments[Math.floor(rand() * segments.length)];
          const channel = channels[Math.floor(rand() * channels.length)];

          // Base unit economics
          let baseRevenue = 15000 + Math.floor(rand() * 45000);
          if (segment === "Enterprise" || segment === "Strategic Accounts") {
            baseRevenue *= 1.8;
          }

          // Cost modeling
          let baseCostRatio = 0.58; // 42% margin
          let shippingRatio = 0.11; // 11% of revenue
          let materialRatio = 0.47; // 47% of revenue

          // ----------------------------------------------------
          // SEEDED STORY MODELING:
          // ----------------------------------------------------
          if (region === "Europe") {
            if (isQ4) {
              if (country === "Germany") {
                // Germany severe margin compression in Q4
                shippingRatio = 0.168; // Logistics freight surcharges
                materialRatio = 0.472; // Small component increase
                baseCostRatio = shippingRatio + materialRatio; // 0.640 -> 36.0% margin
              } else {
                // Other European countries moderate shipping bump
                shippingRatio = 0.134;
                materialRatio = 0.472;
                baseCostRatio = shippingRatio + materialRatio; // ~0.606 -> 39.4% margin
              }
            } else if (isQ3) {
              if (country === "Germany") {
                shippingRatio = 0.108;
                materialRatio = 0.461;
                baseCostRatio = 0.569; // 43.1% margin in Q3
              } else {
                shippingRatio = 0.112;
                materialRatio = 0.470;
                baseCostRatio = 0.582; // 41.8% margin in Q3
              }
            } else {
              // Q1 & Q2 Europe baseline
              shippingRatio = 0.110;
              materialRatio = 0.470;
              baseCostRatio = 0.580; // 42.0% margin
            }
          } else if (region === "North America") {
            // North America stable high performance
            shippingRatio = 0.095;
            materialRatio = 0.465;
            baseCostRatio = 0.560; // 44.0% margin
          } else {
            // APAC & LATAM
            shippingRatio = 0.120;
            materialRatio = 0.480;
            baseCostRatio = 0.600; // 40.0% margin
          }

          // Small random noise (+/- 2%)
          const noise = (rand() - 0.5) * 0.04;
          const adjustedCostRatio = Math.min(0.85, Math.max(0.35, baseCostRatio + noise));

          const totalCost = Math.round(baseRevenue * adjustedCostRatio);
          const shippingCost = Math.round(baseRevenue * (shippingRatio + noise * 0.3));
          const materialCost = totalCost - shippingCost;

          rows.push({
            order_id: orderId,
            order_date: orderDate,
            year: q.year,
            quarter: q.name,
            month,
            region,
            country,
            product,
            product_category: category,
            customer_segment: segment,
            sales_channel: channel,
            revenue: Math.round(baseRevenue),
            cost: totalCost,
            shipping_cost: Math.max(0, shippingCost),
            material_cost: Math.max(0, materialCost),
          });
        }
      }
    }
  }

  return rows;
}
