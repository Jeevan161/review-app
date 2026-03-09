import { useState, useEffect, useCallback } from "react";

const API = "/api";

const IS_COVERED_OPTIONS = {
  COVERED: "Covered",
  PARTIALLY_COVERED: "Partially Covered",
  NOT_COVERED: "Not Covered",
};

const HOW_COVERED_OPTIONS = {
  EXACT_MATCH: "Exact Match",
  VARIANT: "Variant",
  SYNTAX_COVERED: "Syntax Covered",
  CONCEPT_COVERED: "Concept Covered",
  NOT_APPLICABLE: "N/A",
};

const STATUS_OPTIONS = {
  EXACT_MATCH: "Exact Match",
  NAME_CHANGE_VARIANT: "Name Variant",
  INPUT_CHANGED_VARIANT: "Input Variant",
  SYNTAX_COVERED: "Syntax Covered",
  PARTIALLY_COVERED: "Partially Covered",
  CONCEPT_COVERED: "Concept Covered",
  NOT_COVERED: "Not Covered",
  OTHER_LANGUAGE: "Other Language",
};

const IS_COVERED_LABELS = {
  COVERED: "Covered",
  PARTIALLY_COVERED: "Partial",
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

const HOW_COLORS = {
  EXACT_MATCH: "how-exact",
  VARIANT: "how-variant",
  SYNTAX_COVERED: "how-syntax",
  CONCEPT_COVERED: "how-concept",
};

const STATUS_CHIP_COLORS = {
  EXACT_MATCH: "green",
  NAME_CHANGE_VARIANT: "teal",
  INPUT_CHANGED_VARIANT: "teal",
  SYNTAX_COVERED: "purple",
  PARTIALLY_COVERED: "yellow",
  CONCEPT_COVERED: "orange",
  NOT_COVERED: "red",
  OTHER_LANGUAGE: "purple",
};

const HOW_CHIP_COLORS = {
  EXACT_MATCH: "green",
  VARIANT: "teal",
  SYNTAX_COVERED: "purple",
  CONCEPT_COVERED: "orange",
  NOT_APPLICABLE: "",
};

function ExpandableSection({ label, count, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="expand-section">
      <div className="expand-toggle" onClick={() => setOpen(!open)}>
        <span className={`arrow ${open ? "open" : ""}`}>&#9654;</span>
        {label}
        {count != null && <span className="count">{count}</span>}
      </div>
      <div className={`expand-content ${open ? "expanded" : "collapsed"}`}>
        {open && <div className="expand-inner">{children}</div>}
      </div>
    </div>
  );
}

function EditDropdowns({ question, email, onSave }) {
  const a = question.gpt_analysis || {};
  const [editing, setEditing] = useState(false);
  const [isCovered, setIsCovered] = useState(a.is_covered || "");
  const [howCovered, setHowCovered] = useState(a.how_covered || "");
  const [coverageStatus, setCoverageStatus] = useState(a.coverage_status || "");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const loadHistory = async () => {
    const res = await fetch(`${API}/questions/${question._id}/history`);
    const data = await res.json();
    setHistory(data);
    setShowHistory(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`${API}/questions/${question._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          is_covered: isCovered,
          how_covered: howCovered,
          coverage_status: coverageStatus,
        },
        changed_by: email,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      onSave(data.question);
      setEditing(false);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setIsCovered(a.is_covered || "");
    setHowCovered(a.how_covered || "");
    setCoverageStatus(a.coverage_status || "");
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="edit-actions">
        <button className="btn-edit" onClick={() => setEditing(true)}>Edit</button>
        <button className="btn-history" onClick={loadHistory}>
          {showHistory ? "Hide History" : "History"}
        </button>
        {showHistory && history.length > 0 && (
          <div className="change-history">
            {history.map((h, i) => (
              <div className="history-entry" key={i}>
                <span className="history-field">{h.field}</span>
                <span className="history-change">
                  {h.old_value || "—"} → {h.new_value}
                </span>
                <span className="history-by">{h.changed_by}</span>
                <span className="history-date">{new Date(h.changed_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
        {showHistory && history.length === 0 && (
          <div className="history-empty">No changes recorded</div>
        )}
      </div>
    );
  }

  return (
    <div className="edit-panel">
      <div className="edit-row">
        <label>Is Covered</label>
        <select value={isCovered} onChange={(e) => setIsCovered(e.target.value)}>
          <option value="">Select...</option>
          {Object.entries(IS_COVERED_OPTIONS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div className="edit-row">
        <label>How Covered</label>
        <select value={howCovered} onChange={(e) => setHowCovered(e.target.value)}>
          <option value="">Select...</option>
          {Object.entries(HOW_COVERED_OPTIONS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div className="edit-row">
        <label>Coverage Status</label>
        <select value={coverageStatus} onChange={(e) => setCoverageStatus(e.target.value)}>
          <option value="">Select...</option>
          {Object.entries(STATUS_OPTIONS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div className="edit-buttons">
        <button className="btn-save" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
}

function QuestionCard({ q: initialQ, email }) {
  const [q, setQ] = useState(initialQ);
  const [remarks, setRemarks] = useState([]);
  const [remarkText, setRemarkText] = useState("");
  const [loadedRemarks, setLoadedRemarks] = useState(false);
  const a = q.gpt_analysis || {};

  const loadRemarks = useCallback(async () => {
    const res = await fetch(`${API}/questions/${q._id}/remarks`);
    const data = await res.json();
    setRemarks(data);
    setLoadedRemarks(true);
  }, [q._id]);

  const submitRemark = async (e) => {
    e.preventDefault();
    if (!remarkText.trim()) return;
    await fetch(`${API}/questions/${q._id}/remarks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: email, remark: remarkText.trim() }),
    });
    setRemarkText("");
    loadRemarks();
  };

  const covClass =
    a.is_covered === "COVERED" ? "covered" :
    a.is_covered === "PARTIALLY_COVERED" ? "partial" : "notcov";

  return (
    <div className="question-card">
      <div className={`card-accent ${a.is_covered || ""}`} />
      <div className="card-body">
        <div className="q-header">
          <div className="q-text">{q.Question}</div>
          <div className="q-badges">
            <span className={`badge ${covClass}`}>
              {IS_COVERED_LABELS[a.is_covered] || a.is_covered}
            </span>
            <span className="badge status-detail">
              {STATUS_LABELS[a.coverage_status] || a.coverage_status}
            </span>
          </div>
        </div>

        <div className="q-meta-row">
          {q["Company Name"] && (
            <span className="meta-pill company">{q["Company Name"]}</span>
          )}
          {a.language && <span className="meta-pill lang">{a.language}</span>}
          {q["Round Category"] && (
            <span className="meta-pill round">{q["Round Category"]}</span>
          )}
          {a.how_covered && a.how_covered !== "NOT_APPLICABLE" && (
            <span className={`meta-pill how ${HOW_COLORS[a.how_covered] || ""}`}>
              {HOW_COVERED_LABELS[a.how_covered]}
            </span>
          )}
          {a.similarity_percentage != null && (
            <span
              className={`meta-pill sim ${
                a.similarity_percentage >= 80
                  ? "sim-high"
                  : a.similarity_percentage >= 50
                  ? "sim-med"
                  : "sim-low"
              }`}
            >
              {a.similarity_percentage}% match
            </span>
          )}
        </div>

        {a.matched_topics?.length > 0 && (
          <div className="q-topics">
            {a.matched_topics.map((t) => (
              <span className="topic-tag" key={t}>{t}</span>
            ))}
          </div>
        )}

        {a.justification && (
          <div className="q-justification">{a.justification}</div>
        )}

        <EditDropdowns question={q} email={email} onSave={(updated) => setQ(updated)} />

        {a.matches?.length > 0 && (
          <ExpandableSection
            label="Course Matches"
            count={a.matches.length}
          >
            <div className="match-list">
              {a.matches.map((m, i) => (
                <div className="match-row" key={i}>
                  <span className={`match-type-badge ${m.match_type}`}>
                    {m.match_type}
                  </span>
                  <a
                    className="match-link"
                    href={`https://learning.ccbp.in/question/${m.course_question_id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {m.course_short_text}
                  </a>
                  {m.unit_name && (
                    <span className="match-unit-name" title={m.unit_name}>
                      {m.unit_name}
                    </span>
                  )}
                  <span className="match-pct">{m.similarity_percentage}%</span>
                </div>
              ))}
            </div>
          </ExpandableSection>
        )}

        <ExpandableSection
          label="Remarks"
          count={loadedRemarks ? remarks.length : null}
          defaultOpen={false}
        >
          <div className="remarks-area" onFocus={() => { if (!loadedRemarks) loadRemarks(); }} onMouseEnter={() => { if (!loadedRemarks) loadRemarks(); }}>
            <form className="remark-form" onSubmit={submitRemark}>
              <input
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                placeholder="Add a remark..."
                onFocus={() => { if (!loadedRemarks) loadRemarks(); }}
              />
              <button type="submit">Add</button>
            </form>
            {remarks.map((r) => (
              <div className="remark-entry" key={r._id}>
                <div className="remark-header">
                  <span className="remark-author">{r.name}</span>
                  <span className="remark-date">
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="remark-body">{r.remark}</div>
              </div>
            ))}
            {loadedRemarks && remarks.length === 0 && (
              <div className="remark-empty">No remarks yet</div>
            )}
          </div>
        </ExpandableSection>
      </div>
    </div>
  );
}

export default function QuestionsPage({ email }) {
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const limit = 15;

  const [filterCovered, setFilterCovered] = useState("");
  const [filterHow, setFilterHow] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLang, setFilterLang] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API}/stats`)
      .then((r) => r.json())
      .then((d) => setStats(d));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit });
    if (filterCovered) params.set("is_covered", filterCovered);
    if (filterHow) params.set("how_covered", filterHow);
    if (filterStatus) params.set("status", filterStatus);
    if (filterLang) params.set("language", filterLang);
    if (search) params.set("search", search);
    fetch(`${API}/questions?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setQuestions(d.questions);
        setTotal(d.total);
        setLoading(false);
      });
  }, [page, filterCovered, filterHow, filterStatus, filterLang, search]);

  const totalPages = Math.ceil(total / limit);

  const clearFilters = () => {
    setFilterCovered("");
    setFilterHow("");
    setFilterStatus("");
    setFilterLang("");
    setSearch("");
    setSearchInput("");
    setPage(1);
  };

  const hasActiveFilter = filterCovered || filterHow || filterStatus || filterLang || search;

  const covMap = {};
  stats?.is_covered?.forEach((s) => { covMap[s._id] = s.count; });

  const pageNumbers = [];
  const maxVisible = 5;
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  return (
    <div className="container">
      {/* Dashboard Stats */}
      {stats && (
        <div className="dashboard-header">
          <div
            className={`stat-card total ${!filterCovered ? "active" : ""}`}
            onClick={() => { setFilterCovered(""); setPage(1); }}
          >
            <div className="stat-label">Total Questions</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-bar" style={{ width: "100%" }} />
          </div>
          <div
            className={`stat-card covered ${filterCovered === "COVERED" ? "active" : ""}`}
            onClick={() => { setFilterCovered(filterCovered === "COVERED" ? "" : "COVERED"); setPage(1); }}
          >
            <div className="stat-label">Covered</div>
            <div className="stat-value">{covMap.COVERED || 0}</div>
            <div className="stat-bar" style={{ width: `${((covMap.COVERED || 0) / stats.total) * 100}%` }} />
          </div>
          <div
            className={`stat-card partial ${filterCovered === "PARTIALLY_COVERED" ? "active" : ""}`}
            onClick={() => { setFilterCovered(filterCovered === "PARTIALLY_COVERED" ? "" : "PARTIALLY_COVERED"); setPage(1); }}
          >
            <div className="stat-label">Partial</div>
            <div className="stat-value">{covMap.PARTIALLY_COVERED || 0}</div>
            <div className="stat-bar" style={{ width: `${((covMap.PARTIALLY_COVERED || 0) / stats.total) * 100}%` }} />
          </div>
          <div
            className={`stat-card notcov ${filterCovered === "NOT_COVERED" ? "active" : ""}`}
            onClick={() => { setFilterCovered(filterCovered === "NOT_COVERED" ? "" : "NOT_COVERED"); setPage(1); }}
          >
            <div className="stat-label">Not Covered (Python)</div>
            <div className="stat-value">{stats.python_not_covered ?? 0}</div>
            <div className="stat-bar" style={{ width: `${((stats.python_not_covered ?? 0) / stats.python_total) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Search */}
      <div className="search-bar">
        <span className="search-icon">&#128269;</span>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput.trim()); setPage(1); } }}
          placeholder="Search questions, companies, topics..."
        />
        {searchInput && (
          <button
            type="button"
            className="search-clear"
            onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
          >
            &#10005;
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {stats && (
        <div className="filter-panel">
          <div className="filter-row">
            <span className="filter-label">Status</span>
            <div className="filter-chips">
              {stats.coverage_status.map((s) => (
                <span
                  key={s._id}
                  className={`f-chip ${STATUS_CHIP_COLORS[s._id] || ""} ${filterStatus === s._id ? "active" : ""}`}
                  onClick={() => { setFilterStatus(filterStatus === s._id ? "" : s._id); setPage(1); }}
                >
                  {STATUS_LABELS[s._id] || s._id} ({s.count})
                </span>
              ))}
            </div>
          </div>
          <div className="filter-row">
            <span className="filter-label">How Covered</span>
            <div className="filter-chips">
              {stats.how_covered.map((s) => (
                <span
                  key={s._id}
                  className={`f-chip ${HOW_CHIP_COLORS[s._id] || ""} ${filterHow === s._id ? "active" : ""}`}
                  onClick={() => { setFilterHow(filterHow === s._id ? "" : s._id); setPage(1); }}
                >
                  {HOW_COVERED_LABELS[s._id] || s._id} ({s.count})
                </span>
              ))}
            </div>
          </div>
          <div className="filter-row">
            <span className="filter-label">Language</span>
            <div className="filter-chips">
              {stats.languages.map((s) => (
                <span
                  key={s._id}
                  className={`f-chip ${filterLang === s._id ? "active" : ""}`}
                  onClick={() => { setFilterLang(filterLang === s._id ? "" : s._id); setPage(1); }}
                >
                  {s._id || "Unknown"} ({s.count})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilter && (
        <div className="active-filters">
          {filterCovered && (
            <span className="af-pill">
              {IS_COVERED_LABELS[filterCovered] || filterCovered}
              <button onClick={() => { setFilterCovered(""); setPage(1); }}>&#10005;</button>
            </span>
          )}
          {filterHow && (
            <span className="af-pill">
              {HOW_COVERED_LABELS[filterHow]}
              <button onClick={() => { setFilterHow(""); setPage(1); }}>&#10005;</button>
            </span>
          )}
          {filterStatus && (
            <span className="af-pill">
              {STATUS_LABELS[filterStatus]}
              <button onClick={() => { setFilterStatus(""); setPage(1); }}>&#10005;</button>
            </span>
          )}
          {filterLang && (
            <span className="af-pill">
              {filterLang}
              <button onClick={() => { setFilterLang(""); setPage(1); }}>&#10005;</button>
            </span>
          )}
          {search && (
            <span className="af-pill">
              &ldquo;{search}&rdquo;
              <button onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}>&#10005;</button>
            </span>
          )}
          <span className="af-count">
            {total} result{total !== 1 ? "s" : ""}
          </span>
          <button className="clear-all" onClick={clearFilters}>Clear all</button>
        </div>
      )}

      {/* Questions */}
      {loading ? (
        <div className="loading">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">?</div>
          <p>No questions match your filters</p>
        </div>
      ) : (
        questions.map((q) => (
          <QuestionCard key={q._id} q={q} email={email} />
        ))
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            &#8592; Prev
          </button>
          <div className="page-numbers">
            {startPage > 1 && (
              <>
                <span className="page-num" onClick={() => setPage(1)}>1</span>
                {startPage > 2 && <span className="page-info">...</span>}
              </>
            )}
            {pageNumbers.map((n) => (
              <span
                key={n}
                className={`page-num ${n === page ? "active" : ""}`}
                onClick={() => setPage(n)}
              >
                {n}
              </span>
            ))}
            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && <span className="page-info">...</span>}
                <span className="page-num" onClick={() => setPage(totalPages)}>{totalPages}</span>
              </>
            )}
          </div>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next &#8594;
          </button>
        </div>
      )}
    </div>
  );
}
