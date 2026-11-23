
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");

const app = express();

app.use(cors({
  origin: "https://malhip843-arch.github.io"
}));
app.use(express.json());

const db = new Database("/data/prem-ui-studio.db");

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone_verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

app.get("/", (req, res) => {
  res.send("Prem UI Studio Backend is Running!");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", database: "connected" });
});

app.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, phone and password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = db.prepare(`
      INSERT INTO users (full_name, email, phone, password_hash)
      VALUES (?, ?, ?, ?)
    `).run(
      fullName.trim(),
      email ? email.trim().toLowerCase() : null,
      phone.trim(),
      passwordHash
    );

    res.status(201).json({
      success: true,
      message: "Account created. Phone verification is still required.",
      userId: result.lastInsertRowid
    });

  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        success: false,
        message: "This email or phone number is already registered."
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
