
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const admin = require("firebase-admin");

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

let firebaseReady = false;
let firebaseError = "";
try {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  firebaseReady = true;
} catch (error) {
  console.error("Firebase Admin setup error:", error.message);
  firebaseError = error.message;
}

app.get("/", (req, res) => {
  res.send("Prem UI Studio Backend is Running!");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    database: "connected",
    firebase: firebaseReady ? "connected" : "not configured",
    firebaseError: firebaseError
  });
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
      message: "Account created. Phone verification is required.",
      userId: result.lastInsertRowid
    });

  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        success: false,
        message: "This email or phone is already registered."
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error."
    });
  }
});

// Verify Firebase phone token and update the matching account
app.post("/api/verify-phone", async (req, res) => {
  try {
    if (!firebaseReady) {
      return res.status(503).json({
        success: false,
        message: "Firebase Admin is not configured."
      });
    }

    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID token is required."
      });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const verifiedPhone = decoded.phone_number;

    if (!verifiedPhone) {
      return res.status(400).json({
        success: false,
        message: "Verified phone number not found."
      });
    }

    const result = db.prepare(`
      UPDATE users
      SET phone_verified = 1
      WHERE phone = ?
    `).run(verifiedPhone);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: "No signup account found for this phone number."
      });
    }

    res.json({
      success: true,
      message: "Phone verified successfully."
    });

  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: "Phone verification failed."
    });
  }
});

// Login using the existing signup password
app.post("/api/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone/email and password are required."
      });
    }

    const value = identifier.trim();

    const user = db.prepare(`
      SELECT * FROM users
      WHERE phone = ? OR email = ?
    `).get(value, value.toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account not found."
      });
    }

    if (user.phone_verified !== 1) {
      return res.status(403).json({
        success: false,
        message: "Please verify your phone first."
      });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password."
      });
    }

    res.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
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
