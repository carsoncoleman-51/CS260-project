import React from 'react';
import './play.css';

export function Play() {
  return (
    <main className="play-view container-fluid text-center">
      <div className="player-meta">
        <div>
          Player: <span className="player-name">*players name*</span>
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
        <span className="red-button-top"></span>
      </div>
    </main>
  );
}
