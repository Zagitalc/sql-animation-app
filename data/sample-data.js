// Sample retail-style dataset: brands, retailers, products, retailer_products, price_snapshots
window.SAMPLE_SCHEMA = {
  tables: [
    {
      name: "brands",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "name", type: "TEXT" },
        { name: "country", type: "TEXT" },
      ],
      rowCount: 5,
    },
    {
      name: "retailers",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "name", type: "TEXT" },
        { name: "region", type: "TEXT" },
      ],
      rowCount: 4,
    },
    {
      name: "products",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "brand_id", type: "INTEGER", fk: "brands.id" },
        { name: "name", type: "TEXT" },
        { name: "category", type: "TEXT" },
        { name: "pack_size", type: "TEXT" },
      ],
      rowCount: 8,
    },
    {
      name: "retailer_products",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "product_id", type: "INTEGER", fk: "products.id" },
        { name: "retailer_id", type: "INTEGER", fk: "retailers.id" },
        { name: "retailer_product_name", type: "TEXT" },
      ],
      rowCount: 14,
    },
    {
      name: "price_snapshots",
      columns: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "retailer_product_id", type: "INTEGER", fk: "retailer_products.id" },
        { name: "captured_at", type: "DATE" },
        { name: "shelf_price", type: "REAL" },
        { name: "promo_price", type: "REAL" },
        { name: "promotion_type", type: "TEXT" },
      ],
      rowCount: 36,
    },
  ],
};

window.SAMPLE_SQL = `
-- Brands
CREATE TABLE brands (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT
);
INSERT INTO brands VALUES
  (1, 'Northwind', 'UK'),
  (2, 'Acme Foods', 'US'),
  (3, 'Pacific Co', 'US'),
  (4, 'Highland', 'UK'),
  (5, 'Verde', 'IT');

-- Retailers
CREATE TABLE retailers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT
);
INSERT INTO retailers VALUES
  (1, 'Marketly',   'North'),
  (2, 'FreshGo',    'South'),
  (3, 'Pantry+',    'East'),
  (4, 'CornerCart', 'West');

-- Products
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  brand_id INTEGER,
  name TEXT NOT NULL,
  category TEXT,
  pack_size TEXT
);
INSERT INTO products VALUES
  (101, 1, 'Sparkling Water',     'Soft Drinks', '12x500ml'),
  (102, 1, 'Citrus Soda',         'Soft Drinks', '24x330ml'),
  (103, 2, 'Salted Crisps',       'Snacks',      '6x25g'),
  (104, 2, 'Pepper Crackers',     'Snacks',      '150g'),
  (105, 3, 'Roast Coffee',        'Coffee',      '250g'),
  (106, 3, 'Cold Brew',           'Coffee',      '4x250ml'),
  (107, 4, 'Oat Granola',         'Breakfast',   '500g'),
  (108, 5, 'Olive Oil',           'Pantry',      '500ml');

-- Retailer products (per-retailer SKUs)
CREATE TABLE retailer_products (
  id INTEGER PRIMARY KEY,
  product_id INTEGER,
  retailer_id INTEGER,
  retailer_product_name TEXT
);
INSERT INTO retailer_products VALUES
  (1001, 101, 1, 'Sparkling Water 12 Pack'),
  (1002, 101, 2, 'Sparkling Mineral 12x500ml'),
  (1003, 102, 1, 'Citrus Soda 24 Cans'),
  (1004, 102, 3, 'Citrus Fizz 24x330ml'),
  (1005, 103, 2, 'Salted Crisps Multipack'),
  (1006, 103, 4, 'Crisps Salted 6pk'),
  (1007, 104, 1, 'Pepper Crackers 150g'),
  (1008, 105, 1, 'Roast Coffee Beans 250g'),
  (1009, 105, 3, 'Roasted Coffee 250g'),
  (1010, 106, 2, 'Cold Brew Coffee 4 Pack'),
  (1011, 107, 1, 'Oat Granola 500g'),
  (1012, 107, 4, 'Granola Oat 500g'),
  (1013, 108, 2, 'Olive Oil Extra Virgin'),
  (1014, 108, 3, 'EVOO 500ml');

-- Price snapshots over a few days
CREATE TABLE price_snapshots (
  id INTEGER PRIMARY KEY,
  retailer_product_id INTEGER,
  captured_at DATE,
  shelf_price REAL,
  promo_price REAL,
  promotion_type TEXT
);
INSERT INTO price_snapshots VALUES
  (1,  1001, '2026-04-28', 6.50, NULL, NULL),
  (2,  1001, '2026-05-01', 6.50, 5.00, 'Member'),
  (3,  1001, '2026-05-02', 6.50, NULL, NULL),
  (4,  1002, '2026-04-28', 7.00, NULL, NULL),
  (5,  1002, '2026-05-01', 7.00, 5.50, 'Loyalty'),
  (6,  1003, '2026-04-30', 12.00, NULL, NULL),
  (7,  1003, '2026-05-01', 12.00, 9.50, 'Member'),
  (8,  1004, '2026-04-30', 11.50, NULL, NULL),
  (9,  1004, '2026-05-01', 11.50, NULL, NULL),
  (10, 1005, '2026-04-29', 4.25, 3.00, 'Multibuy'),
  (11, 1005, '2026-05-01', 4.25, NULL, NULL),
  (12, 1006, '2026-04-29', 4.50, NULL, NULL),
  (13, 1006, '2026-05-01', 4.50, 3.25, 'Multibuy'),
  (14, 1007, '2026-04-28', 2.40, NULL, NULL),
  (15, 1007, '2026-05-01', 2.40, NULL, NULL),
  (16, 1008, '2026-04-28', 8.00, NULL, NULL),
  (17, 1008, '2026-05-01', 8.00, 6.50, 'Member'),
  (18, 1008, '2026-05-02', 8.50, NULL, NULL),
  (19, 1009, '2026-04-28', 8.20, NULL, NULL),
  (20, 1009, '2026-05-01', 8.20, NULL, NULL),
  (21, 1010, '2026-04-29', 5.75, 4.50, 'Loyalty'),
  (22, 1010, '2026-05-01', 5.75, NULL, NULL),
  (23, 1011, '2026-04-28', 3.80, NULL, NULL),
  (24, 1011, '2026-05-01', 3.80, 2.95, 'Multibuy'),
  (25, 1012, '2026-04-29', 3.95, NULL, NULL),
  (26, 1012, '2026-05-01', 3.95, NULL, NULL),
  (27, 1013, '2026-04-28', 7.50, NULL, NULL),
  (28, 1013, '2026-05-01', 7.50, 6.00, 'Member'),
  (29, 1013, '2026-05-02', 7.50, NULL, NULL),
  (30, 1014, '2026-04-29', 7.80, NULL, NULL),
  (31, 1014, '2026-05-01', 7.80, NULL, NULL),
  (32, 1014, '2026-05-02', 7.80, 6.20, 'Loyalty'),
  (33, 1001, '2026-05-03', 6.75, NULL, NULL),
  (34, 1003, '2026-05-03', 12.50, NULL, NULL),
  (35, 1008, '2026-05-03', 8.50, 6.95, 'Member'),
  (36, 1013, '2026-05-03', 7.75, NULL, NULL);
`;
