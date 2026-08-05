import { AUTH_TOKEN_STORAGE_KEY, DEFAULT_API_BASE_URL } from '@/lib/constants'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL

/**
 * Thrown for any non-2xx response. Carries the Backend's `{ error, details? }`
 * shape (see Backend/FLUTTER_GUIDE.md) so callers can branch on `.status` or
 * surface `.details` (field-level validation messages) without re-parsing.
 */
export class ApiError extends Error {
  status: number
  details?: string[]

  constructor(message: string, status: number, details?: string[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

function readToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  } catch {
    // localStorage can throw in locked-down environments (private mode, etc.) — treat as guest.
    return null
  }
}

/**
 * Thin fetch wrapper around the Backend API. Attaches `Authorization: Bearer`
 * when a token is present in storage, and normalizes the `{ error, details? }`
 * error shape into a thrown `ApiError`.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const token = readToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  const contentType = res.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json') ? await res.json().catch(() => undefined) : undefined

  if (!res.ok) {
    const errorPayload = payload as { error?: string; details?: string[] } | undefined
    throw new ApiError(errorPayload?.error ?? `Request failed with status ${res.status}`, res.status, errorPayload?.details)
  }

  return payload as T
}
