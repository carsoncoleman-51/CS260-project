import React from 'react';
import './play.css';

async function readJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return {};
  }
}

export function Play() {
  const [currentUser, setCurrentUser] = React.useState('');
  const isLoggedIn = Boolean(currentUser);

  const [score, setScore] = React.useState(0);
  const [authMessage, setAuthMessage] = React.useState('');
  const [personalBest, setPersonalBest] = React.useState(0);
  const [events, setEvents] = React.useState([]);

  const loadCurrentUser = React.useCallback(async () => {
    try {
      const response = await fetch('/api/user/me');
      const data = await readJson(response);
      if (!response.ok) {
        setCurrentUser('');
        setPersonalBest(0);
        return;
      }

      setAuthMessage('');
      setCurrentUser(data.username ?? '');
    } catch (error) {
      setCurrentUser('');
      setPersonalBest(0);
      setAuthMessage('Could not reach server.');
    }
  }, []);

  const loadLeaderboard = React.useCallback(async () => {
    try {
      const response = await fetch('/api/scores');
      const data = await readJson(response);
      if (!response.ok) {
        setEvents([]);
        return;
      }

      const leaderboard = Array.isArray(data.scores) ? data.scores : [];
      setEvents(leaderboard.slice(0, 2));

      if (!currentUser) {
        setPersonalBest(0);
        return;
      }

      const currentUserEntry = leaderboard.find((entry) => entry.username === currentUser);
      setPersonalBest(currentUserEntry?.score ?? 0);
    } catch (error) {
      setEvents([]);
    }
  }, [currentUser]);

  React.useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  React.useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  React.useEffect(() => {
    const id = setInterval(() => {
      loadLeaderboard();
    }, 5000);

    return () => clearInterval(id);
  }, [loadLeaderboard]);

  const checkForPersonalHighScore = async (currentScore) => {
    if (!isLoggedIn) {
      setAuthMessage('Login to save high scores.');
      return;
    }

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: currentScore }),
      });
      const data = await readJson(response);

      if (response.status === 401) {
        setCurrentUser('');
        setPersonalBest(0);
        setAuthMessage('Session expired. Please log in again.');
        return;
      }

      if (!response.ok) {
        setAuthMessage(data.msg || 'Could not save score.');
        return;
      }

      setPersonalBest((prevBest) => data.personalBest ?? prevBest);
      if (data.isNewPersonalBest) {
        setAuthMessage(`New personal high score: ${data.personalBest}!`);
      } else {
        setAuthMessage('No new personal high score.');
      }

      loadLeaderboard();
    } catch (error) {
      setAuthMessage('Could not reach server to save score.');
    }
  };

  const buttonPush = async () => {
    if (Math.random() < 0.5) {
      setScore((prevScore) => prevScore + 1);
    } else {
      await checkForPersonalHighScore(score);
      setScore(0);
    }
  };

  return (
    <main className="play-view container-fluid text-center">
      <PlayerPanel
        currentUser={currentUser}
        isLoggedIn={isLoggedIn}
        score={score}
        personalBest={personalBest}
        authMessage={authMessage}
        onButtonPush={buttonPush}
      />
      <HighScoreNotifications events={events} />
    </main>
  );
}

function PlayerPanel({ currentUser, isLoggedIn, score, personalBest, authMessage, onButtonPush }) {
  return (
    <>
      <div className="player-meta">
        <div>
          Player: <span className="player-name">{isLoggedIn ? currentUser : 'Guest'}</span>
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

function HighScoreNotifications({ events }) {
  return (
    <div className="notifications">
      {events.length ? (
        events.map((event, index) => (
          <div key={`${event.username}-${event.date}-${index}`}>
            {event.username} high score: {event.score}
          </div>
        ))
      ) : (
        <div>No recent high scores.</div>
      )}
    </div>
  );
}
