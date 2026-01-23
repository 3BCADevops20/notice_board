import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
} from "react-router-dom";
import "./App.css";

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "college@123",
};

function Header() {
  return (
    <header className="App-header">
      <span role="img" aria-label="megaphone">📢</span>
      <h1 className="App-header-title">Digital Notice Board</h1>
    </header>
  );
}

function Home() {
  return (
    <div className="section" style={{ textAlign: "center" }}>
      <h2>Select Role</h2>
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 20 }}>
        <Link to="/notices" className="btn-primary">Users</Link>
        <Link to="/admin" className="btn-secondary">Admin</Link>
      </div>
    </div>
  );
}

/* USERS: Read-only Notice Board */
function NoticeList() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/notices")
      .then(res => setNotices(res.data || []))
      .catch(err => console.error("Error fetching notices:", err));
  }, []);

  return (
    <div className="notice-section">
      <h2>Notices</h2>
      {notices.length === 0 ? (
        <div className="empty">No notices yet.</div>
      ) : (
        <div className="notice-grid">
          {notices.map((n) => (
            <div key={n.id} className="notice-card">
              <h3>{n.title}</h3>
              <p><strong>Category:</strong> {n.category}</p>
              <p>{n.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ADMIN LOGIN */
function AdminLogin({ onLogin, isAuthed }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthed) navigate("/admin/add");
  }, [isAuthed, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      onLogin(true);
      navigate("/admin/add");
    } else {
      setErr("Invalid username or password");
    }
  };

  return (
    <div className="section" style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2>Admin Login</h2>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <input type="text" placeholder="Admin username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="btn-primary">Login</button>
      </form>
    </div>
  );
}

/* ADMIN PANEL: Add + Delete */
function AdminAddNotice({ isAuthed, onLogout }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [notices, setNotices] = useState([]);
  const navigate = useNavigate();

  // ✅ Always call hooks first
  useEffect(() => {
    if (isAuthed) {
      fetchNotices();
    }
  }, [isAuthed]);

  const fetchNotices = () => {
    axios.get("http://localhost:8080/api/notices")
      .then(res => setNotices(res.data || []))
      .catch(err => console.error("Error fetching notices:", err));
  };

  if (!isAuthed) return <Navigate to="/admin" replace />;

  const handleAddNotice = () => {
    if (!title.trim() || !category.trim() || !description.trim()) {
      setStatus("❌ All fields are required!");
      return;
    }

    const newNotice = { title, category, description };

    axios.post("http://localhost:8080/api/notices", newNotice)
      .then(() => {
        setStatus("✅ Notice added successfully.");
        setTitle(""); setCategory(""); setDescription("");
        fetchNotices();
      })
      .catch(err => {
        console.error("Error adding notice:", err);
        setStatus("⚠️ Added locally. Backend did not confirm.");
      });
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:8080/api/notices/${id}`)
      .then(() => {
        setNotices(notices.filter(n => n.id !== id));
      })
      .catch(err => console.error("Error deleting notice:", err));
  };

  const handleExit = () => {
    onLogout();
    navigate("/");
  };

  return (
    <div className="form-section">
      <h2>Admin Panel</h2>
      {status && <p style={{ fontWeight: "bold", color: status.includes("✅") ? "green" : "orange" }}>{status}</p>}

      {/* Add Notice Form */}
      <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
      <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="btn-row">
        <button className="btn-primary" onClick={handleAddNotice}>Add Notice</button>
        <button className="btn-secondary" onClick={handleExit}>Exit</button>
      </div>

      {/* Admin Notice List with Delete */}
      <div className="notice-section" style={{ marginTop: "24px" }}>
        <h2>Manage Notices</h2>
        {notices.length === 0 ? (
          <div className="empty">No notices yet.</div>
        ) : (
          <div className="notice-grid">
            {notices.map((n) => (
              <div key={n.id} className="notice-card">
                <h3>{n.title}</h3>
                <p><strong>Category:</strong> {n.category}</p>
                <p>{n.description}</p>
                <button className="btn-secondary" onClick={() => handleDelete(n.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [isAuthed, setIsAuthed] = useState(false);
  const handleLogout = () => setIsAuthed(false);

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notices" element={<NoticeList />} />
          <Route path="/admin" element={<AdminLogin onLogin={setIsAuthed} isAuthed={isAuthed} />} />
          <Route path="/admin/add" element={<AdminAddNotice isAuthed={isAuthed} onLogout={handleLogout} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
