export interface AuthUser {
  token?: string;
  tokenType?: string;
  userId?: number;
  fullName?: string;
  email?: string;
  role?: string;
  status?: string;
  mustChangePassword?: boolean;
}

// Store token and user in memory
let inMemoryAccessToken: string | null = null;
let inMemoryUser: AuthUser | null = null;

export function getToken(): string | null {
  return inMemoryAccessToken;
}

export function setToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function clearToken(): void {
  inMemoryAccessToken = null;
}

export function getUser(): AuthUser | null {
  return inMemoryUser;
}

export function setUser(user: AuthUser | null): void {
  inMemoryUser = user;
}

export function clearAuth(): void {
  inMemoryAccessToken = null;
  inMemoryUser = null;
}
