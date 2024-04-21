import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 4000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

const emailToSocketMp = new Map();
const socketToEmailMp = new Map();

io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    const { email, roomId } = data;
    emailToSocketMp.set(email, socket.id);
    socketToEmailMp.set(socket.id, email);
    console.log(`User ${email} joined room: "${roomId}"`);

    socket.join(roomId);
    socket.emit("joined-room", { roomId });
    socket.broadcast.to(roomId).emit("user-joined", { email, id: socket.id });
  });

  socket.on("call-user", (data) => {
    const { to, offer } = data;
    io.to(to).emit("incoming-call", { from: socket.id, offer });
  });

  socket.on("call-accepted", (data) => {
    const { to, answer } = data;
    io.to(to).emit("call-accepted", { from: socket.id, answer });
  });

  socket.on("negotiation-needed", (data) => {
    const { to, offer } = data;
    io.to(to).emit("negotiation-needed", { from: socket.id, offer });
  });

  socket.on("negotiation-done", (data) => {
    const { to, answer } = data;
    io.to(to).emit("negotiation-done", { from: socket.id, answer });
  });
});

server.listen(PORT, () => {
  console.log("server is listening at http://localhost:%d/", PORT);
});
