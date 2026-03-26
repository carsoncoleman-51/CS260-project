import React from 'react';
import './play.css';
import { fireHighScoreConfetti } from './confetti';

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
  const [isCelebrating, setIsCelebrating] = React.useState(false);
  const [events, setEvents] = React.useState([]);
  const socketRef = React.useRef(null); //so this is more beneficial cuz provides a way to store mutable values that persist across component re-renders without triggering a re-render when the value changes
  const celebrationTimerRef = React.useRef(null);

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
        return;
      }

      const leaderboard = Array.isArray(data.scores) ? data.scores : [];
      if (!currentUser) {
        setPersonalBest(0);
        return;
      }

      const currentUserEntry = leaderboard.find((entry) => entry.username === currentUser);
      setPersonalBest(currentUserEntry?.score ?? 0);
    } catch (error) {
      // Keep the last known value if leaderboard fetch fails.
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

  React.useEffect(() => {
    return () => {
      if (celebrationTimerRef.current) {
        clearTimeout(celebrationTimerRef.current);
      }
    };
  }, []);

  const triggerHighScoreCelebration = React.useCallback(() => {
    fireHighScoreConfetti();
    setIsCelebrating(true);

    if (celebrationTimerRef.current) {
      clearTimeout(celebrationTimerRef.current);
    }

    celebrationTimerRef.current = setTimeout(() => {
      setIsCelebrating(false);
      celebrationTimerRef.current = null;
    }, 2200);
  }, []);

  //starts up when componet first loads
  React.useEffect(() => {
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss'; //taken from class code, decides which type of connection
    const socketHost =
      ['localhost', '127.0.0.1'].includes(window.location.hostname) ? 'localhost:4000' : window.location.host;
    // Keep websocket traffic on backend port during local development.
    const socket = new WebSocket(`${protocol}://${socketHost}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(typeof event.data === 'string' ? event.data : '{}');
        if (message?.type !== 'playerLost') { //only does for playerlost events
          return;
        }

        const eventScore = Number(message.score);
        setEvents((prevEvents) => [
          {
            username: typeof message.username === 'string' && message.username.trim() ? message.username.trim() : 'Guest',
            score: Number.isFinite(eventScore) ? Math.floor(eventScore) : 0,
            isHighScore: Boolean(message.isHighScore),
            date: message.date || '',
          },
          ...prevEvents,
        ].slice(0, 8));
      } catch (_error) {
        // Ignore invalid websocket payloads.
      }
    };
//close socket
    return () => {
      socketRef.current = null;
      socket.close();
    };
  }, []);

  const sendLossEvent = React.useCallback((eventData) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return; //stops if cant send
    }
//sends out ws to server with player lost event, includes username, score, and if its a high score or not
    socket.send(
      JSON.stringify({
        type: 'playerLost',
        username: typeof eventData.username === 'string' && eventData.username.trim() ? eventData.username.trim() : 'Guest',
        score: Number.isFinite(Number(eventData.score)) ? Math.max(0, Math.floor(Number(eventData.score))) : 0,
        isHighScore: Boolean(eventData.isHighScore),
      }),
    );
  }, []);

  const checkForPersonalHighScore = async (currentScore) => {
    if (!isLoggedIn) {
      setAuthMessage('Login to save high scores.');
      sendLossEvent({ username: 'Guest', score: currentScore, isHighScore: false });
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
        sendLossEvent({ username: currentUser, score: currentScore, isHighScore: false });
        return;
      }

      if (!response.ok) {
        setAuthMessage(data.msg || 'Could not save score.');
        sendLossEvent({ username: currentUser, score: currentScore, isHighScore: false });
        return;
      }

      const isNewPersonalBest = Boolean(data.isNewPersonalBest);
      setPersonalBest((prevBest) => data.personalBest ?? prevBest);
      if (isNewPersonalBest) {
        setAuthMessage(`New personal high score: ${data.personalBest}!`);
        triggerHighScoreCelebration();
      } else {
        setAuthMessage('No new personal high score.');
        setIsCelebrating(false);
      } //send ws event about player losing, includes if they got a new personal best or not
      sendLossEvent({
        username: currentUser,
        score: currentScore,
        isHighScore: isNewPersonalBest,
      });

      loadLeaderboard();
    } catch (error) {
      setAuthMessage('Could not reach server to save score.');
      sendLossEvent({ username: currentUser, score: currentScore, isHighScore: false });
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
        isCelebrating={isCelebrating}
        onButtonPush={buttonPush}
      />
      <HighScoreNotifications events={events} />
    </main>
  );
}

function PlayerPanel({ currentUser, isLoggedIn, score, personalBest, authMessage, isCelebrating, onButtonPush }) {
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

      {authMessage ? <div className={`login-message${isCelebrating ? ' login-message-celebrate' : ''}`}>{authMessage}</div> : null}
    </>
  );
}

//displays recent high score notifications, shows username, score, and if its a new personal best or not
function HighScoreNotifications({ events }) {
  return (
    <div className="notifications">
      {events.length ? (
        events.map((event, index) => (
          <div key={`${event.username}-${event.date}-${index}`}>
            {event.username} lost at {event.score} 
            {event.isHighScore ? ' (new personal high score)' : ''}
          </div>
        ))
      ) : (
        <div>No recent losses.</div>
      )}
    </div>
  );
}
