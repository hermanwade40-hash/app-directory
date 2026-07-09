import { useMemo, useState } from 'react';
import { Download, Save, Trash2, RotateCcw } from 'lucide-react';

const categories = [
  { key: 'harmony', label: 'Facial harmony', weight: 20 },
  { key: 'jawChin', label: 'Jaw and chin', weight: 15 },
  { key: 'skin', label: 'Skin quality', weight: 15 },
  { key: 'eyes', label: 'Eye area', weight: 10 },
  { key: 'nose', label: 'Nose balance', weight: 10 },
  { key: 'hair', label: 'Hair and hairline', weight: 10 },
  { key: 'leanness', label: 'Leanness and body frame', weight: 10 },
  { key: 'style', label: 'Style and grooming', weight: 10 }
];

const initialScores = Object.fromEntries(categories.map((item) => [item.key, 5]));

function scoreLabel(score) {
  if (score >= 8) return 'Elite range';
  if (score >= 7) return 'Very strong';
  if (score >= 6) return 'Above average';
  if (score >= 5) return 'Average';
  if (score >= 4) return 'Low average';
  return 'Needs work';
}

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem('personalRatingEntries')) || [];
  } catch {
    return [];
  }
}

export default function App() {
  const [name, setName] = useState('Me');
  const [notes, setNotes] = useState('');
  const [scores, setScores] = useState(initialScores);
  const [entries, setEntries] = useState(loadEntries);

  const finalScore = useMemo(() => {
    const total = categories.reduce((sum, item) => sum + scores[item.key] * item.weight, 0);
    return Number((total / 100).toFixed(1));
  }, [scores]);

  const strongest = useMemo(() => {
    return [...categories].sort((a, b) => scores[b.key] - scores[a.key])[0];
  }, [scores]);

  const weakest = useMemo(() => {
    return [...categories].sort((a, b) => scores[a.key] - scores[b.key])[0];
  }, [scores]);

  function updateScore(key, value) {
    setScores((current) => ({ ...current, [key]: Number(value) }));
  }

  function saveEntry() {
    const entry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      name,
      notes,
      scores,
      finalScore
    };
    const next = [entry, ...entries];
    setEntries(next);
    localStorage.setItem('personalRatingEntries', JSON.stringify(next));
  }

  function deleteEntry(id) {
    const next = entries.filter((entry) => entry.id !== id);
    setEntries(next);
    localStorage.setItem('personalRatingEntries', JSON.stringify(next));
  }

  function resetForm() {
    setScores(initialScores);
    setNotes('');
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rating-history.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Private self-rating dashboard</p>
          <h1>Personal Rating Tracker</h1>
          <p className="hero-copy">
            Score key appearance factors, save snapshots, and track grooming or fitness progress over time.
            This is a manual tracker, not a scientific judgement system.
          </p>
        </div>
        <div className="score-ring">
          <span>{finalScore}</span>
          <small>{scoreLabel(finalScore)}</small>
        </div>
      </section>

      <section className="grid-layout">
        <div className="panel input-panel">
          <div className="field-row">
            <label>
              Entry name
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
          </div>

          <div className="slider-list">
            {categories.map((item) => (
              <label className="slider-card" key={item.key}>
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.weight}% weight</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={scores[item.key]}
                  onChange={(event) => updateScore(item.key, event.target.value)}
                />
                <b>{scores[item.key].toFixed(1)}</b>
              </label>
            ))}
          </div>

          <label className="notes-field">
            Notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Example: leaner face, haircut planned, skin routine, beard trim, gym progress..."
            />
          </label>

          <div className="button-row">
            <button onClick={saveEntry}><Save size={18} /> Save snapshot</button>
            <button className="secondary" onClick={resetForm}><RotateCcw size={18} /> Reset</button>
            <button className="secondary" onClick={exportJson}><Download size={18} /> Export JSON</button>
          </div>
        </div>

        <aside className="panel insights-panel">
          <h2>Readout</h2>
          <div className="metric-card">
            <span>Current score</span>
            <strong>{finalScore}/10</strong>
          </div>
          <div className="metric-card">
            <span>Strongest category</span>
            <strong>{strongest.label}</strong>
          </div>
          <div className="metric-card">
            <span>Main improvement lever</span>
            <strong>{weakest.label}</strong>
          </div>
          <p className="hint">
            Best use: rate yourself every 2 to 4 weeks under similar lighting and grooming conditions, then compare entries.
          </p>
        </aside>
      </section>

      <section className="panel history-panel">
        <div className="history-header">
          <h2>Saved history</h2>
          <span>{entries.length} saved</span>
        </div>

        {entries.length === 0 ? (
          <p className="empty-state">No snapshots saved yet. Add your first one and it will stay in this browser.</p>
        ) : (
          <div className="history-list">
            {entries.map((entry) => (
              <article className="history-item" key={entry.id}>
                <div>
                  <strong>{entry.name}</strong>
                  <span>{new Date(entry.createdAt).toLocaleString()}</span>
                  {entry.notes && <p>{entry.notes}</p>}
                </div>
                <div className="history-score">
                  <b>{entry.finalScore}</b>
                  <button aria-label="Delete entry" onClick={() => deleteEntry(entry.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
