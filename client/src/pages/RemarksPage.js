import { useState, useEffect, useMemo } from "react";

const API = "/api";

const IS_COVERED_LABELS = {
  COVERED: "Covered",
  PARTIALLY_COVERED: "Partial",
  NOT_COVERED: "Not Covered",
};

const HOW_COVERED_LABELS = {
  EXACT_MATCH: "Exact Match",
  VARIANT: "Variant",
  SYNTAX_COVERED: "Syntax Covered",
  CONCEPT_COVERED: "Concept Covered",
  NOT_APPLICABLE: "N/A",
};

const HOW_COLORS = {
  EXACT_MATCH: "how-exact",
  VARIANT: "how-variant",
  SYNTAX_COVERED: "how-syntax",
  CONCEPT_COVERED: "how-concept",
};

const STATUS_LABELS = {
  EXACT_MATCH: "Exact Match",
  NAME_CHANGE_VARIANT: "Name Variant",
  INPUT_CHANGED_VARIANT: "Input Variant",
  SYNTAX_COVERED: "Syntax Covered",
  PARTIALLY_COVERED: "Partially Covered",
  CONCEPT_COVERED: "Concept Covered",
  NOT_COVERED: "Not Covered",
  OTHER_LANGUAGE: "Other Language",
};

const ACTION_OPTIONS = [
  "Adding New Question",
  "Adding New Topic",
];

const SESSION_OPTIONS = [
  "How to Learn a New Programming Language in Record Time",
  "Introduction to Python Programming",
  "Coding Practice Walkthrough | Part 1",
  "Variables and Data Types",
  "Sequence of Instructions",
  "Working with Strings & Input-Output Basics",
  "How to Debug Your Code",
  "Relational, Logical and Compound Operators",
  "Conditional Statements",
  "Loops",
  "Nested Loops & Loop Control Statements",
  "Comparing Strings and String Methods",
  "String Formatting",
  "Lists",
  "Working with Lists & Nested Lists",
  "Lists & Strings",
  "Functions",
  "Built-In Functions and List Methods",
  "Function Call Stack and Recursion",
  "Tuples and Sequences",
  "Sets",
  "Set Operations",
  "Introduction to Matrices",
  "Shorthand Expressions & List Comprehensions",
  "Dictionaries",
  "Working with Dictionaries",
  "Introduction to Object-Oriented Programming",
  "Object-Oriented Programming | Part 2",
  "Classes & Objects",
  "Attributes & Methods",
  "Encapsulation",
  "Inheritance",
  "Inheritance | Part 2",
  "Abstraction",
  "Polymorphism",
  "Python Standard Library",
  "Scope & Namespaces",
  "Errors & Exceptions",
  "Working with Date and Time",
];

export default function RemarksPage() {
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPerson, setFilterPerson] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterSession, setFilterSession] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterPerson) params.set("name", filterPerson);
    if (filterAction) params.set("action", filterAction);
    if (filterSession) params.set("session", filterSession);
    setLoading(true);
    fetch(`${API}/remarks?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setRemarks(d);
        setLoading(false);
      });
  }, [filterPerson, filterAction, filterSession]);

  // Extract unique person names from all remarks (initial load)
  const [allRemarks, setAllRemarks] = useState([]);
  useEffect(() => {
    fetch(`${API}/remarks`)
      .then((r) => r.json())
      .then((d) => setAllRemarks(d));
  }, []);

  const uniquePersons = useMemo(() => {
    const names = new Set(allRemarks.map((r) => r.name).filter(Boolean));
    return Array.from(names).sort();
  }, [allRemarks]);

  const personCounts = useMemo(() => {
    const counts = {};
    allRemarks
      .filter((r) => (!filterAction || r.action === filterAction) && (!filterSession || r.session === filterSession))
      .forEach((r) => {
        if (r.name) counts[r.name] = (counts[r.name] || 0) + 1;
      });
    return counts;
  }, [allRemarks, filterAction, filterSession]);

  const actionCounts = useMemo(() => {
    const counts = {};
    allRemarks
      .filter((r) => (!filterPerson || r.name === filterPerson) && (!filterSession || r.session === filterSession))
      .forEach((r) => {
        if (r.action) counts[r.action] = (counts[r.action] || 0) + 1;
      });
    return counts;
  }, [allRemarks, filterPerson, filterSession]);

  const sessionCounts = useMemo(() => {
    const counts = {};
    allRemarks
      .filter((r) => (!filterPerson || r.name === filterPerson) && (!filterAction || r.action === filterAction))
      .forEach((r) => {
        if (r.session) counts[r.session] = (counts[r.session] || 0) + 1;
      });
    return counts;
  }, [allRemarks, filterPerson, filterAction]);

  const hasFilters = filterPerson || filterAction || filterSession;

  const clearFilters = () => {
    setFilterPerson("");
    setFilterAction("");
    setFilterSession("");
  };

  if (loading && !hasFilters)
    return <div className="loading">Loading remarks...</div>;

  return (
    <div className="container">
      <div className="remarks-page-header">
        <h2>Remarks <span className="count">({remarks.length})</span></h2>
      </div>

      {/* Filters */}
      <div className="remarks-filters">
        <div className="remarks-filter-group">
          <label>Person</label>
          <select value={filterPerson} onChange={(e) => setFilterPerson(e.target.value)}>
            <option value="">All Persons</option>
            {uniquePersons.map((p) => (
              <option key={p} value={p}>{p} ({personCounts[p] || 0})</option>
            ))}
          </select>
        </div>
        <div className="remarks-filter-group">
          <label>Action</label>
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
            <option value="">All Actions</option>
            {ACTION_OPTIONS.map((a) => (
              <option key={a} value={a}>{a} ({actionCounts[a] || 0})</option>
            ))}
          </select>
        </div>
        <div className="remarks-filter-group">
          <label>Session</label>
          <select value={filterSession} onChange={(e) => setFilterSession(e.target.value)}>
            <option value="">All Sessions</option>
            {SESSION_OPTIONS.map((s) => (
              <option key={s} value={s}>{s} ({sessionCounts[s] || 0})</option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <button className="clear-all" onClick={clearFilters}>Clear Filters</button>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading remarks...</div>
      ) : remarks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">&#128172;</div>
          <p>{hasFilters ? "No remarks match the selected filters." : "No remarks have been added yet."}</p>
        </div>
      ) : (
        remarks.map((r) => {
          const a = r.question?.gpt_analysis || {};
          const covClass =
            a.is_covered === "COVERED" ? "covered" :
            a.is_covered === "PARTIALLY_COVERED" ? "partial" : "notcov";
          return (
            <div className="question-card" key={r._id}>
              <div className={`card-accent ${a.is_covered || ""}`} />
              <div className="card-body">
                <div className="q-header">
                  <div className="q-text">{r.question?.Question || "Unknown question"}</div>
                  <div className="q-badges">
                    {a.is_covered && (
                      <span className={`badge ${covClass}`}>
                        {IS_COVERED_LABELS[a.is_covered] || a.is_covered}
                      </span>
                    )}
                    {a.coverage_status && (
                      <span className="badge status-detail">
                        {STATUS_LABELS[a.coverage_status] || a.coverage_status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="q-meta-row">
                  {r.question?.["Company Name"] && (
                    <span className="meta-pill company">{r.question["Company Name"]}</span>
                  )}
                  {a.language && <span className="meta-pill lang">{a.language}</span>}
                  {r.question?.["Round Category"] && (
                    <span className="meta-pill round">{r.question["Round Category"]}</span>
                  )}
                  {a.how_covered && a.how_covered !== "NOT_APPLICABLE" && (
                    <span className={`meta-pill how ${HOW_COLORS[a.how_covered] || ""}`}>
                      {HOW_COVERED_LABELS[a.how_covered]}
                    </span>
                  )}
                  {a.similarity_percentage != null && (
                    <span className={`meta-pill sim ${a.similarity_percentage >= 80 ? "sim-high" : a.similarity_percentage >= 50 ? "sim-med" : "sim-low"}`}>
                      {a.similarity_percentage}% match
                    </span>
                  )}
                </div>

                {a.justification && (
                  <div className="q-justification">{a.justification}</div>
                )}

                {a.matches?.length > 0 && (
                  <div className="review-matches">
                    <div className="review-matches-label">Course Matches ({a.matches.length})</div>
                    <div className="match-list">
                      {a.matches.slice(0, 3).map((m, i) => (
                        <div className="match-row" key={i}>
                          <span className={`match-type-badge ${m.match_type}`}>{m.match_type}</span>
                          <a className="match-link" href={`https://learning.ccbp.in/question/${m.course_question_id}`} target="_blank" rel="noreferrer">
                            {m.course_short_text}
                          </a>
                          <span className="match-pct">{m.similarity_percentage}%</span>
                        </div>
                      ))}
                      {a.matches.length > 3 && (
                        <div className="match-more">+{a.matches.length - 3} more matches</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Remark */}
                <div className="rq-remark">
                  <div className="remark-header">
                    <span className="remark-author">{r.name}</span>
                    <span className="remark-date">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                    {r.action && (
                      <span className="meta-pill remark-action-pill">{r.action}</span>
                    )}
                    {r.session && (
                      <span className="meta-pill remark-session-pill">{r.session}</span>
                    )}
                  </div>
                  <div className="remark-body">{r.remark}</div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
