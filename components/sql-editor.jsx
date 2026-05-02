// SQL editor with line numbers and naive syntax highlighting
const { useState: useState_e, useRef: useRef_e, useEffect: useEffect_e } = React;

const SQL_KEYWORDS = new Set([
  "SELECT","FROM","WHERE","AND","OR","NOT","NULL","IS","IN","LIKE","BETWEEN",
  "JOIN","LEFT","RIGHT","INNER","OUTER","FULL","ON","AS","ORDER","BY","ASC","DESC",
  "GROUP","HAVING","LIMIT","OFFSET","DISTINCT","UNION","ALL","CASE","WHEN","THEN","ELSE","END",
  "INSERT","INTO","VALUES","UPDATE","SET","DELETE","CREATE","TABLE","DROP","ALTER","INDEX",
  "INTEGER","TEXT","REAL","DATE","PRIMARY","KEY","FOREIGN","REFERENCES",
  "COUNT","AVG","SUM","MIN","MAX","ROUND","COALESCE","CAST","ROW_NUMBER","OVER","PARTITION","LAG","LEAD","NULLS","LAST","FIRST",
]);

function highlightSql(text) {
  // tokenize: comments, strings, numbers, words, punctuation, whitespace
  const out = [];
  let i = 0;
  const push = (cls, val) => out.push({ cls, val });
  while (i < text.length) {
    const ch = text[i];
    // line comment
    if (ch === "-" && text[i + 1] === "-") {
      let j = text.indexOf("\n", i);
      if (j === -1) j = text.length;
      push("c", text.slice(i, j));
      i = j;
      continue;
    }
    // string
    if (ch === "'" || ch === '"') {
      let j = i + 1;
      while (j < text.length && text[j] !== ch) j++;
      j = Math.min(text.length, j + 1);
      push("s", text.slice(i, j));
      i = j;
      continue;
    }
    // number
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < text.length && /[0-9.]/.test(text[j])) j++;
      push("n", text.slice(i, j));
      i = j;
      continue;
    }
    // word
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < text.length && /[A-Za-z0-9_]/.test(text[j])) j++;
      const w = text.slice(i, j);
      const upper = w.toUpperCase();
      push(SQL_KEYWORDS.has(upper) ? "k" : "i", w);
      i = j;
      continue;
    }
    // newline/space chunk
    if (/\s/.test(ch)) {
      let j = i;
      while (j < text.length && /\s/.test(text[j])) j++;
      push("w", text.slice(i, j));
      i = j;
      continue;
    }
    // punct
    push("p", ch);
    i++;
  }
  return out;
}

function SqlEditor({ value, onChange, onRun, focusedAt }) {
  const taRef = useRef_e(null);
  const preRef = useRef_e(null);
  const lineCount = (value.match(/\n/g) || []).length + 1;
  const tokens = highlightSql(value + (value.endsWith("\n") ? " " : ""));

  useEffect_e(() => {
    if (focusedAt && taRef.current) {
      taRef.current.focus();
      taRef.current.setSelectionRange(value.length, value.length);
    }
  }, [focusedAt]);

  function onKey(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onRun && onRun();
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.target;
      const s = ta.selectionStart;
      const next = value.slice(0, s) + "  " + value.slice(ta.selectionEnd);
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = s + 2;
      });
    }
  }

  function onScroll(e) {
    if (preRef.current) {
      preRef.current.scrollTop = e.target.scrollTop;
      preRef.current.scrollLeft = e.target.scrollLeft;
    }
  }

  return (
    <div className="sql-editor">
      <div className="gutter">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="gutter-line">{i + 1}</div>
        ))}
      </div>
      <div className="editor-area">
        <pre ref={preRef} className="editor-highlight" aria-hidden="true">
          {tokens.map((t, i) => (
            <span key={i} className={`tok tok-${t.cls}`}>{t.val}</span>
          ))}
        </pre>
        <textarea
          ref={taRef}
          className="editor-textarea"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKey}
          onScroll={onScroll}
        />
      </div>
    </div>
  );
}

Object.assign(window, { SqlEditor });
