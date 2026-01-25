import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [notices, setNotices] = useState([]);
  const [editId, setEditId] = useState(null);

  // Login state
  const [role, setRole] = useState(null); // "ADMIN" or "USER"
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Fetch notices
  useEffect(() => {
    axios.get("http://localhost:8080/api/notices")
      .then(response => setNotices(response.data))
      .catch(error => console.error("Error fetching notices:", error));
  }, []);

  // Handle login
  const handleLogin = () => {
    if (username === "admin" && password === "admin") {
      setRole("ADMIN");
      setShowLoginForm(false);
    } else if (username === "user" && password === "user") {
      setRole("USER");
      setShowLoginForm(false);
    } else {
      alert("Invalid credentials!");
    }
  };

  // Add or Update notice (only admin)
  const handleSaveNotice = () => {
    if (title.trim() === "" || category.trim() === "" || description.trim() === "") {
      alert("All fields are required!");
      return;
    }

    const noticeData = { title, category, description };

    if (editId) {
      axios.put(`http://localhost:8080/api/notices/${editId}`, noticeData)
        .then(response => {
          setNotices(notices.map(n => n.id === editId ? response.data : n));
          resetForm();
        })
        .catch(error => console.error("Error updating notice:", error));
    } else {
      axios.post("http://localhost:8080/api/notices", noticeData)
        .then(response => {
          setNotices([...notices, response.data]);
          resetForm();
        })
        .catch(error => console.error("Error adding notice:", error));
    }
  };

  // Delete notice (only admin)
  const handleDelete = (id) => {
    axios.delete(`http://localhost:8080/api/notices/${id}`)
      .then(() => setNotices(notices.filter(n => n.id !== id)))
      .catch(error => console.error("Error deleting notice:", error));
  };

  // Edit notice (only admin)
  const handleEdit = (notice) => {
    setTitle(notice.title);
    setCategory(notice.category);
    setDescription(notice.description);
    setEditId(notice.id);
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setDescription("");
    setEditId(null);
  };

  // Logout handler
  const handleLogout = () => {
    setRole(null);
    setUsername("");
    setPassword("");
    setShowLoginForm(false);
    resetForm();
  };

  // Landing page → choose role
  if (!role && !showLoginForm) {
    return (
      <div className="landing">
        <h1>📢 Digital Notice Board</h1>
        <p>Choose your role to continue</p>
        <div className="landing-buttons">
          <button onClick={() => setRole("USER")}>👤 View as User</button>
          <button onClick={() => setShowLoginForm(true)}>👨‍💼 Admin Login</button>
        </div>
      </div>
    );
  }

  // Admin login form
  if (showLoginForm && !role) {
    return (
      <div className="login-section">
        <h2>🔐 Admin Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: '100%',
              paddingRight: '45px',
              padding: '14px 45px 14px 16px',
              border: '1.5px solid var(--border)',
              borderRadius: '10px',
              fontSize: '15px',
              fontFamily: 'inherit',
              color: 'var(--text-primary)',
              background: 'var(--bg-tertiary)',
              transition: 'all 0.3s ease',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.background = 'var(--bg-primary)';
              e.target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.background = 'var(--bg-tertiary)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        <button onClick={handleLogin}>Login</button>
        <button onClick={() => setShowLoginForm(false)}>Back</button>
      </div>
    );
  }

  // Main app
  return (
    <div className="App">
      <header className="App-header">
        <div className="App-header-title">📢 Digital Notice Board</div>
        <div className="App-header-role">
          {role === "ADMIN" ? "👨‍💼 ADMIN" : "👤 USER"}
          <button onClick={handleLogout}>Home</button>
        </div>
      </header>

      {role === "ADMIN" && (
        <div className="form-section">
          <h2>{editId ? "✏️ Edit Notice" : "➕ Create New Notice"}</h2>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="btn-row">
            {editId && <button onClick={resetForm}>Cancel</button>}
            <button onClick={handleSaveNotice}>
              {editId ? "Update Notice" : "Add Notice"}
            </button>
          </div>
        </div>
      )}

      <div className="notice-section">
        <h2>📋 All Notices {role === "USER" && "(Read Only)"}</h2>
        {notices.length === 0 ? (
          <p>📭 No notices yet.</p>
        ) : (
          <div className="notice-grid">
            {notices.map((notice) => (
              <div key={notice.id} className="notice-card">
                <h3>{notice.title}</h3>
                <div className="category">{notice.category}</div>
                <p>{notice.description}</p>
                {role === "ADMIN" && (
                  <div className="button-group">
                    <button onClick={() => handleEdit(notice)}>✏️ Edit</button>
                    <button onClick={() => handleDelete(notice.id)}>🗑️ Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
