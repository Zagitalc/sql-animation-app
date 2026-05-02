// Lesson stepper component
const { useState: useState_l } = React;

function LessonRail({ lessons, activeId, onPick }) {
  return (
    <div className="lesson-rail">
      <div className="rail-label">Lessons</div>
      <div className="rail-list">
        {lessons.map((l, i) => (
          <button
            key={l.id}
            className={`rail-item ${l.id === activeId ? "is-active" : ""}`}
            onClick={() => onPick(l.id)}
          >
            <span className="rail-num">{String(i + 1).padStart(2, "0")}</span>
            <span className="rail-text">
              <span className="rail-level">{l.level}</span>
              <span className="rail-title">{l.title}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function LessonStepper({ lesson, stepIdx, onStep, onLoadStep, onLoadFinal }) {
  if (!lesson) return null;
  return (
    <div className="lesson-stepper">
      <div className="stepper-head">
        <div className="stepper-title-block">
          <div className="stepper-eyebrow">{lesson.level} · Walkthrough</div>
          <h2 className="stepper-title">{lesson.title}</h2>
          <p className="stepper-blurb">{lesson.blurb}</p>
        </div>
        <button className="btn btn-ghost" onClick={onLoadFinal}>
          Load full query →
        </button>
      </div>

      <div className="step-track">
        {lesson.steps.map((s, i) => {
          const state = i < stepIdx ? "done" : i === stepIdx ? "current" : "future";
          return (
            <div key={i} className={`step-node step-${state}`}>
              <button
                className="step-dot-btn"
                onClick={() => onStep(i)}
                title={s.label}
              >
                <span className="step-dot">{i + 1}</span>
              </button>
              {i < lesson.steps.length - 1 && <span className="step-line" />}
            </div>
          );
        })}
      </div>

      <div className="step-card">
        <div className="step-card-head">
          <span className="step-pill">Step {stepIdx + 1} / {lesson.steps.length}</span>
          <span className="step-label">{lesson.steps[stepIdx].label}</span>
        </div>
        <p className="step-note">{lesson.steps[stepIdx].note}</p>
        <div className="step-actions">
          <button className="btn btn-secondary" onClick={() => onLoadStep(stepIdx)}>
            ↳ Load this step into the editor
          </button>
          <div className="step-nav">
            <button
              className="btn-icon"
              disabled={stepIdx === 0}
              onClick={() => onStep(stepIdx - 1)}
            >
              ←
            </button>
            <button
              className="btn-icon"
              disabled={stepIdx >= lesson.steps.length - 1}
              onClick={() => onStep(stepIdx + 1)}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LessonRail, LessonStepper });
