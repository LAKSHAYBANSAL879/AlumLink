const express = require("express"); 
// Importing Express framework to create a web server and handle HTTP routes.
const colors=require('colors')
// Loads colors library
const dotenv = require("dotenv");
// Loads environment variables from a .env file into process.env.

const cookieParser = require('cookie-parser');
// Middleware to parse and manage cookies in incoming requests.

const cors = require('cors');
// Enables Cross-Origin Resource Sharing, allowing requests from different domains (useful during development when frontend and backend are on different ports).

const connectDB = require("./config/database.js");
// Custom file to handle MongoDB connection logic.

const session = require('express-session');
// Middleware to handle user session management (e.g., login sessions).

const MongoStore = require('connect-mongo');
// Stores Express session data in MongoDB for persistence across restarts.

const User = require('./models/User.js');
// Mongoose model representing the User collection/schema in MongoDB.

const http = require('http');
// Node.js built-in module to create a low-level HTTP server (required for integrating socket.io with Express).

const socketIO = require('socket.io');
// Enables real-time, bidirectional communication between client and server (WebSocket abstraction).

const { initializeSocket } = require('./socket.js');
// Custom module where the socket.io server logic (event listeners and handlers) is initialized.

// setting up mongodb connection
dotenv.config();
connectDB();

// initializing a express server
const app = express();
const server = http.createServer(app); // this is explictly needed if using socket,web scoket or any server-socket interaction 
//else const app=express() would underhood handle it 

//establishing socket server
const io = socketIO(server, {
  cors: {
    origin: "*",
    credentials: true
  }
});

// Initialize Socket.IO
const { connectedUsers } = initializeSocket(io);
global.io = io;
//middlewares setup would need app.use
app.use(cookieParser());
app.use(cors({ origin: "*", credentials: true }));
// credentials true means allow sending cookie or auth header across origin'Do not include cookies (document.cookie), Authorization headers, or TLS client certificates when making cross-origin requests.
// Any request from the frontend (React) won’t send cookies, and the browser won’t store any Set-Cookie response either.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Parses incoming application/x-www-form-urlencoded data (used in HTML form submissions).
// extended: true → Allows parsing of nested objects.

// ✅ MongoDB session store setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'ASDFGHJKL',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    ttl: 14 * 24 * 60 * 60, // 14 days
    collectionName: 'sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 1000 * 60 * 60 * 24 * 7, 
    sameSite: 'lax'
  }
}));
// A session object is created (e.g., req.session.user = userData)

// A signed session ID is stored in the user's browser as a cookie.
// 
// The session data is stored in MongoDB.

// On each request, Express reads the session ID from the cookie, fetches the session data from MongoDB, and attaches it to req.session.

// Routes
app.use("/api/v1/auth", require("./routes/authRoutes.js"));
app.use("/api/v1/jobs", require("./routes/jobRoutes.js"));
app.use("/api/v1/application", require("./routes/applicationRoutes.js"));
app.use("/api/v1/donations", require("./routes/donationRoutes.js"));
app.use("/api/v1/notification", require("./routes/notificationRoutes.js"));
app.use("/api/v1/blogs", require("./routes/blogRoutes.js"));
app.use("/api/v1/messages", require("./routes/messageRoutes.js"));

// Ensure admin exists using IIFE (imeediately invoked) function
(async () => {
  try {
    await User.ensureAdminExists();
    console.log("Admin account verified/created.");
  } catch (err) {
    console.error("Error ensuring admin account:", err);
  }
})();

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Node Server Running On Port ${PORT}`);
});
