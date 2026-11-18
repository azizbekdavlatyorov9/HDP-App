import { api } from './api'

export const TELEGRAM_OIDC_ORIGIN = 'https://hdp-telegram-auth.vercel.app'

const configuredPageUrl =
  process.env.EXPO_PUBLIC_TELEGRAM_OIDC_URL?.trim() || TELEGRAM_OIDC_ORIGIN
const configuredApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ?? ''

const requireHttpsApi = (): void => {
  try {
    if (new URL(configuredApiBaseUrl).protocol !== 'https:') throw new Error()
  } catch {
    throw new Error('Telegram autentifikatsiyasi uchun backend HTTPS manzili kerak.')
  }
}

export const getTelegramOidcPageUrl = (): string => {
  try {
    const url = new URL(configuredPageUrl)
    if (
      url.protocol !== 'https:' ||
      url.origin !== TELEGRAM_OIDC_ORIGIN ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      throw new Error('Invalid Telegram OIDC page configuration.')
    }
    return url.toString()
  } catch {
    throw new Error('Telegram OIDC sahifasi konfiguratsiyasi noto‘g‘ri.')
  }
}

export const isTrustedTelegramOidcUrl = (value: string): boolean => {
  try {
    const url = new URL(value)
    return (
      url.origin === TELEGRAM_OIDC_ORIGIN &&
      !url.username &&
      !url.password
    )
  } catch {
    return false
  }
}

export interface TelegramLoginChallenge {
  nonce: string
  expiresAt: string
}

export interface TelegramAuthSession {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: {
    id: string
    displayName: string
    roles: string[]
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isJwt = (value: string): boolean => {
  if (value.length > 10_000) return false
  const parts = value.split('.')
  return parts.length === 3 && parts.every((part) => part.length > 0)
}

export const createTelegramLoginChallenge = async (): Promise<TelegramLoginChallenge> => {
  requireHttpsApi()
  const value: unknown = await api.post('/auth/telegram/challenge', undefined, { auth: false })
  if (!isRecord(value)) throw new Error('Telegram challenge javobi noto‘g‘ri.')

  const nonce = value.nonce
  const expiresAt = value.expiresAt
  if (
    typeof nonce !== 'string' ||
    !/^[A-Za-z0-9_-]{32,128}$/.test(nonce) ||
    typeof expiresAt !== 'string' ||
    !Number.isFinite(Date.parse(expiresAt)) ||
    Date.parse(expiresAt) <= Date.now()
  ) {
    throw new Error('Telegram challenge muddati yoki formati noto‘g‘ri.')
  }

  return { nonce, expiresAt }
}

export const exchangeTelegramIdToken = async (idToken: string): Promise<TelegramAuthSession> => {
  if (!isJwt(idToken)) throw new Error('Telegram ID token formati noto‘g‘ri.')
  requireHttpsApi()

  const value: unknown = await api.post('/auth/telegram', { idToken }, { auth: false })
  if (!isRecord(value) || !isRecord(value.user)) {
    throw new Error('Auth server kutilgan session javobini qaytarmadi.')
  }

  const user = value.user
  if (
    typeof value.accessToken !== 'string' ||
    !value.accessToken.trim() ||
    typeof value.refreshToken !== 'string' ||
    !value.refreshToken.trim() ||
    value.tokenType !== 'Bearer' ||
    typeof value.expiresIn !== 'number' ||
    typeof user.id !== 'string' ||
    typeof user.displayName !== 'string' ||
    !Array.isArray(user.roles) ||
    !user.roles.every((role): role is string => typeof role === 'string')
  ) {
    throw new Error('Auth server kutilgan session javobini qaytarmadi.')
  }

  return {
    accessToken: value.accessToken,
    refreshToken: value.refreshToken,
    tokenType: 'Bearer',
    expiresIn: value.expiresIn,
    user: {
      id: user.id,
      displayName: user.displayName,
      roles: user.roles,
    },
  }
}
