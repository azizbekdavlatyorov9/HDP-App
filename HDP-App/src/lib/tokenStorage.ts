import * as SecureStore from 'expo-secure-store'

const ACCESS_TOKEN_KEY = 'hdp_access_token'
const REFRESH_TOKEN_KEY = 'hdp_refresh_token'

export interface StoredTokens {
  accessToken: string
  refreshToken: string
}

export type TokenStorageOperation = 'save' | 'read' | 'clear' | 'incomplete'

export class TokenStorageError extends Error {
  readonly operation: TokenStorageOperation

  constructor(operation: TokenStorageOperation, message: string) {
    super(message)
    this.name = 'TokenStorageError'
    this.operation = operation
  }
}

const storageFailure = (operation: TokenStorageOperation) =>
  new TokenStorageError(operation, 'Xavfsiz token xotirasi bilan ishlashda xatolik yuz berdi.')

const readValues = async (): Promise<[string | null, string | null]> => {
  try {
    return await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ])
  } catch {
    throw storageFailure('read')
  }
}

const readValue = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key)
  } catch {
    throw storageFailure('read')
  }
}

export const saveTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  if (!accessToken.trim() || !refreshToken.trim()) {
    throw new TokenStorageError('save', 'Access va refresh token bo‘sh bo‘lmasligi kerak.')
  }

  const writes = await Promise.allSettled([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ])
  if (writes.some((result) => result.status === 'rejected')) {
    // A partially stored pair must not be treated as a valid session.
    await Promise.allSettled([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ])
    throw storageFailure('save')
  }
}

export const getAccessToken = async (): Promise<string | null> => {
  return readValue(ACCESS_TOKEN_KEY)
}

export const getRefreshToken = async (): Promise<string | null> => {
  return readValue(REFRESH_TOKEN_KEY)
}

export const getTokens = async (): Promise<StoredTokens | null> => {
  const [accessToken, refreshToken] = await readValues()
  if (accessToken === null && refreshToken === null) return null
  if (accessToken === null || refreshToken === null) {
    throw new TokenStorageError('incomplete', 'Xavfsiz xotirada tokenlar jufti to‘liq emas.')
  }
  return { accessToken, refreshToken }
}

export const clearTokens = async (): Promise<void> => {
  const results = await Promise.allSettled([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ])
  if (results.some((result) => result.status === 'rejected')) {
    throw storageFailure('clear')
  }
}
