import React from 'react';
import './scores.css';

const funFacts = [
  'There are more trees on Earth than stars in the Milky Way.',
  'Octopuses have three hearts.',
  'Bananas are berries, but strawberries are not.',
  'The Eiffel Tower can be 15 cm taller during the summer.',
  'Honey never spoils and can last indefinitely.',
  'A day on Venus is longer than a year on Venus.',
  'Sharks have been around longer than trees.',
  'The human nose can remember 50,000 different scents.',
  'Wombat poop is cube-shaped.',
  'The shortest war in history lasted just 38 minutes.',
];

export function Scores() {

  const [scores, setScores] = React.useState([]);
  const [funFact, setFunFact] = React.useState('');

  // on startup grab scores from local storage
  React.useEffect(() => {
    const usersText = localStorage.getItem('users');
    if (usersText) {
      try {
        const parsed = JSON.parse(usersText);
        setScores(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        setScores([]);
      }
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
    const sortedScores = [...scores].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    for (const [i, score] of sortedScores.slice(0, 10).entries()) {
      scoreRows.push(
        <tr key={i + 1}>
          <td>{i + 1}</td>
          <td>{score.name.split('@')[0]}</td>
          <td>{score.score ?? 0}</td>
          <td>{score.date || '-'}</td>
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
