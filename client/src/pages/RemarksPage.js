import { useState, useEffect } from "react";

const API = "/api";

const IS_COVERED_LABELS = {
  COVERED: "Covered",
  PARTIALLY_COVERED: "Partial",
  NOT_COVERED: "Not Covered",
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

export default function RemarksPage() {
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/remarks`)
      .then((r) => r.json())
      .then((d) => {
        setRemarks(d);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading remarks...</div>;

  if (remarks.length === 0)
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-icon">&#128172;</div>
          <p>No remarks have been added yet.</p>
        </div>
      </div>
    );

  return (
    <div className="container">
      <div className="remarks-page-header">
        <h2>Remarks <span className="count">({remarks.length})</span></h2>
      </div>
      {remarks.map((r) => {
        const isCov = r.question?.gpt_analysis?.is_covered;
        const status = r.question?.gpt_analysis?.coverage_status;
        const covClass =
          isCov === "COVERED" ? "covered" :
          isCov === "PARTIALLY_COVERED" ? "partial" : "notcov";
        return (
          <div className="remarks-page-card" key={r._id}>
            <div className="rq">{r.question?.Question || "Unknown question"}</div>
            <div className="rq-meta">
              {r.question?.["Company Name"] && (
                <span className="meta-pill company">{r.question["Company Name"]}</span>
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
            </div>
            <div className="rq-remark">
              <div className="remark-header">
                <span className="remark-author">{r.name}</span>
                <span className="remark-date">
                  {new Date(r.created_at).toLocaleString()}
                </span>
              </div>
              <div className="remark-body">{r.remark}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
