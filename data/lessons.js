window.LESSONS = [
  {
    id: "select-basics",
    level: "Basics",
    title: "Reading rows with SELECT",
    blurb: "Pick columns from a table and filter with WHERE.",
    finalQuery: `SELECT name, category, pack_size
FROM products
WHERE category = 'Soft Drinks';`,
    steps: [
      {
        label: "1. Read everything from products",
        note: "Start by looking at the raw table. SELECT * means \"all columns\".",
        query: "SELECT * FROM products;",
      },
      {
        label: "2. Keep only the columns we want",
        note: "Listing column names trims the result down.",
        query: "SELECT name, category, pack_size FROM products;",
      },
      {
        label: "3. Filter rows with WHERE",
        note: "WHERE removes rows that don't match the condition. It runs before the result is returned.",
        query: `SELECT name, category, pack_size
FROM products
WHERE category = 'Soft Drinks';`,
      },
    ],
  },
  {
    id: "join-flow",
    level: "Joins",
    title: "Joining four tables together",
    blurb: "Walk a snapshot row out to its product, brand and retailer.",
    finalQuery: `SELECT
  b.name AS brand,
  p.name AS product,
  r.name AS retailer,
  ps.shelf_price,
  ps.captured_at
FROM price_snapshots ps
JOIN retailer_products rp ON ps.retailer_product_id = rp.id
JOIN products p ON rp.product_id = p.id
JOIN brands b ON p.brand_id = b.id
JOIN retailers r ON rp.retailer_id = r.id
ORDER BY ps.captured_at DESC, brand
LIMIT 12;`,
    steps: [
      {
        label: "1. Start at price_snapshots",
        note: "Each row is a price for one retailer-product on one date. The product name lives elsewhere.",
        query: "SELECT * FROM price_snapshots LIMIT 8;",
      },
      {
        label: "2. Join retailer_products",
        note: "Match price_snapshots.retailer_product_id to retailer_products.id to attach the SKU name.",
        query: `SELECT ps.id, ps.captured_at, ps.shelf_price, rp.retailer_product_name
FROM price_snapshots ps
JOIN retailer_products rp ON ps.retailer_product_id = rp.id
LIMIT 8;`,
      },
      {
        label: "3. Reach the canonical product",
        note: "retailer_products links each retailer SKU back to one canonical product.",
        query: `SELECT ps.captured_at, ps.shelf_price, p.name AS product, rp.retailer_product_name
FROM price_snapshots ps
JOIN retailer_products rp ON ps.retailer_product_id = rp.id
JOIN products p ON rp.product_id = p.id
LIMIT 8;`,
      },
      {
        label: "4. Add brand and retailer names",
        note: "Two more joins replace numeric IDs with human names.",
        query: `SELECT
  b.name AS brand,
  p.name AS product,
  r.name AS retailer,
  ps.shelf_price,
  ps.captured_at
FROM price_snapshots ps
JOIN retailer_products rp ON ps.retailer_product_id = rp.id
JOIN products p ON rp.product_id = p.id
JOIN brands b ON p.brand_id = b.id
JOIN retailers r ON rp.retailer_id = r.id
ORDER BY ps.captured_at DESC, brand
LIMIT 12;`,
      },
    ],
  },
  {
    id: "outer-joins",
    level: "Joins",
    title: "Comparing outer joins",
    blurb: "Use unmatched catalog and inventory rows to see where NULLs appear.",
    finalQuery: `SELECT
  COALESCE(c.sku, i.sku) AS sku,
  c.product_name,
  i.warehouse,
  i.on_hand,
  CASE
    WHEN c.sku IS NULL THEN 'inventory only'
    WHEN i.sku IS NULL THEN 'catalog only'
    ELSE 'matched'
  END AS match_status
FROM join_demo_catalog c
FULL OUTER JOIN join_demo_inventory i ON c.sku = i.sku
ORDER BY match_status, sku;`,
    steps: [
      {
        label: "1. Start with the two demo tables",
        note: "Four SKUs match, two exist only in catalog, and two exist only in inventory.",
        query: `SELECT sku, product_name, category, NULL AS warehouse, NULL AS on_hand
FROM join_demo_catalog
UNION ALL
SELECT sku, NULL, NULL, warehouse, on_hand
FROM join_demo_inventory
ORDER BY sku;`,
      },
      {
        label: "2. LEFT JOIN keeps every catalog row",
        note: "Catalog-only rows stay in the result; the inventory columns are NULL.",
        query: `SELECT
  c.sku,
  c.product_name,
  i.warehouse,
  i.on_hand
FROM join_demo_catalog c
LEFT OUTER JOIN join_demo_inventory i ON c.sku = i.sku
ORDER BY c.sku;`,
      },
      {
        label: "3. RIGHT JOIN keeps every inventory row",
        note: "Inventory-only rows stay in the result; the catalog columns are NULL.",
        query: `SELECT
  COALESCE(c.sku, i.sku) AS sku,
  c.product_name,
  i.warehouse,
  i.on_hand
FROM join_demo_catalog c
RIGHT OUTER JOIN join_demo_inventory i ON c.sku = i.sku
ORDER BY sku;`,
      },
      {
        label: "4. FULL OUTER JOIN keeps both sides",
        note: "Full outer joins include matched, catalog-only, and inventory-only rows in one result.",
        query: `SELECT
  COALESCE(c.sku, i.sku) AS sku,
  c.product_name,
  i.warehouse,
  i.on_hand,
  CASE
    WHEN c.sku IS NULL THEN 'inventory only'
    WHEN i.sku IS NULL THEN 'catalog only'
    ELSE 'matched'
  END AS match_status
FROM join_demo_catalog c
FULL OUTER JOIN join_demo_inventory i ON c.sku = i.sku
ORDER BY match_status, sku;`,
      },
    ],
  },
  {
    id: "group-by",
    level: "Aggregation",
    title: "Average price by retailer",
    blurb: "Group rows together, then summarise each group.",
    finalQuery: `SELECT
  r.name AS retailer,
  ROUND(AVG(ps.shelf_price), 2) AS avg_price,
  COUNT(*) AS snapshots
FROM price_snapshots ps
JOIN retailer_products rp ON ps.retailer_product_id = rp.id
JOIN retailers r ON rp.retailer_id = r.id
GROUP BY r.name
ORDER BY avg_price DESC;`,
    steps: [
      {
        label: "1. Get every priced row with its retailer",
        note: "Join the snapshots out to retailers so we have a name to group by.",
        query: `SELECT r.name AS retailer, ps.shelf_price
FROM price_snapshots ps
JOIN retailer_products rp ON ps.retailer_product_id = rp.id
JOIN retailers r ON rp.retailer_id = r.id;`,
      },
      {
        label: "2. Collapse rows per retailer",
        note: "GROUP BY puts rows with the same retailer into one bucket. AVG is then computed per bucket.",
        query: `SELECT r.name AS retailer, AVG(ps.shelf_price) AS avg_price
FROM price_snapshots ps
JOIN retailer_products rp ON ps.retailer_product_id = rp.id
JOIN retailers r ON rp.retailer_id = r.id
GROUP BY r.name;`,
      },
      {
        label: "3. Round and add a count",
        note: "ROUND tidies the number; COUNT(*) shows how many rows are in each group.",
        query: `SELECT
  r.name AS retailer,
  ROUND(AVG(ps.shelf_price), 2) AS avg_price,
  COUNT(*) AS snapshots
FROM price_snapshots ps
JOIN retailer_products rp ON ps.retailer_product_id = rp.id
JOIN retailers r ON rp.retailer_id = r.id
GROUP BY r.name
ORDER BY avg_price DESC;`,
      },
    ],
  },
  {
    id: "discount-depth",
    level: "Calculations",
    title: "Discount depth with CASE",
    blurb: "Turn raw numbers into a labelled status and a calculated %.",
    finalQuery: `SELECT
  rp.retailer_product_name,
  ps.shelf_price,
  ps.promo_price,
  ROUND((ps.shelf_price - ps.promo_price) * 100.0 / ps.shelf_price, 1) AS discount_pct,
  CASE
    WHEN ps.promo_price IS NULL THEN 'Full price'
    WHEN (ps.shelf_price - ps.promo_price) / ps.shelf_price >= 0.20 THEN 'Deep promo'
    ELSE 'Light promo'
  END AS status
FROM price_snapshots ps
JOIN retailer_products rp ON ps.retailer_product_id = rp.id
ORDER BY discount_pct DESC NULLS LAST;`,
    steps: [
      {
        label: "1. Show shelf vs promo price",
        note: "promo_price can be NULL — meaning no promotion that day.",
        query: `SELECT rp.retailer_product_name, ps.shelf_price, ps.promo_price
FROM price_snapshots ps
JOIN retailer_products rp ON ps.retailer_product_id = rp.id
LIMIT 10;`,
      },
      {
        label: "2. Compute discount %",
        note: "Multiply by 100.0 (not 100) so SQLite does real division. ROUND keeps it readable.",
        query: `SELECT rp.retailer_product_name, ps.shelf_price, ps.promo_price,
  ROUND((ps.shelf_price - ps.promo_price) * 100.0 / ps.shelf_price, 1) AS discount_pct
FROM price_snapshots ps
JOIN retailer_products rp ON ps.retailer_product_id = rp.id
WHERE ps.promo_price IS NOT NULL;`,
      },
      {
        label: "3. Add a CASE label",
        note: "CASE assigns a category per row so dashboards can colour-code rows by status.",
        query: `SELECT
  rp.retailer_product_name,
  ps.shelf_price,
  ps.promo_price,
  ROUND((ps.shelf_price - ps.promo_price) * 100.0 / ps.shelf_price, 1) AS discount_pct,
  CASE
    WHEN ps.promo_price IS NULL THEN 'Full price'
    WHEN (ps.shelf_price - ps.promo_price) / ps.shelf_price >= 0.20 THEN 'Deep promo'
    ELSE 'Light promo'
  END AS status
FROM price_snapshots ps
JOIN retailer_products rp ON ps.retailer_product_id = rp.id
ORDER BY discount_pct DESC NULLS LAST;`,
      },
    ],
  },
  {
    id: "indexing",
    level: "Performance",
    title: "Speeding lookups with indexes",
    blurb: "Compare SQLite query plans before and after adding a composite index.",
    finalQuery: `CREATE INDEX IF NOT EXISTS idx_price_snapshots_product_date
ON price_snapshots(retailer_product_id, captured_at);

EXPLAIN QUERY PLAN
SELECT retailer_product_id, captured_at, shelf_price, promo_price
FROM price_snapshots
WHERE retailer_product_id = 1001
ORDER BY captured_at DESC;`,
    steps: [
      {
        label: "1. Run a filtered lookup",
        note: "This query asks for one retailer-product's price history, newest first.",
        query: `SELECT retailer_product_id, captured_at, shelf_price, promo_price
FROM price_snapshots
WHERE retailer_product_id = 1001
ORDER BY captured_at DESC;`,
      },
      {
        label: "2. Inspect the plan without an index",
        note: "Dropping the demo index first makes the baseline repeatable. Look for SCAN in the detail column.",
        query: `DROP INDEX IF EXISTS idx_price_snapshots_product_date;

EXPLAIN QUERY PLAN
SELECT retailer_product_id, captured_at, shelf_price, promo_price
FROM price_snapshots
WHERE retailer_product_id = 1001
ORDER BY captured_at DESC;`,
      },
      {
        label: "3. Create a composite index",
        note: "The first indexed column supports the WHERE filter; the second supports the date ordering.",
        query: `CREATE INDEX IF NOT EXISTS idx_price_snapshots_product_date
ON price_snapshots(retailer_product_id, captured_at);`,
      },
      {
        label: "4. Inspect the indexed plan",
        note: "Run the same plan check again. SQLite should now report a SEARCH using the new index.",
        query: `EXPLAIN QUERY PLAN
SELECT retailer_product_id, captured_at, shelf_price, promo_price
FROM price_snapshots
WHERE retailer_product_id = 1001
ORDER BY captured_at DESC;`,
      },
    ],
  },
  {
    id: "latest-per-group",
    level: "Window",
    title: "Latest price per product",
    blurb: "Use ROW_NUMBER over a partition to keep one row per group.",
    finalQuery: `SELECT retailer_product_id, captured_at, shelf_price, promo_price
FROM (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY retailer_product_id
      ORDER BY captured_at DESC
    ) AS rn
  FROM price_snapshots
)
WHERE rn = 1
ORDER BY retailer_product_id;`,
    steps: [
      {
        label: "1. List all snapshots for a product",
        note: "There can be many rows per retailer-product across dates.",
        query: `SELECT retailer_product_id, captured_at, shelf_price
FROM price_snapshots
WHERE retailer_product_id = 1001
ORDER BY captured_at DESC;`,
      },
      {
        label: "2. Number rows newest-first within each product",
        note: "ROW_NUMBER over a PARTITION restarts the count for every group.",
        query: `SELECT
  retailer_product_id,
  captured_at,
  shelf_price,
  ROW_NUMBER() OVER (
    PARTITION BY retailer_product_id
    ORDER BY captured_at DESC
  ) AS rn
FROM price_snapshots
ORDER BY retailer_product_id, rn
LIMIT 12;`,
      },
      {
        label: "3. Keep only rn = 1",
        note: "Wrapping the previous query in a subquery lets us filter on the computed rn.",
        query: `SELECT retailer_product_id, captured_at, shelf_price, promo_price
FROM (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY retailer_product_id
      ORDER BY captured_at DESC
    ) AS rn
  FROM price_snapshots
)
WHERE rn = 1
ORDER BY retailer_product_id;`,
      },
    ],
  },
];
