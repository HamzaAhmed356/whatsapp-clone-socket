import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const PORT = parseInt(process.env.PORT, 10) || 3002;

const io = new Server(PORT, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"]
  },
});

let users = [];

const addUser = (userData, socketId) => {
  const exists = users.find((user) => user.sub === userData.sub);

  if (!exists) {
    users.push({ ...userData, socketId });
  }
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};
const getUser = (userId) => {
  return users.find((user) => user.sub == userId);
};

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("addUsers", (userData) => {
    addUser(userData, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getUsers", users);
    console.log("User Disconnected:", socket.id);
  });
  socket.on("sendMessage", (data) => {
    const user = getUser(data.receiverId);
    io.to(user.socketId).emit("getMessage", data);
  });
});
