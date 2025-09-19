import request from 'supertest';
import app from '../app';
import { clearCache } from '../utils/cache';

// Mock the Thrones API service
const mockFetchCharacters = jest.fn();
const mockFetchCharacterById = jest.fn();
jest.mock('../services/thronesApi', () => ({
  fetchCharacters: (...args: any[]) => mockFetchCharacters(...args),
  fetchCharacterById: (...args: any[]) => mockFetchCharacterById(...args),
}));

const upstream = [
  { id: 1, firstName: 'Jon', lastName: 'Snow', fullName: null, title: 'King in the North', family: 'Stark', imageUrl: '' },
  { id: 2, firstName: 'Arya', lastName: 'Stark', fullName: 'Arya Stark', title: 'Assassin', family: 'Stark', imageUrl: '' },
  { id: 3, firstName: 'Cersei', lastName: 'Lannister', title: 'Queen', family: 'Lannister', imageUrl: '' },
  { id: 4, firstName: 'Tywin', lastName: 'Lannister', title: 'Hand of the King', family: 'Lannister', imageUrl: '' },
];

beforeEach(() => {
  clearCache();
  mockFetchCharacters.mockReset();
  mockFetchCharacterById.mockReset();
});

describe('GET /api/v1/characters', () => {
  test('returns normalized list without pagination headers by default', async () => {
    mockFetchCharacters.mockResolvedValueOnce(upstream);

    const res = await request(app).get('/api/v1/characters');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(4);

    const jon = res.body.data.find((c: any) => c.id === 1);
    expect(jon.fullName).toBe('Jon Snow');

    expect(res.headers['x-total-count']).toBeUndefined();
    expect(res.headers['x-page']).toBeUndefined();
    expect(res.headers['x-page-size']).toBeUndefined();
    expect(res.headers['x-total-pages']).toBeUndefined();
  });

  test('applies filtering, sorting, and pagination', async () => {
    mockFetchCharacters.mockResolvedValueOnce(upstream);

    const res = await request(app)
      .get('/api/v1/characters')
      .query({ family: 'Lannister', sortBy: 'id', sortOrder: 'desc', page: 1, pageSize: 1 });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    const items = res.body.data as any[];
    expect(items.length).toBe(1);
    expect(items[0].lastName).toBe('Lannister');

    // Pagination should be returned in body, not headers
    expect(res.headers['x-total-count']).toBeUndefined();
    expect(res.headers['x-page']).toBeUndefined();
    expect(res.headers['x-page-size']).toBeUndefined();
    expect(res.headers['x-total-pages']).toBeUndefined();

    expect(res.body.pagination).toEqual({ total: 2, page: 1, pageSize: 1, totalPages: 2 });
  });

  test('maps upstream failure to 502 when not a 4xx error', async () => {
    const axiosLikeError = Object.assign(new Error('Upstream down'), {
      isAxiosError: true,
      code: 'ECONNREFUSED',
    });
    mockFetchCharacters.mockRejectedValueOnce(axiosLikeError);

    const res = await request(app).get('/api/v1/characters');
    expect(res.status).toBe(502);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.message).toBe('Upstream down');
  });
});

describe('GET /api/v1/characters/:id', () => {
  test('returns normalized character and caches result', async () => {
    mockFetchCharacterById.mockResolvedValueOnce({ id: 42, firstName: 'Brienne', lastName: 'Tarth', fullName: null, title: 'Lady', family: 'Tarth', imageUrl: '' });

    const res1 = await request(app).get('/api/v1/characters/42');
    expect(res1.status).toBe(200);
    expect(res1.body.ok).toBe(true);
    expect(res1.body.data.fullName).toBe('Brienne Tarth');
    expect(mockFetchCharacterById).toHaveBeenCalledTimes(1);

    const res2 = await request(app).get('/api/v1/characters/42');
    expect(res2.status).toBe(200);
    expect(res2.body.ok).toBe(true);
    expect(mockFetchCharacterById).toHaveBeenCalledTimes(1);
  });

  test('returns 404 when upstream responds 404', async () => {
    const notFound = Object.assign(new Error('Not found'), {
      isAxiosError: true,
      response: { status: 404, data: { message: 'Not found' } },
    });
    mockFetchCharacterById.mockRejectedValueOnce(notFound);

    const res = await request(app).get('/api/v1/characters/9999');
    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
    expect(res.body.error.message).toBe('Not found');
  });
});
