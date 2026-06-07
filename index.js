import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", process.env.CLIENT_URL],
    methods: ["GET", "POST"],
    credentials: true,
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
  return users.find((user) => user.sub === userId);
};

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("addUsers", (userData) => {
    addUser(userData, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", (data) => {
    const user = getUser(data.receiverId);

    if (user) {
      io.to(user.socketId).emit("getMessage", data);
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getUsers", users);
    console.log("Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3002;

httpServer.listen(PORT, () => {
  console.log(`Socket Server Running on ${PORT}`);
});
