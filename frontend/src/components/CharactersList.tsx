import React, { useEffect, useState } from 'react';
import { api, Character } from '../services/api';
import './CharactersList.css';

// Simple debounce hook to delay applying input values
function useDebounced<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export interface CharactersListProps {
  onSelect: (character: Character) => void;
}

export default function CharactersList({ onSelect }: CharactersListProps) {
  const [items, setItems] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & sorting
  const [q, setQ] = useState('');
  const [family, setFamily] = useState('');
  const [title, setTitle] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'fullName' | 'firstName' | 'lastName' | 'title' | 'family'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);

  const debouncedQ = useDebounced(q, 400);
  const debouncedFamily = useDebounced(family, 400);
  const debouncedTitle = useDebounced(title, 400);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api
      .searchCharacters({ q: debouncedQ, family: debouncedFamily, title: debouncedTitle, sortBy, sortOrder, page, pageSize })
      .then((res) => {
        if (!active) return;
        setItems(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch((e: Error) => {
        if (!active) return;
        setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [debouncedQ, debouncedFamily, debouncedTitle, sortBy, sortOrder, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [q, family, title, sortBy, sortOrder, pageSize]);

  const startIdx = total ? (page - 1) * pageSize + 1 : 0;
  const endIdx = total ? Math.min(total, startIdx + items.length - 1) : items.length;

  if (loading) return <div className="status">Loading characters...</div>;
  if (error) return <div className="status error">Error: {error}</div>;

  return (
    <div className="characters-list">
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search name..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="search by name"
        />
        <input
          type="text"
          placeholder="Filter family..."
          value={family}
          onChange={(e) => setFamily(e.target.value)}
          aria-label="filter by family"
        />
        <input
          type="text"
          placeholder="Filter title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="filter by title"
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} aria-label="sort by">
          <option value="id">ID</option>
          <option value="fullName">Full Name</option>
          <option value="firstName">First Name</option>
          <option value="lastName">Last Name</option>
          <option value="title">Title</option>
          <option value="family">Family</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')} aria-label="sort order">
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} aria-label="page size">
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span className="count">
          {typeof total === 'number' ? (
            <>Showing {startIdx}-{endIdx} of {total}</>
          ) : (
            <>{items.length} characters</>
          )}
        </span>
      </div>

      <div className="grid">
        {items.map((c) => (
          <button key={c.id} className="card" onClick={() => onSelect(c)}>
            <img
              src={c.imageUrl || ''}
              alt={c.fullName || 'Character'}
              onError={(e) => ((e.currentTarget.src = ''), (e.currentTarget.alt = 'No image'))}
            />
            <div className="info">
              <div className="name">{c.fullName || `${c.firstName || ''} ${c.lastName || ''}`}</div>
              {c.title && <div className="title">{c.title}</div>}
              {c.family && <div className="family">{c.family}</div>}
            </div>
          </button>
        ))}
      </div>

      <div className="pagination">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} aria-label="Previous page">
          ◀ Prev
        </button>
        <span className="page-info">
          Page {page}
          {typeof totalPages === 'number' && totalPages > 0 ? ` of ${totalPages}` : ''}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={typeof totalPages === 'number' ? page >= totalPages : items.length < pageSize}
          aria-label="Next page"
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}
