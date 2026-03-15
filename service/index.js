const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.argv.length > 2 ? Number(process.argv[2]) : 4000;

app.use(express.json());
app.use(cookieParser());
const frontendPath = resolveFrontendPath();
if (frontendPath) {
  app.use(express.static(frontendPath));
}

const users = [];

app.post('/api/auth', async (req, res) => {
  const { username, password, error } = normalizeAuthRequest(req.body);
  if (error) {
    res.status(400).send({ msg: error });
    return;
  }

  if (getUserByUsername(username)) {
    res.status(409).send({ msg: 'Existing user' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    username,
    password: passwordHash,
    token: '',
    score: 0,
    date: '',
  };
  users.push(user);
  setAuthCookie(res, user);
  res.send({ username: user.username });
});

app.put('/api/auth', async (req, res) => {
  const { username, password, error } = normalizeAuthRequest(req.body);
  if (error) {
    res.status(400).send({ msg: error });
    return;
  }

  const user = getUserByUsername(username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).send({ msg: 'Unauthorized' });
    return;
  }

  setAuthCookie(res, user);
  res.send({ username: user.username });
});

app.delete('/api/auth', (req, res) => {
  const token = req.cookies.token;
  const user = getUserByToken(token);
  if (user) {
    clearAuthCookie(res, user);
  } else {
    res.clearCookie('token', cookieOptions());
  }
  res.send({});
});

app.get('/api/user/me', requireAuth, (req, res) => {
  res.send({ username: req.user.username });
});

app.get('/api/scores', (_req, res) => {
  res.send({ scores: getLeaderboard() });
});

app.post('/api/scores', requireAuth, (req, res) => {
  const rawScore = req.body?.score;
  if (typeof rawScore !== 'number' || !Number.isFinite(rawScore) || rawScore < 0) {
    res.status(400).send({ msg: 'Invalid score' });
    return;
  }

  const submittedScore = Math.floor(rawScore);
  let isNewPersonalBest = false;

  if (submittedScore > req.user.score) {
    req.user.score = submittedScore;
    req.user.date = todayDate();
    isNewPersonalBest = true;
  }

  res.send({
    personalBest: req.user.score,
    isNewPersonalBest,
    date: req.user.date,
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

function requireAuth(req, res, next) {
  const token = req.cookies.token;
  const user = getUserByToken(token);
  if (!user) {
    res.status(401).send({ msg: 'Unauthorized' });
    return;
  }
  req.user = user;
  next();
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

function getUserByUsername(username) {
  return users.find((user) => user.username === username);
}

function getUserByToken(token) {
  if (!token) {
    return undefined;
  }
  return users.find((user) => user.token === token);
}

function getLeaderboard() {
  return [...users]
    .sort((a, b) => {
      const scoreDiff = (b.score ?? 0) - (a.score ?? 0);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
      return (b.date || '').localeCompare(a.date || '');
    })
    .map((user) => ({
      username: user.username,
      score: user.score ?? 0,
      date: user.date || '',
    }));
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function setAuthCookie(res, user) {
  user.token = uuidv4();
  res.cookie('token', user.token, cookieOptions());
}

function clearAuthCookie(res, user) {
  user.token = '';
  res.clearCookie('token', cookieOptions());
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  };
}

app.listen(port, () => {
  console.log(`Backend service listening on port ${port}`);
});
