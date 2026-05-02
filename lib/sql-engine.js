// SQL engine wrapper using sql.js
window.SqlEngine = (() => {
  let db = null;
  let ready = false;
  let readyPromise = null;

  async function init() {
    if (readyPromise) return readyPromise;
    readyPromise = (async () => {
      const SQL = await window.initSqlJs({
        locateFile: (f) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${f}`,
      });
      db = new SQL.Database();
      db.run(window.SAMPLE_SQL);
      ready = true;
      return db;
    })();
    return readyPromise;
  }

  function exec(sql) {
    if (!ready) throw new Error("Database not ready yet");
    try {
      const t0 = performance.now();
      const res = db.exec(sql);
      const t1 = performance.now();
      if (!res || res.length === 0) {
        return { columns: [], rows: [], elapsed: t1 - t0, empty: true };
      }
      // Take last result set if multiple statements
      const last = res[res.length - 1];
      return {
        columns: last.columns,
        rows: last.values,
        elapsed: t1 - t0,
        empty: false,
      };
    } catch (e) {
      return { error: e.message };
    }
  }

  return { init, exec, isReady: () => ready };
})();
