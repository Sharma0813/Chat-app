# Full Stack Chat App (React + Node.js + Socket.IO)

A minimal, production-ready starter for a realtime chat using:
- **Client:** React + Vite + socket.io-client
- **Server:** Express + Socket.IO (in-memory storage)

## Features
- Join with a display name (saved locally)
- Online users list
- Realtime messages
- Typing indicator
- Message timestamps
- Sends last 50 messages to newly joined users

---

## Quick Start

### 1) Start the server
```bash
cd server
npm install
npm run start
```
The server listens on `http://localhost:5000` (change with `PORT` env).

### 2) Start the client
Open a new terminal:
```bash
cd client
npm install
npm run dev
```
Open the printed URL (usually `http://localhost:5173`).

> If the client and server run on different hosts/ports, set these:
- In **server**: `ORIGIN` env (defaults to `http://localhost:5173`)
- In **client**: `VITE_SERVER_URL` env (defaults to `http://localhost:5000`)

---

## Project Structure
```
react-socketio-chat/
  server/           # Express + Socket.IO backend
    index.js
    package.json
    .env.example
  client/           # React + Vite frontend
    src/
      App.jsx
      main.jsx
      styles.css
    index.html
    package.json
    vite.config.js
    .env.example
  README.md
```

## Notes
- Data is stored in-memory on the server. For persistence, plug in a database and replace the `messages` array.
- This is a clean foundation you can extend with rooms, message receipts, auth, etc.
