import React, { useState } from 'react';
import './App.css';
import CharactersList from './components/CharactersList';
import CharacterDetails from './components/CharacterDetails';
import type { Character } from './services/api';

function App() {
  const [selected, setSelected] = useState<Character | null>(null);

  return (
    <div className="App">
      <header className="header">
        <h1>Game of Thrones Explorer</h1>
        <p className="subtitle">Browse characters, search by name, and view details.</p>
      </header>
      <main>
        <CharactersList onSelect={(c) => setSelected(c)} />
      </main>
      {selected && (
        <CharacterDetails id={selected.id} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export default App;
