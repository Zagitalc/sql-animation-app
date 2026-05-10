# sigma.sql - SQL Simulator

A client-side SQL learning app for exploring a sample retail pricing database. It runs SQLite in the browser with [sql.js](https://sql.js.org/), React, and Babel loaded from CDNs.

The app is intentionally lightweight: there is no build system, package manager, or backend server. A local static server is enough.

## Quick Start

```bash
cd /Users/longhchung/Documents/GitHub/sql-animation-app
python3 -m http.server 8000
```

Open `http://localhost:8000/index.html` in a browser.

## Run Locally

Serve the project directory with a static file server:

```bash
cd /Users/longhchung/Documents/GitHub/sql-animation-app
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/index.html
```

No package install is required.

You can also open `SQL Simulator.html`; it points at the same app shell. `index.html` is the preferred entry point.

## Deploy To Cloudflare Pages

Cloudflare Pages can deploy this repository as a plain static HTML site. Use these settings:

```text
Framework preset: None
Build command: leave blank
Build output directory: .
Root directory: /
```

The site must have a top-level `index.html`; this repository keeps that as a real file for compatibility with static hosts and direct uploads.

## Requirements

- Python 3, for the local static server
- Internet access, because React, Babel, sql.js, and fonts are loaded from CDNs
- A modern browser

## Why Use A Local Server?

The app loads JSX files in the browser through Babel. Opening `index.html` directly with `file://` can fail in some browsers because local file loading is restricted. Serving the folder over `http://localhost` avoids those issues.

## Project Structure

```text
index.html              Main app entry point
SQL Simulator.html      Duplicate HTML entry point
app.jsx                 Main React app
components/             React UI components
data/sample-data.js     Sample SQLite schema and data
data/lessons.js         Guided SQL lessons
lib/sql-engine.js       sql.js wrapper
styles.css              Base styles
themes.css              Theme variables and theme styles
tweaks-panel.jsx        UI tweak controls
```

## Features

- In-browser SQLite database
- Editable SQL editor
- Query results table
- Guided lessons for SELECT, joins, outer joins, GROUP BY, CASE, indexes, query plans, and window functions
- Quick example queries
- Resizable schema and results columns
- Theme, density, and accent tweaks

## Lesson Topics

- Selecting and filtering rows
- Joining product, brand, retailer, and price tables
- Comparing LEFT, RIGHT, and FULL OUTER JOIN behavior with demo catalog and inventory tables
- Aggregating rows with GROUP BY
- Using CASE for calculated labels
- Creating indexes and inspecting SQLite query plans
- Ranking rows with window functions such as `ROW_NUMBER()`

## Troubleshooting

If the page stays on the boot screen or dependencies fail to load, check that:

- You opened the app from `http://localhost:8000/index.html`
- Your internet connection can reach the CDN URLs in `index.html`
- The terminal running `python3 -m http.server 8000` is still open

If port `8000` is already in use, run another port:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/index.html`.
