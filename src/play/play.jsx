import React from 'react';
import './play.css';

export function Play() {
  const userName = localStorage.getItem('userName') ?? '';
  const isLoggedIn = Boolean(userName);

  const [score, setScore] = React.useState(0);
  const [authMessage, setAuthMessage] = React.useState('');
  const [personalBest, setPersonalBest] = React.useState(0);

  const loadUsers = () => {
    const usersText = localStorage.getItem('users');
    if (!usersText) return [];
    try {
      const parsed = JSON.parse(usersText);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      if (parsed && typeof parsed === 'object') {
        return Object.entries(parsed).map(([name, password]) => ({
          name,
          password: password ?? '',
          score: 0,
          date: '',
        }));
      }
      return [];
    } catch (error) {
      return [];
    }
  };

  const saveUsers = (users) => {
    localStorage.setItem('users', JSON.stringify(users));
  };

  React.useEffect(() => {
    if (!isLoggedIn) {
      setPersonalBest(0);
      return;
    }
    const users = loadUsers();
    const entry = users.find((user) => user.name === userName);
    setPersonalBest(entry ? entry.score : 0);
  }, [isLoggedIn, userName]);

  const checkForPersonalHighScore = (currentScore) => {
    if (!isLoggedIn) {
      setAuthMessage('Login to save high scores.');
      return;
    }

    const users = loadUsers();
    const entryIndex = users.findIndex((entry) => entry.name === userName);
    const today = new Date().toLocaleDateString();

    if (entryIndex === -1) {
      users.unshift({ name: userName, password: '', score: currentScore, date: today });
      saveUsers(users);
      setPersonalBest(currentScore);
      setAuthMessage(`New personal high score: ${currentScore}!`);
      return;
    }

    const entry = users[entryIndex];
    if (currentScore > entry.score) {
      users[entryIndex] = { ...entry, score: currentScore, date: today };
      saveUsers(users);
      setPersonalBest(currentScore);
      setAuthMessage(`New personal high score: ${currentScore}!`);
    } else {
      setAuthMessage('No new personal high score.');
    }
  };

  const buttonPush = () => {
    if (Math.random() < 0.5) {
      setScore((prevScore) => prevScore + 1);
    } else {
      checkForPersonalHighScore(score);
      setScore(0);
    }
  };

  return (
    <main className="play-view container-fluid text-center">
      <PlayerPanel
        userName={userName}
        isLoggedIn={isLoggedIn}
        score={score}
        personalBest={personalBest}
        authMessage={authMessage}
        onButtonPush={buttonPush}
      />
      <HighScoreNotifications />
    </main>
  );
}

function PlayerPanel({ userName, isLoggedIn, score, personalBest, authMessage, onButtonPush }) {
  return (
    <>
      <div className="player-meta">
        <div>
          Player: <span className="player-name">{isLoggedIn ? userName : 'Guest'}</span>
        </div>
        <div className="personal-high-score">
          Personal High Score: <span className="score-value">{personalBest}</span>
        </div>
      </div>

      <div className="scores-display">
        Current Win Streak: <span className="win-streak">{score}</span>
      </div>

      <div className="red-button" aria-label="Red button">
        <span className="red-button-top" onClick={onButtonPush}></span>
      </div>

      {authMessage ? <div className="login-message">{authMessage}</div> : null}
    </>
  );
}

function HighScoreNotifications() {
  return (
    <div className="notifications">
      <div>*player1* got a new high score!</div>
      <div>*player2* got a new high score!</div>
    </div>
  );
}
