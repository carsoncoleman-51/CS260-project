import React from 'react';
import './play.css';

export function Play() {
  const userName = localStorage.getItem('userName') ?? '';
  const isLoggedIn = Boolean(userName);

  const [score, setScore] = React.useState(0);
  const [authMessage, setAuthMessage] = React.useState('');

  const checkForPersonalHighScore = (currentScore) => {
    const personalBest = JSON.parse(localStorage.getItem('score') || '0');
    if (currentScore > personalBest) {
      localStorage.setItem('score', currentScore);
      setAuthMessage(`New personal high score: ${currentScore}!`);
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
        authMessage={authMessage}
        onButtonPush={buttonPush}
      />
      <HighScoreNotifications />
    </main>
  );
}

function PlayerPanel({ userName, isLoggedIn, score, authMessage, onButtonPush }) {
  return (
    <>
      <div className="player-meta">
        <div>
          Player: <span className="player-name">{isLoggedIn ? userName : 'Guest'}</span>
        </div>
        <div className="personal-high-score">
          Personal High Score: <span className="score-value">0</span>
        </div>
      </div>

      <div className="scores-display">
        Current Win Streak: <span className="win-streak">{score}</span>
      </div>

      <div className="red-button" aria-label="Red button">
        <span className="red-button-top" onClick={onButtonPush}></span>
      </div>

      {authMessage ? <div className="login-message">{authMessage}</div> : null}
      {!isLoggedIn ? (
        <div className="login-message">Login to save high scores.</div>
      ) : null}

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
