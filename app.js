const socket = io();
let currentUser = {};

// LOGIN
function login() {
  fetch("/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      username: user.value,
      password: pass.value
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      currentUser = data;

      document.getElementById("login").style.display = "none";
      document.getElementById("dashboard").style.display = "block";

      loadMessages();
    }
  });
}

// TABS
function show(tab) {
  document.getElementById("home").style.display = "none";
  document.getElementById("chat").style.display = "none";
  document.getElementById(tab).style.display = "block";
}

// SEND MESSAGE
function send() {
  socket.emit("sendMessage", {
    username: currentUser.username,
    profilePic: currentUser.profilePic,
    message: msg.value
  });
  msg.value = "";
}

// RECEIVE MESSAGE
socket.on("receiveMessage", data => {
  let li = document.createElement("li");

  li.innerHTML = `
    <img src="${data.profilePic}" width="30" style="border-radius:50%">
    <b>${data.username}:</b> ${data.message}
  `;

  document.getElementById("messages").appendChild(li);
});

// LOAD OLD MESSAGES
function loadMessages() {
  fetch("/messages")
  .then(res => res.json())
  .then(data => {
    let box = document.getElementById("messages");
    box.innerHTML = "";

    data.forEach(m => {
      let li = document.createElement("li");
      li.textContent = m.username + ": " + m.message;
      box.appendChild(li);
    });
  });
}

// ADMIN
function openAdmin() {
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("adminLogin").style.display = "block";
}

function adminLogin() {
  fetch("/admin-login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ password: adminPass.value })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      document.getElementById("adminLogin").style.display = "none";
      document.getElementById("adminPanel").style.display = "block";

      loadUsers();
      loadAdminMessages();
    }
  });
}

function loadUsers() {
  fetch("/users")
  .then(res => res.json())
  .then(users => {
    userList.innerHTML = "";

    users.forEach(u => {
      let li = document.createElement("li");
      li.innerHTML = `${u.username} <button onclick="deleteUser('${u._id}')">X</button>`;
      userList.appendChild(li);
    });
  });
}

function deleteUser(id) {
  fetch("/delete-user/" + id, { method: "DELETE" })
    .then(() => loadUsers());
}

function loadAdminMessages() {
  fetch("/messages")
  .then(res => res.json())
  .then(msgs => {
    adminMessages.innerHTML = "";

    msgs.forEach(m => {
      let li = document.createElement("li");
      li.textContent = m.username + ": " + m.message;
      adminMessages.appendChild(li);
    });
  });
}

function back() {
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
}