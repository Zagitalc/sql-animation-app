# sigma.sql - SQL Simulator

A client-side SQL learning app for exploring a sample retail pricing database. It runs SQLite in the browser with [sql.js](https://sql.js.org/), React, and Babel loaded from CDNs.

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
- Guided lessons for SELECT, JOIN, GROUP BY, and CASE
- Quick example queries
- Theme, density, and accent tweaks

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
