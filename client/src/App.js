import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import QuestionsPage from "./pages/QuestionsPage";
import RemarksPage from "./pages/RemarksPage";
import ReviewPage from "./pages/ReviewPage";
import "./App.css";

const API = "/api";

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={isActive ? "active" : ""}>
      {children}
    </Link>
  );
}

function App() {
  const [email, setEmail] = useState(Cookies.get("reviewer_email") || "");
  const [emailInput, setEmailInput] = useState("");
  const [registeredEmails, setRegisteredEmails] = useState([]);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    fetch(`${API}/reviewers`)
      .then((r) => r.json())
      .then((d) => setRegisteredEmails(d.map((r) => r.email)))
      .catch(() => {});
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const val = emailInput.trim().toLowerCase();
    if (!val) return;
    const fullEmail = val.includes("@") ? val : `${val}@nxtwave.co.in`;
    if (!fullEmail.endsWith("@nxtwave.co.in")) {
      setLoginError("Only @nxtwave.co.in emails are allowed");
      return;
    }
    const res = await fetch(`${API}/reviewers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fullEmail }),
    });
    if (res.ok) {
      Cookies.set("reviewer_email", fullEmail, { expires: 30 });
      setEmail(fullEmail);
      setLoginError("");
      if (!registeredEmails.includes(fullEmail)) {
        setRegisteredEmails([...registeredEmails, fullEmail].sort());
      }
    } else {
      setLoginError("Failed to register. Try again.");
    }
  };

  const handleSelectEmail = (em) => {
    Cookies.set("reviewer_email", em, { expires: 30 });
    setEmail(em);
  };

  if (!email) {
    return (
      <div className="name-prompt">
        <div className="name-card">
          <h2>Interview Intelligence</h2>
          <p className="subtitle">Sign in with your NxtWave email to review</p>
          <form onSubmit={handleLogin}>
            <div className="email-input-group">
              <input
                type="text"
                value={emailInput}
                onChange={(e) => { setEmailInput(e.target.value); setLoginError(""); }}
                placeholder="name@nxtwave.co.in"
                autoFocus
              />
            </div>
            {loginError && <div className="login-error">{loginError}</div>}
            <button type="submit">Continue</button>
          </form>
          {registeredEmails.length > 0 && (
            <div className="existing-users">
              <div className="divider-text">or select existing user</div>
              <div className="email-list">
                {registeredEmails.map((em) => (
                  <button
                    key={em}
                    className="email-option"
                    onClick={() => handleSelectEmail(em)}
                  >
                    <span className="email-avatar">{em.charAt(0).toUpperCase()}</span>
                    {em}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const displayName = email.split("@")[0];

  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <h1>Interview Intelligence</h1>
          <div className="nav-links">
            <NavLink to="/">Questions</NavLink>
            <NavLink to="/review">Review</NavLink>
            <NavLink to="/remarks">Remarks</NavLink>
          </div>
          <div className="nav-user">
            <div className="user-avatar">{displayName.charAt(0).toUpperCase()}</div>
            <span className="user-email" title={email}>{displayName}</span>
            <button
              className="btn-logout"
              onClick={() => {
                Cookies.remove("reviewer_email");
                setEmail("");
              }}
            >
              Sign out
            </button>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<QuestionsPage email={email} />} />
          <Route path="/review" element={<ReviewPage email={email} />} />
          <Route path="/remarks" element={<RemarksPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
