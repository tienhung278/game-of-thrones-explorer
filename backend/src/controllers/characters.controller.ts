import { Request, Response } from 'express';
import type { ApiResponse, Character } from '../types';
import { fetchCharacters, fetchCharacterById } from '../services/thronesApi';
import { getCache, setCache } from '../utils/cache';
import { toErrorResponse } from '../utils/error';

function normalizeCharacter(c: Character): Character {
  return {
    id: c.id,
    firstName: c.firstName ?? null,
    lastName: c.lastName ?? null,
    fullName: c.fullName ?? (([c.firstName, c.lastName].filter(Boolean).join(' ')) || null),
    title: c.title ?? null,
    family: c.family ?? null,
    image: c.image ?? null,
    imageUrl: c.imageUrl ?? null,
  };
}

export async function getAllCharacters(req: Request, res: Response<ApiResponse<Character[]>>): Promise<void> {
  try {
    const cacheKey = 'characters:all';
    let all = getCache<Character[]>(cacheKey);

    if (!all) {
      const upstream = await fetchCharacters();
      all = upstream.map(normalizeCharacter);
      setCache(cacheKey, all, 60_000);
    }

    // Query params
    const q = (req.query.q as string | undefined)?.trim().toLowerCase() || '';
    const family = (req.query.family as string | undefined)?.trim().toLowerCase();
    const title = (req.query.title as string | undefined)?.trim().toLowerCase();
    const sortBy = (req.query.sortBy as string | undefined)?.trim();
    const sortOrder = ((req.query.sortOrder as string | undefined)?.toLowerCase() === 'desc') ? 'desc' : 'asc';
    const pageRaw = req.query.page as string | undefined;
    const pageSizeRaw = req.query.pageSize as string | undefined;

    let filtered = all;

    // Filtering
    if (q) {
      filtered = filtered.filter((c) => {
        const name = (c.fullName ?? `${c.firstName ?? ''} ${c.lastName ?? ''}`).toLowerCase();
        return name.includes(q);
      });
    }
    if (family) {
      filtered = filtered.filter((c) => (c.family ?? '').toLowerCase() === family);
    }
    if (title) {
      filtered = filtered.filter((c) => (c.title ?? '').toLowerCase().includes(title));
    }

    // Sorting
    const validSortBy = new Set(['id', 'fullName', 'firstName', 'lastName', 'title', 'family']);
    if (sortBy && validSortBy.has(sortBy)) {
      const sb = sortBy as 'id' | 'fullName' | 'firstName' | 'lastName' | 'title' | 'family';
      filtered = [...filtered].sort((a, b) => {
        let va: any;
        let vb: any;
        if (sb === 'id') {
          va = a.id;
          vb = b.id;
        } else if (sb === 'fullName') {
          va = (a.fullName ?? `${a.firstName ?? ''} ${a.lastName ?? ''}`).trim();
          vb = (b.fullName ?? `${b.firstName ?? ''} ${b.lastName ?? ''}`).trim();
        } else {
          va = (a[sb] as any) ?? '';
          vb = (b[sb] as any) ?? '';
        }

        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();

        if (va < vb) return sortOrder === 'asc' ? -1 : 1;
        if (va > vb) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Pagination
    const page = pageRaw ? parseInt(pageRaw, 10) : NaN;
    const pageSize = pageSizeRaw ? parseInt(pageSizeRaw, 10) : NaN;
    const shouldPaginate = Number.isFinite(page) || Number.isFinite(pageSize);

    if (shouldPaginate) {
      const safePage = !Number.isFinite(page) || page < 1 ? 1 : page;
      const safeSize = !Number.isFinite(pageSize) || pageSize < 1 ? 20 : Math.min(100, pageSize);
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / safeSize));
      const start = (safePage - 1) * safeSize;
      const items = filtered.slice(start, start + safeSize);

      res.json({ ok: true, data: items, pagination: { total, page: safePage, pageSize: safeSize, totalPages } });
      return;
    }

    res.json({ ok: true, data: filtered });
  } catch (err) {
    const error = toErrorResponse(err);
    const status = error.error?.status && error.error.status >= 400 ? error.error.status : 502;
    res.status(status).json(error);
  }
}

export async function getCharacterById(req: Request, res: Response<ApiResponse<Character>>): Promise<void> {
  try {
    const id = req.params.id;
    const cacheKey = `characters:${id}`;
    const cached = getCache<Character>(cacheKey);
    if (cached) {
      res.json({ ok: true, data: cached });
      return;
    }

    const upstream = await fetchCharacterById(id);
    const normalized = normalizeCharacter(upstream);

    setCache(cacheKey, normalized, 60_000);
    res.json({ ok: true, data: normalized });
  } catch (err) {
    const error = toErrorResponse(err);
    let status = error.error?.status ?? 500;
    if (status === 404) status = 404; else if (status < 400 || status === 500) status = 502;
    res.status(status).json(error);
  }
}
