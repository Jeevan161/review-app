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
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="remarks-filter-group">
          <label>Action</label>
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
            <option value="">All Actions</option>
            {ACTION_OPTIONS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="remarks-filter-group">
          <label>Session</label>
          <select value={filterSession} onChange={(e) => setFilterSession(e.target.value)}>
            <option value="">All Sessions</option>
            {SESSION_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
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
          const isCov = r.question?.gpt_analysis?.is_covered;
          const status = r.question?.gpt_analysis?.coverage_status;
          const howCov = r.question?.gpt_analysis?.how_covered;
          const lang = r.question?.gpt_analysis?.language;
          const covClass =
            isCov === "COVERED" ? "covered" :
            isCov === "PARTIALLY_COVERED" ? "partial" : "notcov";
          return (
            <div className="remarks-page-card" key={r._id}>
              <div className="rq-question-section">
                <div className="rq-question-label">Question</div>
                <div className="rq">{r.question?.Question || "Unknown question"}</div>
                <div className="rq-meta">
                  {r.question?.["Company Name"] && (
                    <span className="meta-pill company">{r.question["Company Name"]}</span>
                  )}
                  {r.question?.["Round Category"] && (
                    <span className="meta-pill round">{r.question["Round Category"]}</span>
                  )}
                  {lang && (
                    <span className="meta-pill lang">{lang}</span>
                  )}
                  {isCov && (
                    <span className={`badge ${covClass}`}>
                      {IS_COVERED_LABELS[isCov] || isCov}
                    </span>
                  )}
                  {status && (
                    <span className="badge status-detail">
                      {STATUS_LABELS[status] || status}
                    </span>
                  )}
                  {howCov && howCov !== "NOT_APPLICABLE" && (
                    <span className="badge how-badge">
                      {HOW_COVERED_LABELS[howCov] || howCov}
                    </span>
                  )}
                </div>
              </div>
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
          );
        })
      )}
    </div>
  );
}
