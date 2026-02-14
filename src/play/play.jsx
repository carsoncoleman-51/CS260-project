import React from 'react';
import './play.css';

export function Play() {
  const userName = localStorage.getItem('userName') ?? '';
  const isLoggedIn = Boolean(userName);
  const [saveStatus, setSaveStatus] = React.useState('');

  const handleSaveScore = () => {
    if (!isLoggedIn) {
      setSaveStatus('Log in to save your score.');
      return;
    }

    const scoresText = localStorage.getItem('score');
    const scores = scoresText ? JSON.parse(scoresText) : [];
    const newScore = {
      name: userName,
      score: 0,
      date: new Date().toLocaleDateString(),
    };

    scores.unshift(newScore);
    localStorage.setItem('score', JSON.stringify(scores));
    setSaveStatus('Saved to leaderboard.');
  };

  return (
    <main className="play-view container-fluid text-center">
      <div className="player-meta">
        <div>
          Player: <span className="player-name">{isLoggedIn ? userName : 'Guest'}</span>
        </div>
        <div className="personal-high-score">
          Personal High Score: <span className="score-value">0</span>
        </div>
      </div>

      <div className="notifications">
        <div>*player1* got a new high score!</div>
        <div>*player2* got a new high score!</div>
      </div>

      <div className="scores-display">
        Current Win Streak: <span className="win-streak">0</span>
      </div>

      <div className="red-button" aria-label="Red button">
        <span className="red-button-top" onClick={handleSaveScore}></span>
      </div>

      {saveStatus ? <div className="save-status">{saveStatus}</div> : null}
    </main>
  );
}
