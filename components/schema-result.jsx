// Schema viewer + result table components
const { useState, useEffect, useRef, useMemo } = React;

function SchemaViewer({ schema, onInsert, activeTable }) {
  const [openTables, setOpenTables] = useState(() => {
    const o = {};
    schema.tables.forEach((t) => (o[t.name] = true));
    return o;
  });
  return (
    <div className="schema-viewer">
      <div className="pane-header">
        <span className="pane-eyebrow">Schema</span>
        <span className="pane-meta">{schema.tables.length} tables</span>
      </div>
      <div className="schema-list">
        {schema.tables.map((t) => {
          const isOpen = openTables[t.name];
          const isActive = activeTable === t.name;
          return (
            <div key={t.name} className={`schema-table ${isActive ? "is-active" : ""}`}>
              <button
                className="schema-table-head"
                onClick={() =>
                  setOpenTables((o) => ({ ...o, [t.name]: !o[t.name] }))
                }
              >
                <span className={`chev ${isOpen ? "open" : ""}`}>▸</span>
                <span className="schema-table-name">{t.name}</span>
                <span className="schema-rowcount">{t.rowCount}</span>
              </button>
              {isOpen && (
                <div className="schema-cols">
                  {t.columns.map((c) => (
                    <button
                      key={c.name}
                      className="schema-col"
                      onClick={() => onInsert && onInsert(`${t.name}.${c.name}`)}
                      title={`Insert ${t.name}.${c.name}`}
                    >
                      <span className="col-name">
                        {c.name}
                        {c.pk && <span className="col-tag pk">PK</span>}
                        {c.fk && <span className="col-tag fk">FK</span>}
                      </span>
                      <span className="col-type">{c.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="schema-foot">
        <div className="legend">
          <span className="legend-item"><i className="dot pk-dot" />PK primary</span>
          <span className="legend-item"><i className="dot fk-dot" />FK foreign</span>
        </div>
      </div>
    </div>
  );
}

function ResultTable({ result, compact }) {
  if (!result) {
    return (
      <div className="result-empty">
        <div className="result-empty-glyph">▦</div>
        <div className="result-empty-title">No result yet</div>
        <div className="result-empty-sub">Press Run, or pick a lesson to walk through it step by step.</div>
      </div>
    );
  }
  if (result.error) {
    return (
      <div className="result-error">
        <div className="error-tag">SQL error</div>
        <pre className="error-msg">{result.error}</pre>
      </div>
    );
  }
  if (result.empty) {
    return (
      <div className="result-empty">
        <div className="result-empty-glyph">✓</div>
        <div className="result-empty-title">Statement ran — no rows returned</div>
      </div>
    );
  }
  const { columns, rows } = result;
  return (
    <div className={`result-table-wrap ${compact ? "compact" : ""}`}>
      <table className="result-table">
        <thead>
          <tr>
            <th className="rownum">#</th>
            {columns.map((c, i) => (
              <th key={i}>
                <span className="th-name">{c}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              <td className="rownum">{ri + 1}</td>
              {r.map((v, ci) => (
                <td key={ci} className={v === null ? "is-null" : typeof v === "number" ? "is-num" : ""}>
                  {v === null ? "NULL" : String(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultMeta({ result }) {
  if (!result || result.error) return null;
  if (result.empty) return <span className="result-meta">ok · {result.elapsed.toFixed(1)}ms</span>;
  return (
    <span className="result-meta">
      {result.rows.length} row{result.rows.length === 1 ? "" : "s"} · {result.columns.length} col{result.columns.length === 1 ? "" : "s"} · {result.elapsed.toFixed(1)}ms
    </span>
  );
}

Object.assign(window, { SchemaViewer, ResultTable, ResultMeta });
