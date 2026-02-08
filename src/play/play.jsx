import React from 'react';
import './play.css';

export function Play() {
  return (
    <main className="play-view container-fluid bg-secondary text-center">
    <div className="Players">
            Player:
            <span className="player-name">*players name*</span>
        </div>
        <div className="personal-high-score">
            Personal High Score:
            <span className="personal-high-score">0</span>
        </div>
        <ul className="notification">
            <li className="player-name"> *player1* got a new High Score! </li>
            <li className="player-name"> *player2* got a new High Score! </li>
        </ul>
    
    <div className="scores-display">
        Current Win Streak: <span className="win-streak">0</span>
    </div>

    <div className="red-button" aria-label="Red button">
      <span className="red-button-top"></span>
    </div>
    
    </main>
  );
}
