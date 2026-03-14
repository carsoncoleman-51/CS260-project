import React from 'react';
import './scores.css';



export function Scores() {

  const [scores, setScores] = React.useState([]);
  const [funFact, setFunFact] = React.useState('Loading fun fact...');

  const getFunFact = React.useCallback(async () => {
    setFunFact('Loading fun fact...');
    try {
      const response = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
      if (!response.ok) {
        throw new Error('Failed to fetch random fact');
      }

      const data = await response.json();
      setFunFact(data.text || 'No fact available right now.');
    } catch (error) {
      setFunFact('Could not load a fun fact right now.');
    }
  }, []);

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
    getFunFact();
  }, [getFunFact]);


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

      <div className="scores-fun-fact" onClick={getFunFact}>
        {funFact}
      </div>
    </main>
  );
}
