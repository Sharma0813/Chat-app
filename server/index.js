
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Load config from .env
const PORT = process.env.PORT || 5000;
const ORIGIN = process.env.ORIGIN;

// Parse ORIGIN into array
const allowedOrigins = ORIGIN
  ? ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Chat server running' });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// In-memory store
const users = new Map();
const messages = [];

io.on('connection', (socket) => {
  socket.join('general');

  socket.on('join', ({ username }) => {
    users.set(socket.id, { username });
    io.to('general').emit('users', Array.from(users.values()).map(u => u.username));
    socket.emit('history', messages.slice(-50));
  });

  socket.on('typing', (isTyping) => {
    const user = users.get(socket.id);
    if (!user) return;
    socket.to('general').emit('typing', { username: user.username, isTyping });
  });

  socket.on('message', (text) => {
    const user = users.get(socket.id);
    if (!user || typeof text !== 'string') return;
    const trimmed = text.trim();
    if (!trimmed) return;
    const msg = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      username: user.username,
      text: trimmed,
      ts: Date.now()
    };
    messages.push(msg);
    io.to('general').emit('message', msg);
  });

  socket.on('disconnect', () => {
    const hadUser = users.delete(socket.id);
    if (hadUser) {
      io.to('general').emit('users', Array.from(users.values()).map(u => u.username));
    }
  });
});

server.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
  console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}`);
});
