// Main app for SQL Simulator
const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA } = React;

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
        <span>retail demo db · 5 tables</span>
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
      <div className="workspace">
        {/* Schema */}
        <aside className="col col-schema">
          <window.SchemaViewer
            schema={window.SAMPLE_SCHEMA}
            activeTable={activeTable}
            onInsert={insertAtCursor}
          />
        </aside>

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
