import React from 'react';
import './scores.css';

export function Scores() {
  return (
    <main className="scores-view">
      <table className="scores-display-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player Name</th>
            <th>High Score</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Player1</td>
            <td>15</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Player2</td>
            <td>7</td>
          </tr>
          <tr>
            <td>3</td>
            <td>Player3</td>
            <td>6</td>
          </tr>
          <tr>
            <td>4</td>
            <td>Player4</td>
            <td>5</td>
          </tr>
          <tr>
            <td>5</td>
            <td>Player5</td>
            <td>4</td>
          </tr>
          <tr>
            <td>6</td>
            <td>Player6</td>
            <td>3</td>
          </tr>
          <tr>
            <td>7</td>
            <td>Player7</td>
            <td>2</td>
          </tr>
          <tr>
            <td>8</td>
            <td>Player8</td>
            <td>2</td>
          </tr>
          <tr>
            <td>9</td>
            <td>Player9</td>
            <td>2</td>
          </tr>
          <tr>
            <td>10</td>
            <td>Player10</td>
            <td>1</td>
          </tr>
        </tbody>
      </table>

      <div className="scores-fun-fact">*Fun Fact From 3rd Party*</div>
    </main>
  );
}
