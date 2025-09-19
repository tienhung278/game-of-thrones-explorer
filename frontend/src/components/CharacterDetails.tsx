import React, { useEffect, useState } from 'react';
import { api, Character } from '../services/api';
import './CharacterDetails.css';

export interface CharacterDetailsProps {
  id: number;
  onClose: () => void;
}

export default function CharacterDetails({ id, onClose }: CharacterDetailsProps) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api
      .getCharacter(id)
      .then((data) => {
        if (!active) return;
        setCharacter(data);
      })
      .catch((e: Error) => {
        if (!active) return;
        setError(e.message);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="details-overlay" role="dialog" aria-modal="true">
      <div className="details">
        <button className="close" onClick={onClose} aria-label="Close">×</button>
        {loading && <div className="status">Loading...</div>}
        {error && <div className="status error">Error: {error}</div>}
        {character && (
          <div className="content">
            <div className="header">
              <img src={character.imageUrl || ''} alt={character.fullName || 'Character'} onError={(e) => ((e.currentTarget.src = ''), (e.currentTarget.alt = 'No image'))} />
              <div>
                <h2>{character.fullName || `${character.firstName || ''} ${character.lastName || ''}`}</h2>
                {character.title && <div className="title">{character.title}</div>}
                {character.family && <div className="family">{character.family}</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
