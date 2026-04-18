const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

// DATABASE
mongoose.connect("mongodb://127.0.0.1:27017/codehive");

// ADMIN PASSWORD
const ADMIN_PASSWORD = "supercodehive";

// USER MODEL
const User = mongoose.model("User", {
  username: String,
  password: String,
  profilePic: String
});

// MESSAGE MODEL
const Message = mongoose.model("Message", {
  username: String,
  profilePic: String,
  message: String,
  time: { type: Date, default: Date.now }
});

// REGISTER
app.post("/register", async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);

  const user = new User({
    username: req.body.username,
    password: hashed,
    profilePic: "https://via.placeholder.com/30" // default pic
  });

  await user.save();
  res.send("User created");
});

// LOGIN
app.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });

  if (user && await bcrypt.compare(req.body.password, user.password)) {
    res.send({
      success: true,
      username: user.username,
      profilePic: user.profilePic
    });
  } else {
    res.send({ success: false });
  }
});

// ADMIN LOGIN
app.post("/admin-login", (req, res) => {
  res.send({ success: req.body.password === ADMIN_PASSWORD });
});

// GET USERS
app.get("/users", async (req, res) => {
  res.send(await User.find());
});

// DELETE USER
app.delete("/delete-user/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.send("Deleted");
});

// GET MESSAGES
app.get("/messages", async (req, res) => {
  const msgs = await Message.find().sort({ time: 1 });
  res.send(msgs);
});

// SOCKET CHAT
io.on("connection", socket => {
  socket.on("sendMessage", async (data) => {

    const msg = new Message(data);
    await msg.save();

    io.emit("receiveMessage", msg);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running"));