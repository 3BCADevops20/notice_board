import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

// ✅ Render API base URL
const API_URL = "https://notice-board20.onrender.com/api/notices";

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

  // 🔹 Fetch notices
  useEffect(() => {
    axios
      .get(API_URL)
      .then((response) => setNotices(response.data))
      .catch((error) => console.error("Error fetching notices:", error));
  }, []);

  // 🔹 Handle login
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

  // 🔹 Add or Update notice (ADMIN only)
  const handleSaveNotice = () => {
    if (!title.trim() || !category.trim() || !description.trim()) {
      alert("All fields are required!");
      return;
    }

    const noticeData = { title, category, description };

    if (editId) {
      axios
        .put(`${API_URL}/${editId}`, noticeData)
        .then((response) => {
          setNotices(notices.map((n) => (n.id === editId ? response.data : n)));
          resetForm();
        })
        .catch((error) => console.error("Error updating notice:", error));
    } else {
      axios
        .post(API_URL, noticeData)
        .then((response) => {
          setNotices([...notices, response.data]);
          resetForm();
        })
        .catch((error) => console.error("Error adding notice:", error));
    }
  };

  // 🔹 Delete notice (ADMIN only)
  const handleDelete = (id) => {
    axios
      .delete(`${API_URL}/${id}`)
      .then(() => setNotices(notices.filter((n) => n.id !== id)))
      .catch((error) => console.error("Error deleting notice:", error));
  };

  // 🔹 Edit notice
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

  // 🔹 Logout
  const handleLogout = () => {
    setRole(null);
    setUsername("");
    setPassword("");
    setShowLoginForm(false);
    resetForm();
  };

  // 🔹 Landing page
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

  // 🔹 Admin login form
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

        <div style={{ position: "relative", marginBottom: "16px" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button onClick={handleLogin}>Login</button>
        <button onClick={() => setShowLoginForm(false)}>Back</button>
      </div>
    );
  }

  // 🔹 Main app
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
          <button onClick={handleSaveNotice}>
            {editId ? "Update Notice" : "Add Notice"}
          </button>
        </div>
      )}

      <div className="notice-section">
        <h2>📋 All Notices</h2>
        {notices.length === 0 ? (
          <p>📭 No notices yet.</p>
        ) : (
          notices.map((notice) => (
            <div key={notice.id} className="notice-card">
              <h3>{notice.title}</h3>
              <p>{notice.category}</p>
              <p>{notice.description}</p>

              {role === "ADMIN" && (
                <>
                  <button onClick={() => handleEdit(notice)}>✏️ Edit</button>
                  <button onClick={() => handleDelete(notice.id)}>🗑️ Delete</button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
