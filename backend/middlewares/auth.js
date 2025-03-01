const jwt = require("jsonwebtoken");
const User = require("../models/User");

const Auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access denied, no token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password"); // Get user without password

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; // Attach user info to req
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
module.exports = {
    Auth
}