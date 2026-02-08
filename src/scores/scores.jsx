import React from 'react';
import './scores.css';

export function Scores() {
  return (
    <main>
       <table className="scores-display-table">
    <thead>
        <tr>
            <th>Rank</th>
            <th>Player Name</th>
            <th>High Score</th>
        </tr>
        <tbody>
            <tr>
                <td>1</td>
                <td>player1</td>
                <td>15</td>
            </tr>
            <tr>
                <td>2</td>
                <td>player2</td>
                <td>7</td>
            </tr>
            <tr>
                <td>3</td>
                <td>player3</td>
                <td>6</td>    
            </tr>
            <tr>
              <td>4</td>
              <td>player4</td>
              <td>5</td>
          </tr>
          <tr>
              <td>5</td>
              <td>player5</td>
              <td>4</td>
          </tr>
          <tr>
              <td>6</td>
              <td>player6</td>
              <td>3</td>    
          </tr>
          <tr>
            <td>7</td>
            <td>player7</td>
            <td>2</td>
        </tr>
        <tr>
            <td>8</td>
            <td>player8</td>
            <td>2</td>
        </tr>
        <tr>
            <td>9</td>
            <td>player9</td>
            <td>2</td>    
        </tr>
        <tr>
          <td>10</td>
          <td>player10</td>
          <td>1</td>    
      </tr>
        </tbody>
    </thead>
    </table>

    <div> *Fun Fact From 3rd Party* </div>
    </main>
  );
}