const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const crypto = require('crypto');
const connectDB = require("./config/database.js");
const session = require('express-session');
const User = require('./models/User.js');

dotenv.config();

connectDB();

const app = express();
app.use(cookieParser());

app.use(cors({ origin: "*", credentials: true }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(session({
  secret: 'ASDFGHJKL', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, 
}));

// Routes
app.use("/api/v1/auth", require("./routes/authRoutes.js"));
app.use("/api/v1/jobs", require("./routes/jobRoutes.js"));
app.use("/api/v1/application", require("./routes/applicationRoutes.js"));



// Ensure admin exists
(async () => {
  try {
    await User.ensureAdminExists();
    console.log("Admin account verified/created.");
  } catch (err) {
    console.error("Error ensuring admin account:", err);
  }
})();

// Set the port
const PORT = process.env.PORT || 8081;

// Start the server
app.listen(PORT, () => {
  console.log(`Node Server Running On Port ${PORT}`);
});
