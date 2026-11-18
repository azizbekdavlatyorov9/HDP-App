/** Shared JSON client for the NestJS API with SecureStore-backed bearer sessions. */

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getTokens,
  saveTokens,
  type StoredTokens,
} from './tokenStorage'

export type ApiErrorKind =
  | 'configuration'
  | 'network'
  | 'http'
  | 'invalid_response'
  | 'session_expired'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | null
  readonly details: unknown

  constructor(args: {
    kind: ApiErrorKind
    message: string
    status?: number | null
    details?: unknown
  }) {
    super(args.message)
    this.name = 'ApiError'
    this.kind = args.kind
    this.status = args.status ?? null
    this.details = args.details
  }
}

export interface ApiRequestOptions {
  /** Explicit access token override; otherwise authenticated requests read SecureStore. */
  bearerToken?: string
  /** Set false for public requests; authenticated requests use SecureStore by default. */
  auth?: boolean
  headers?: Readonly<Record<string, string>>
  signal?: AbortSignal
}

export interface ApiBodyOptions extends ApiRequestOptions {
  body?: unknown
}

interface ErrorPayload {
  message?: unknown
  error?: unknown
  errors?: unknown
  [key: string]: unknown
}

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ?? ''

const endpointUrl = (path: string): string => {
  if (!configuredBaseUrl) {
    throw new ApiError({
      kind: 'configuration',
      message: 'EXPO_PUBLIC_API_BASE_URL sozlanmagan.',
    })
  }

  const base = configuredBaseUrl.replace(/\/+$/, '')
  const endpoint = path.replace(/^\/+/, '')
  return `${base}/${endpoint}`
}

const isRecord = (value: unknown): value is ErrorPayload =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const messageFrom = (payload: unknown, fallback: string): string => {
  if (!isRecord(payload)) return fallback

  const message = payload.message
  if (typeof message === 'string' && message.trim()) return message
  if (Array.isArray(message)) {
    const parts = message.filter((part): part is string => typeof part === 'string')
    if (parts.length) return parts.join('\n')
  }
  if (typeof payload.error === 'string' && payload.error.trim()) return payload.error
  if (Array.isArray(payload.errors)) {
    const parts = payload.errors.filter((part): part is string => typeof part === 'string')
    if (parts.length) return parts.join('\n')
  }
  return fallback
}

const parseResponse = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return undefined

  const text = await response.text()
  if (!text.trim()) return undefined

  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new ApiError({
      kind: 'invalid_response',
      status: response.status,
      message: 'Server JSON formatida javob qaytarmadi.',
    })
  }
}

const rawRequest = async <TResponse>(
  method: string,
  path: string,
  options: ApiBodyOptions = {},
): Promise<TResponse> => {
  const url = endpointUrl(path)
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  }

  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.bearerToken?.trim()) {
    headers.Authorization = `Bearer ${options.bearerToken.trim()}`
  }

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
      ...(options.signal ? { signal: options.signal } : {}),
    })
  } catch {
    throw new ApiError({
      kind: 'network',
      message: "API serverga ulanib bo'lmadi. Tarmoq va server manzilini tekshiring.",
    })
  }

  let payload: unknown
  try {
    payload = await parseResponse(response)
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      if (!response.ok) {
        throw new ApiError({
          kind: 'http',
          status: response.status,
          message: `API so'rovi bajarilmadi (${response.status}).`,
        })
      }
      throw error
    }
    throw new ApiError({
      kind: 'invalid_response',
      status: response.status,
      message: "Server javobini o'qib bo'lmadi.",
    })
  }

  if (!response.ok) {
    throw new ApiError({
      kind: 'http',
      status: response.status,
      message: messageFrom(payload, `API so'rovi bajarilmadi (${response.status}).`),
      details: payload,
    })
  }

  return payload as TResponse
}

const isSessionResponse = (value: unknown): value is StoredTokens => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  return (
    typeof record.accessToken === 'string' &&
    record.accessToken.trim().length > 0 &&
    typeof record.refreshToken === 'string' &&
    record.refreshToken.trim().length > 0
  )
}

export class SessionExpiredError extends ApiError {
  constructor(status: number | null = 401) {
    super({
      kind: 'session_expired',
      status,
      message: 'Sessiya tugagan. Qaytadan tizimga kiring.',
    })
    this.name = 'SessionExpiredError'
  }
}

let refreshPromise: Promise<string> | null = null
let refreshRequestCount = 0

/** Dev-panel instrumentation; records refresh request count, never token data. */
export const getRefreshRequestCountForDevTest = (): number =>
  __DEV__ ? refreshRequestCount : 0

export const resetRefreshRequestCountForDevTest = (): void => {
  if (__DEV__) refreshRequestCount = 0
}

const sanitizeAuthError = (error: unknown): unknown => {
  if (!(error instanceof ApiError)) return error
  if (error.kind === 'http') {
    return new ApiError({
      kind: 'http',
      status: error.status,
      message: `Authentication so'rovi bajarilmadi (${error.status ?? 'noma’lum'}).`,
    })
  }
  return error
}

const performRefresh = async (): Promise<string> => {
  let refreshToken: string | null
  try {
    refreshToken = await getRefreshToken()
  } catch {
    throw new ApiError({
      kind: 'invalid_response',
      message: 'Saqlangan sessiyani o‘qib bo‘lmadi.',
    })
  }

  if (!refreshToken) {
    await clearTokens()
    throw new SessionExpiredError()
  }

  let response: unknown
  try {
    if (__DEV__) refreshRequestCount += 1
    response = await rawRequest<unknown>('POST', '/auth/refresh', {
      body: { refreshToken },
      auth: false,
    })
  } catch (error: unknown) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      await clearTokens()
      throw new SessionExpiredError(error.status)
    }
    throw sanitizeAuthError(error)
  }

  if (!isSessionResponse(response)) {
    throw new ApiError({
      kind: 'invalid_response',
      message: 'Refresh endpoint kutilgan session javobini qaytarmadi.',
    })
  }

  await saveTokens(response.accessToken, response.refreshToken)
  return response.accessToken
}

const refreshAccessToken = async (rejectedAccessToken: string | undefined): Promise<string> => {
  const currentAccessToken = await getAccessToken()
  if (currentAccessToken && currentAccessToken !== rejectedAccessToken) {
    return currentAccessToken
  }

  if (!refreshPromise) {
    const currentRefresh = performRefresh().finally(() => {
      refreshPromise = null
    })
    refreshPromise = currentRefresh
  }
  return refreshPromise
}

const request = async <TResponse>(
  method: string,
  path: string,
  options: ApiBodyOptions = {},
): Promise<TResponse> => {
  const isRefreshEndpoint = path.replace(/^\/+/, '').replace(/\/+$/, '') === 'auth/refresh'
  const shouldAuthenticate = options.auth !== false && !isRefreshEndpoint
  const accessToken = isRefreshEndpoint
    ? undefined
    : options.bearerToken !== undefined
      ? options.bearerToken
      : shouldAuthenticate
        ? await getAccessToken()
        : undefined
  const firstAttemptOptions = { ...options, bearerToken: accessToken ?? undefined, auth: false }

  try {
    return await rawRequest<TResponse>(method, path, firstAttemptOptions)
  } catch (error: unknown) {
    if (
      !shouldAuthenticate ||
      isRefreshEndpoint ||
      !(error instanceof ApiError) ||
      error.kind !== 'http' ||
      error.status !== 401
    ) {
      throw error
    }

    const refreshedAccessToken = await refreshAccessToken(accessToken ?? undefined)
    return rawRequest<TResponse>(method, path, {
      ...options,
      bearerToken: refreshedAccessToken,
      auth: false,
    })
  }
}

/** Revoke this device's refresh token remotely, then always clear local tokens. */
export const logout = async (): Promise<void> => {
  let tokens: StoredTokens | null = null
  let readError: unknown
  try {
    tokens = await getTokens()
  } catch (error: unknown) {
    readError = error
  }

  let requestError: unknown
  if (tokens) {
    try {
      await rawRequest<void>('POST', '/auth/logout', {
        bearerToken: tokens.accessToken,
        body: { refreshToken: tokens.refreshToken },
        auth: false,
      })
    } catch (error: unknown) {
      requestError = sanitizeAuthError(error)
    }
  }

  await clearTokens()
  if (requestError) throw requestError
  if (readError) throw readError
}

export const api = {
  get: <TResponse>(path: string, options: ApiRequestOptions = {}) =>
    request<TResponse>('GET', path, options),

  post: <TResponse>(path: string, body?: unknown, options: ApiRequestOptions = {}) =>
    request<TResponse>('POST', path, { ...options, body }),

  patch: <TResponse>(path: string, body?: unknown, options: ApiRequestOptions = {}) =>
    request<TResponse>('PATCH', path, { ...options, body }),

  put: <TResponse>(path: string, body?: unknown, options: ApiRequestOptions = {}) =>
    request<TResponse>('PUT', path, { ...options, body }),

  delete: <TResponse>(path: string, body?: unknown, options: ApiRequestOptions = {}) =>
    request<TResponse>('DELETE', path, { ...options, body }),
}

export interface AuthMeResponse {
  id: string
  name: string
  email: string | null
  roles: string[]
}

/** GET /api/auth/me. Uses SecureStore by default; pass a token to override it. */
export const getAuthMe = (accessToken?: string) =>
  api.get<AuthMeResponse>('/auth/me', { bearerToken: accessToken })
