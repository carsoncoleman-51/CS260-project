import React from 'react';
import './scores.css';

export function Scores() {

  const [scores, setScores] = React.useState([]);

  // on startup grab scores from local storage
  React.useEffect(() => {
    const scoresText = localStorage.getItem('scores');
    if (scoresText) {
      setScores(JSON.parse(scoresText));
    }
  }, []);

  const scoreRows = [];
  if (scores.length) {
    for (const [i, score] of scores.entries()) {
      scoreRows.push(
        <tr key={i}>
          <td>{i}</td>
          <td>{score.name.split('@')[0]}</td>
          <td>{score.score}</td>
          <td>{score.date}</td>
        </tr>
      );
    }
  } else {
    scoreRows.push(
      <tr key='0'>
        <td colSpan='4'>Be the first to score</td>
      </tr>
    );
  }

  return (
    <main className="scores-view">
      <table className="scores-display-table">
      <thead className='scores-display-table-header'>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Score</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody id='scores'>
          {scoreRows}
        </tbody>
      </table>

      <div className="scores-fun-fact">*Fun Fact From 3rd Party*</div>
    </main>
  );
}

export function randomFunFact() {
  const [quote, setQuote] = React.useState('ig it didnt work');

  React.useEffect(() => {
    setQuote('Show me the code');
  }, []);
  return
}

const funFacts = [
  
];  