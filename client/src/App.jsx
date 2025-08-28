import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:5000';

export default function App() {
  const [username, setUsername] = useState(localStorage.getItem('chat:username') || '');
  const [pendingName, setPendingName] = useState('');
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [text, setText] = useState('');
  const [joined, setJoined] = useState(!!username);

  const socket = useMemo(() => io(SERVER_URL, { autoConnect: false }), [SERVER_URL]);
  const messagesRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    if (!joined) return;

    socket.connect();
    socket.emit('join', { username });

    socket.on('history', (history) => setMessages(history));
    socket.on('users', (users) => setConnectedUsers(users));
    socket.on('message', (msg) => setMessages((prev) => [...prev, msg]));
    socket.on('typing', ({ username, isTyping }) => {
      setTypingUser(isTyping ? username : null);
    });

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [joined, socket, username]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, typingUser]);

  const handleSend = () => {
    const val = text.trim();
    if (!val) return;
    socket.emit('message', val);
    setText('');
    socket.emit('typing', false);
  };

  const startTyping = (val) => {
    setText(val);
    if (!typingTimer.current) {
      socket.emit('typing', true);
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('typing', false);
      typingTimer.current = null;
    }, 900);
  };

  const login = (e) => {
    e.preventDefault();
    const name = pendingName.trim() || `User${Math.floor(Math.random() * 1000)}`;
    setUsername(name);
    localStorage.setItem('chat:username', name);
    setJoined(true);
  };

  if (!joined) {
    return (
      <div className="container">
        <div className="card login">
          <h1 className="brand">React Chat</h1>
          <p className="helper">Pick a display name to join the chat</p>
          <form onSubmit={login}>
            <input
              placeholder="Your name"
              value={pendingName}
              onChange={(e) => setPendingName(e.target.value)}
            />
            <button type="submit">Join</button>
          </form>
          <p className="helper">Tip: your name is saved locally so you stay logged in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div className="brand">Ping Me</div>
          <div className="helper">{connectedUsers.length} online</div>
        </div>
        <div className="content">
          <aside className="sidebar">
            <h3>Online</h3>
            <ul className="user-list">
              {connectedUsers.map((u, i) => (
                <li key={i}>{u}{u === username ? ' (you)' : ''}</li>
              ))}
            </ul>
          </aside>
          <section className="chat">
            <div className="messages" ref={messagesRef}>
              {messages.map((m) => (
                <Message key={m.id || m.ts} me={m.username === username} msg={m} />
              ))}
            </div>
            {typingUser && <div className="typing">{typingUser} is typing…</div>}
            <div className="input">
              <input
                placeholder="Type a message…"
                value={text}
                onChange={(e) => startTyping(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              />
              <button onClick={handleSend}>Send</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Message({ me, msg }) {
  const time = new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div className={`msg ${me ? 'me' : ''}`}>
      <div className="meta">{msg.username} • {time}</div>
      <div className="text">{msg.text}</div>
    </div>
  );
}
