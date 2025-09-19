import axios from 'axios';
import { DEFAULT_TIMEOUT_MS, THRONES_API_BASE } from '../config/env';
import type { Character } from '../types';

const client = axios.create({
  baseURL: THRONES_API_BASE,
  timeout: DEFAULT_TIMEOUT_MS,
});

export async function fetchCharacters(): Promise<Character[]> {
  const { data } = await client.get<Character[]>('/api/v2/Characters');
  return data;
}

export async function fetchCharacterById(id: string | number): Promise<Character> {
  const { data } = await client.get<Character>(`/api/v2/Characters/${encodeURIComponent(String(id))}`);
  return data;
}
