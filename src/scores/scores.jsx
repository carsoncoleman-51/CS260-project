import React from 'react';
import './scores.css';

const funFacts = [
  'There are more trees on Earth than stars in the Milky Way.',
  'Octopuses have three hearts.',
  'Bananas are berries, but strawberries are not.',
  'The Eiffel Tower can be 15 cm taller during the summer.',
  'Honey never spoils and can last indefinitely.',
];

export function Scores() {

  const [scores, setScores] = React.useState([]);
  const [funFact, setFunFact] = React.useState('');

  // on startup grab scores from local storage
  React.useEffect(() => {
    const scoresText = localStorage.getItem('score');
    if (scoresText) {
      setScores(JSON.parse(scoresText));
    }
  }, []);

  React.useEffect(() => {
    if (!funFacts.length) return;

    const pickRandom = () => {
      const next = funFacts[Math.floor(Math.random() * funFacts.length)];
      setFunFact(next);
    };

    pickRandom();
    const id = setInterval(pickRandom, 8000);
    return () => clearInterval(id);
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

      <div className="scores-fun-fact">{funFact}</div>
    </main>
  );
}
