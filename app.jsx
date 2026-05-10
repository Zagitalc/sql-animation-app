// Main app for SQL Simulator
const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA, useRef: useRefA, useCallback: useCallbackA } = React;

const COL_MIN = { schema: 180, results: 220, center: 320 };
const COL_DEFAULT = { schema: 260, results: 360 };
const COL_STORAGE_KEY = "sigma.sql:colWidths";

function loadStoredCols() {
  try {
    const raw = localStorage.getItem(COL_STORAGE_KEY);
    if (!raw) return COL_DEFAULT;
    const parsed = JSON.parse(raw);
    return {
      schema: Math.max(COL_MIN.schema, parsed.schema || COL_DEFAULT.schema),
      results: Math.max(COL_MIN.results, parsed.results || COL_DEFAULT.results),
    };
  } catch {
    return COL_DEFAULT;
  }
}

function useColumnResizers() {
  const workspaceRef = useRefA(null);
  const [cols, setCols] = useStateA(loadStoredCols);
  const dragRef = useRefA(null);

  useEffectA(() => {
    const root = workspaceRef.current;
    if (!root) return;
    root.style.setProperty("--col-schema-w", cols.schema + "px");
    root.style.setProperty("--col-results-w", cols.results + "px");
    try { localStorage.setItem(COL_STORAGE_KEY, JSON.stringify(cols)); } catch {}
  }, [cols]);

  const onPointerMove = useCallbackA((e) => {
    const d = dragRef.current;
    if (!d) return;
    const ws = workspaceRef.current;
    if (!ws) return;
    const rect = ws.getBoundingClientRect();
    const dx = e.clientX - d.startX;
    if (d.side === "schema") {
      const total = rect.width;
      const maxW = total - d.otherW - 6 - 6 - COL_MIN.center;
      const next = Math.max(COL_MIN.schema, Math.min(maxW, d.startW + dx));
      setCols((c) => ({ ...c, schema: next }));
    } else {
      const total = rect.width;
      const maxW = total - d.otherW - 6 - 6 - COL_MIN.center;
      const next = Math.max(COL_MIN.results, Math.min(maxW, d.startW - dx));
      setCols((c) => ({ ...c, results: next }));
    }
  }, []);

  const onPointerUp = useCallbackA(() => {
    const d = dragRef.current;
    if (!d) return;
    d.el && d.el.classList.remove("is-dragging");
    document.body.classList.remove("is-resizing");
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    dragRef.current = null;
  }, [onPointerMove]);

  function startDrag(side) {
    return (e) => {
      e.preventDefault();
      dragRef.current = {
        side,
        startX: e.clientX,
        startW: side === "schema" ? cols.schema : cols.results,
        otherW: side === "schema" ? cols.results : cols.schema,
        el: e.currentTarget,
      };
      e.currentTarget.classList.add("is-dragging");
      document.body.classList.add("is-resizing");
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    };
  }

  function resetCol(side) {
    setCols((c) => ({ ...c, [side]: COL_DEFAULT[side] }));
  }

  return { workspaceRef, startDrag, resetCol };
}

const QUICK_EXAMPLES = [
  {
    name: "All products",
    sql: `SELECT * FROM products;`,
  },
  {
    name: "Products in Snacks",
    sql: `SELECT name, pack_size
FROM products
WHERE category = 'Snacks';`,
  },
  {
    name: "Currently on promotion",
    sql: `SELECT rp.retailer_product_name, ps.shelf_price, ps.promo_price, ps.promotion_type
FROM price_snapshots ps
JOIN retailer_products rp ON ps.retailer_product_id = rp.id
WHERE ps.promo_price IS NOT NULL
ORDER BY ps.captured_at DESC;`,
  },
  {
    name: "Average price per retailer",
    sql: `SELECT r.name AS retailer, ROUND(AVG(ps.shelf_price), 2) AS avg_price
FROM price_snapshots ps
JOIN retailer_products rp ON ps.retailer_product_id = rp.id
JOIN retailers r ON rp.retailer_id = r.id
GROUP BY r.name
ORDER BY avg_price DESC;`,
  },
  {
    name: "Index + query plan",
    sql: `CREATE INDEX IF NOT EXISTS idx_price_snapshots_product_date
ON price_snapshots(retailer_product_id, captured_at);

EXPLAIN QUERY PLAN
SELECT retailer_product_id, captured_at, shelf_price, promo_price
FROM price_snapshots
WHERE retailer_product_id = 1001
ORDER BY captured_at DESC;`,
  },
  {
    name: "Left outer join",
    sql: `SELECT
  c.sku,
  c.product_name,
  i.warehouse,
  i.on_hand
FROM join_demo_catalog c
LEFT OUTER JOIN join_demo_inventory i ON c.sku = i.sku
ORDER BY c.sku;`,
  },
  {
    name: "Right outer join",
    sql: `SELECT
  COALESCE(c.sku, i.sku) AS sku,
  c.product_name,
  i.warehouse,
  i.on_hand
FROM join_demo_catalog c
RIGHT OUTER JOIN join_demo_inventory i ON c.sku = i.sku
ORDER BY sku;`,
  },
  {
    name: "Full outer join",
    sql: `SELECT
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
  {
    name: "Promotion count by type",
    sql: `SELECT
  COALESCE(promotion_type, 'No promo') AS type,
  COUNT(*) AS count
FROM price_snapshots
GROUP BY promotion_type
ORDER BY count DESC;`,
  },
];

const DEFAULT_QUERY = `-- Welcome — try editing this query and pressing Run.
-- Tip: pick a lesson above to walk through it step by step.

SELECT
  b.name  AS brand,
  p.name  AS product,
  r.name  AS retailer,
  ps.shelf_price,
  ps.promo_price,
  ps.captured_at
FROM price_snapshots ps
JOIN retailer_products rp ON ps.retailer_product_id = rp.id
JOIN products  p ON rp.product_id  = p.id
JOIN brands    b ON p.brand_id     = b.id
JOIN retailers r ON rp.retailer_id = r.id
ORDER BY ps.captured_at DESC, brand
LIMIT 12;`;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "paper",
  "density": "comfortable",
  "showLessonRail": true,
  "showExamples": true,
  "accent": "amber"
}/*EDITMODE-END*/;

function Boot() {
  return (
    <div className="boot">
      <div className="boot-inner">
        <div className="boot-mark">σ</div>
        <div>booting in-browser SQLite…</div>
      </div>
    </div>
  );
}

function Topbar({ ready, onReset }) {
  const tableCount = window.SAMPLE_SCHEMA ? window.SAMPLE_SCHEMA.tables.length : 0;
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">σ</div>
        <span className="brand-name">sigma.sql</span>
        <span className="brand-sep">/</span>
        <span className="brand-tag">in-browser SQL playground</span>
      </div>
      <div className="topbar-meta">
        <span className={`status-dot ${ready ? "" : "loading"}`}>
          <i />
          <span>{ready ? "SQLite WASM ready" : "loading engine"}</span>
        </span>
        <span>·</span>
        <span>retail demo db · {tableCount} tables</span>
        <span>·</span>
        <button className="btn btn-ghost" onClick={onReset} style={{ padding: "4px 8px" }}>
          ↻ Reset DB
        </button>
      </div>
    </header>
  );
}

function App() {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const [ready, setReady] = useStateA(false);
  const [query, setQuery] = useStateA(DEFAULT_QUERY);
  const [result, setResult] = useStateA(null);
  const [activeLessonId, setActiveLessonId] = useStateA(window.LESSONS[0].id);
  const [stepIdx, setStepIdx] = useStateA(0);
  const [resultTab, setResultTab] = useStateA("result"); // result | history
  const [history, setHistory] = useStateA([]);
  const [activeTable, setActiveTable] = useStateA(null);
  const [editorFocusedAt, setEditorFocusedAt] = useStateA(0);
  const { workspaceRef, startDrag, resetCol } = useColumnResizers();

  const lesson = useMemoA(
    () => window.LESSONS.find((l) => l.id === activeLessonId),
    [activeLessonId]
  );

  useEffectA(() => {
    window.SqlEngine.init().then(() => {
      setReady(true);
      // run default query on boot
      const r = window.SqlEngine.exec(DEFAULT_QUERY);
      setResult(r);
    });
  }, []);

  function run(q = query) {
    if (!window.SqlEngine.isReady()) return;
    const r = window.SqlEngine.exec(q);
    setResult(r);
    setHistory((h) => [{ sql: q, at: new Date(), ok: !r.error, rows: r.rows ? r.rows.length : 0 }, ...h].slice(0, 20));
    // Detect FROM table for active highlight
    const m = q.match(/from\s+([a-z_]+)/i);
    setActiveTable(m ? m[1] : null);
  }

  function resetDb() {
    window.SqlEngine.init();
    setHistory([]);
    setResult(null);
  }

  function loadStep(i) {
    setStepIdx(i);
    setQuery(lesson.steps[i].query);
    setEditorFocusedAt(Date.now());
    run(lesson.steps[i].query);
  }
  function loadFinal() {
    setQuery(lesson.finalQuery);
    setEditorFocusedAt(Date.now());
    run(lesson.finalQuery);
  }

  function pickLesson(id) {
    setActiveLessonId(id);
    setStepIdx(0);
  }

  function insertAtCursor(text) {
    setQuery((q) => q + (q.endsWith(" ") || q.endsWith("\n") ? "" : " ") + text);
    setEditorFocusedAt(Date.now());
  }

  // Apply tweaks to root
  useEffectA(() => {
    const root = document.documentElement;
    root.dataset.theme = tweaks.theme;
    root.dataset.density = tweaks.density;
    root.dataset.accent = tweaks.accent;
  }, [tweaks]);

  if (!ready) return <Boot />;

  return (
    <div className="app">
      <Topbar ready={ready} onReset={resetDb} />
      <div className="workspace" ref={workspaceRef}>
        {/* Schema */}
        <aside className="col col-schema">
          <window.SchemaViewer
            schema={window.SAMPLE_SCHEMA}
            activeTable={activeTable}
            onInsert={insertAtCursor}
          />
        </aside>

        <div
          className="col-resizer"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize schema panel"
          onPointerDown={startDrag("schema")}
          onDoubleClick={() => resetCol("schema")}
          title="Drag to resize · double-click to reset"
        />

        {/* Center: lesson rail + editor + stepper */}
        <main className="col col-editor">
          {tweaks.showLessonRail && (
            <window.LessonRail
              lessons={window.LESSONS}
              activeId={activeLessonId}
              onPick={pickLesson}
            />
          )}

          <div className="editor-pane">
            <div className="editor-toolbar">
              <div className="editor-toolbar-left">
                <div className="tool-tabs">
                  <button className="tool-tab is-active">Query</button>
                  <button className="tool-tab" onClick={() => loadFinal()}>Lesson</button>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
                  untitled.sql
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => setQuery("")}>Clear</button>
                <button className="btn btn-primary" onClick={() => run()}>
                  ▶ Run <span className="kbd">⌘↵</span>
                </button>
              </div>
            </div>

            <window.SqlEditor
              value={query}
              onChange={setQuery}
              onRun={() => run()}
              focusedAt={editorFocusedAt}
            />
          </div>

          <window.LessonStepper
            lesson={lesson}
            stepIdx={stepIdx}
            onStep={(i) => setStepIdx(i)}
            onLoadStep={loadStep}
            onLoadFinal={loadFinal}
          />
        </main>

        <div
          className="col-resizer"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize results panel"
          onPointerDown={startDrag("results")}
          onDoubleClick={() => resetCol("results")}
          title="Drag to resize · double-click to reset"
        />

        {/* Results column */}
        <aside className="col col-results">
          <div className="result-tabs">
            <button
              className={`result-tab ${resultTab === "result" ? "is-active" : ""}`}
              onClick={() => setResultTab("result")}
            >
              Result
              {result && !result.error && !result.empty && (
                <span className="count">{result.rows.length}</span>
              )}
            </button>
            <button
              className={`result-tab ${resultTab === "history" ? "is-active" : ""}`}
              onClick={() => setResultTab("history")}
            >
              History
              {history.length > 0 && <span className="count">{history.length}</span>}
            </button>
          </div>

          <div className="result-body">
            {resultTab === "result" && (
              <>
                <div className="result-header">
                  <span className="pane-eyebrow">
                    {result && result.error ? "Error" : "Output"}
                  </span>
                  <window.ResultMeta result={result} />
                </div>
                <window.ResultTable result={result} />
              </>
            )}
            {resultTab === "history" && (
              <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
                {history.length === 0 && (
                  <div className="result-empty">
                    <div className="result-empty-glyph">⌛</div>
                    <div className="result-empty-title">No queries yet</div>
                    <div className="result-empty-sub">Your run history will appear here.</div>
                  </div>
                )}
                {history.map((h, i) => (
                  <button
                    key={i}
                    className="example-item"
                    style={{ marginBottom: 6, width: "100%" }}
                    onClick={() => { setQuery(h.sql); setResultTab("result"); }}
                  >
                    <div className="example-text">
                      <span className="example-name">
                        {h.ok ? `${h.rows} rows` : "error"} · {h.at.toLocaleTimeString()}
                      </span>
                      <span className="example-snippet">{h.sql.replace(/\s+/g, " ").slice(0, 80)}</span>
                    </div>
                    <span className="example-arrow">↺</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {tweaks.showExamples && (
            <div className="examples-panel">
              <div className="examples-head">
                <span className="examples-title">Quick examples</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-mute)" }}>
                  click to load
                </span>
              </div>
              <div className="examples-list">
                {QUICK_EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    className="example-item"
                    onClick={() => { setQuery(ex.sql); setEditorFocusedAt(Date.now()); run(ex.sql); }}
                  >
                    <div className="example-text">
                      <span className="example-name">{ex.name}</span>
                      <span className="example-snippet">{ex.sql.replace(/\s+/g, " ").slice(0, 60)}</span>
                    </div>
                    <span className="example-arrow">↗</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Tweaks panel */}
      <window.TweaksPanel title="Tweaks">
        <window.TweakSection title="Theme">
          <window.TweakRadio
            label="Mode"
            value={tweaks.theme}
            onChange={(v) => setTweak("theme", v)}
            options={[
              { value: "paper", label: "Paper" },
              { value: "ink", label: "Ink" },
              { value: "terminal", label: "Terminal" },
            ]}
          />
          <window.TweakRadio
            label="Accent"
            value={tweaks.accent}
            onChange={(v) => setTweak("accent", v)}
            options={[
              { value: "amber", label: "Amber" },
              { value: "indigo", label: "Indigo" },
              { value: "teal", label: "Teal" },
            ]}
          />
          <window.TweakRadio
            label="Density"
            value={tweaks.density}
            onChange={(v) => setTweak("density", v)}
            options={[
              { value: "comfortable", label: "Comfy" },
              { value: "compact", label: "Compact" },
            ]}
          />
        </window.TweakSection>
        <window.TweakSection title="Layout">
          <window.TweakToggle
            label="Show lesson rail"
            value={tweaks.showLessonRail}
            onChange={(v) => setTweak("showLessonRail", v)}
          />
          <window.TweakToggle
            label="Show quick examples"
            value={tweaks.showExamples}
            onChange={(v) => setTweak("showExamples", v)}
          />
        </window.TweakSection>
      </window.TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
