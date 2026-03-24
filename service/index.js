const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const fs = require('fs');
const path = require('path');
const DB = require('./database');

const app = express();
const port = process.argv.length > 2 ? Number(process.argv[2]) : 4000;
const server = http.createServer(app); //used for both HTTP and WebSocket
const sockets = new Set(); 

app.use(express.json());
app.use(cookieParser());
const frontendPath = resolveFrontendPath();
if (frontendPath) {
  app.use(express.static(frontendPath));
}

const wsServer = new WebSocketServer({ server }); // Attach WebSocket server to the same HTTP server
wsServer.on('connection', (socket) => { //Used for new connection
  sockets.add(socket); //add teh socket
  //this part uses try catch block for incoming websocket messages from server
  socket.on('message', (rawMessage) => {
    let message;
    try {
      message = JSON.parse(rawMessage.toString());
    } catch (_error) {
      return;
    }
    //only takes message with type playerlost, helps organzie
    if (message?.type !== 'playerLost') {
      return;
    }

    const score = Number(message.score);
    if (!Number.isFinite(score) || score < 0) {
      return;
    }

    broadcast({
      // the event name that clients listen for
      type: 'playerLost',
      username:
        typeof message.username === 'string' && message.username.trim()
          ? message.username.trim()
          : 'Guest',
          //make score into int
      score: Math.floor(score),
      // Normalize truthy/falsy values to a boolean.
      isHighScore: Boolean(message.isHighScore),
      // Attach today's date so clients can display when it happened cuz why not.
      date: todayDate(),
    });
  });
  //close the socket 
  socket.on('close', () => {
    sockets.delete(socket);
  });

  socket.on('error', () => {
    sockets.delete(socket);
  });
});

app.post('/api/auth', async (req, res) => {
  const { username, password, error } = normalizeAuthRequest(req.body);
  if (error) {
    res.status(400).send({ msg: error });
    return;
  }

  if (await DB.getUser(username)) {
    res.status(409).send({ msg: 'Existing user' });
    return;
  }

  const user = await createUser(username, password);
  setAuthCookie(res, user.token);
  res.send({ username: user.username });
});

app.put('/api/auth', async (req, res) => {
  const { username, password, error } = normalizeAuthRequest(req.body);
  if (error) {
    res.status(400).send({ msg: error });
    return;
  }

  const user = await DB.getUser(username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).send({ msg: 'Unauthorized' });
    return;
  }

  user.token = uuidv4();
  await DB.updateUser(user);
  setAuthCookie(res, user.token);
  res.send({ username: user.username });
});

app.delete('/api/auth', async (req, res) => {
  const token = req.cookies.token;
  const user = await DB.getUserByToken(token);
  if (user) {
    user.token = '';
    await DB.updateUser(user);
  }

  res.clearCookie('token', cookieOptions());
  res.send({});
});

app.get('/api/user/me', requireAuth, (req, res) => {
  res.send({ username: req.user.username });
});

app.get('/api/scores', async (_req, res) => {
  const scores = await DB.getLeaderboard(10);
  res.send({ scores });
});

app.post('/api/scores', requireAuth, async (req, res) => {
  const rawScore = req.body?.score;
  if (typeof rawScore !== 'number' || !Number.isFinite(rawScore) || rawScore < 0) {
    res.status(400).send({ msg: 'Invalid score' });
    return;
  }

  const submittedScore = Math.floor(rawScore);
  let isNewPersonalBest = false;

  if (submittedScore > (req.user.score ?? 0)) {
    req.user.score = submittedScore;
    req.user.date = todayDate();
    await DB.updateUser(req.user);
    isNewPersonalBest = true;
  }

  res.send({
    personalBest: req.user.score ?? 0,
    isNewPersonalBest,
    date: req.user.date || '',
  });
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    next();
    return;
  }

  if (!frontendPath) {
    res.status(404).send({ msg: 'Frontend build not found' });
    return;
  }

  res.sendFile(path.resolve(frontendPath, 'index.html'));
});

app.use((err, _req, res, _next) => {
  res.status(500).send({ type: err.name, message: err.message });
});

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token;
    const user = await DB.getUserByToken(token);
    if (!user) {
      res.status(401).send({ msg: 'Unauthorized' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

function normalizeAuthRequest(body) {
  const username = typeof body?.username === 'string' ? body.username.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!username || !password) {
    return { username: '', password: '', error: 'Username and password are required' };
  }

  return { username, password, error: '' };
}

function resolveFrontendPath() {
  const candidatePaths = [
    path.resolve(__dirname, 'public'),
    path.resolve(__dirname, '..', 'dist'),
    path.resolve(__dirname, '..', 'public'),
  ];

  for (const candidatePath of candidatePaths) {
    if (fs.existsSync(path.resolve(candidatePath, 'index.html'))) {
      return candidatePath;
    }
  }

  return '';
}

async function createUser(username, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    username,
    password: passwordHash,
    token: uuidv4(),
    score: 0,
    date: '',
  };

  await DB.addUser(user);
  return user;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function setAuthCookie(res, token) {
  res.cookie('token', token, cookieOptions());
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  };
}

function broadcast(event) {
  const payload = JSON.stringify(event);
  for (const socket of sockets) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(payload);
    }
  }
}

server.listen(port, () => {
  console.log(`Backend service listening on port ${port}`);
});
