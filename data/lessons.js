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
