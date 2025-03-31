const mongoose = require("mongoose");
const blogSchema = new mongoose.Schema({
    title: String,
    subtitle: String,
    coverPhoto: String,
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, comment: String, date: { type: Date, default: Date.now } }],
    createdAt: { type: Date, default: Date.now },
  });
  module.exports = mongoose.model("Blog",blogSchema);
  