export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: { message: string; code?: string; status?: number };
  pagination?: Pagination;
}

export interface Character {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  title?: string | null;
  family?: string | null;
  image?: string | null;
  imageUrl?: string | null;
}

export interface CharactersQuery {
  q?: string;
  family?: string;
  title?: string;
  sortBy?: 'id' | 'fullName' | 'firstName' | 'lastName' | 'title' | 'family';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface CharactersResult {
  items: Character[];
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

const BASE_URL = (process.env.REACT_APP_BFF_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Accept': 'application/json' },
    ...init,
  });
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.ok) {
    const message = json.error?.message || `Request failed with status ${json.error?.status ?? res.status}`;
    throw new Error(message);
  }
  return json.data as T;
}

function buildQuery(params: Record<string, any>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    sp.append(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  async searchCharacters(params: CharactersQuery = {}): Promise<CharactersResult> {
    const qs = buildQuery(params as any);
    const res = await fetch(`${BASE_URL}/api/v1/characters${qs}`, {
      headers: { Accept: 'application/json' },
    });
    const json = (await res.json()) as ApiResponse<Character[]>;
    if (!json.ok) {
      const message = json.error?.message || `Request failed with status ${json.error?.status ?? res.status}`;
      throw new Error(message);
    }
    const p = json.pagination;
    return {
      items: (json.data || []) as Character[],
      total: p?.total,
      page: p?.page,
      pageSize: p?.pageSize,
      totalPages: p?.totalPages,
    };
  },
  getCharacter(id: number | string): Promise<Character> {
    return request<Character>(`/api/v1/characters/${id}`);
  },
};
