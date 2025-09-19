// Shared types for API responses and domain models

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
