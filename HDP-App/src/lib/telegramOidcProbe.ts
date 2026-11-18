import { AppState, Linking } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { api } from './api'

export type TelegramOidcProbeResult = 'PASS' | 'FAIL' | 'ERROR'

interface ProbeStartResponse {
  authorizationUrl: string
  probeId: string
}

const CALLBACK_SCHEME = 'hdpacademy:'
const CALLBACK_HOST = 'telegram-oidc-probe'
const MAX_WAIT_MS = 5 * 60_000
const PROBE_ID_STORAGE_KEY = 'hdp.telegramOidcProbeId'

const isProbeCallback = (url: string): boolean => {
  try {
    const callback = new URL(url)
    return (
      callback.protocol === CALLBACK_SCHEME &&
      callback.hostname === CALLBACK_HOST &&
      callback.searchParams.get('complete') === '1'
    )
  } catch {
    return false
  }
}

const isTelegramAuthorizationUrl = (value: string): boolean => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'oauth.telegram.org' && url.pathname === '/auth'
  } catch {
    return false
  }
}

const getBackendResult = async (probeId: string): Promise<TelegramOidcProbeResult> => {
  const response = await api.post<{ result: unknown }>(
    '/auth/telegram/oidc-probe/result',
    { probeId },
    { auth: false },
  )
  return response.result === 'PASS' || response.result === 'FAIL'
    ? response.result
    : 'ERROR'
}

/** Recovers a callback when Android cold-starts the dev app from the probe deep link. */
export const resumeTelegramOidcProbeFromInitialUrl = async (): Promise<TelegramOidcProbeResult | null> => {
  let initialUrl: string | null | undefined
  try {
    initialUrl = await Linking.getInitialURL()
  } catch {
    return 'ERROR'
  }
  if (!initialUrl || !isProbeCallback(initialUrl)) return null

  try {
    const probeId = await SecureStore.getItemAsync(PROBE_ID_STORAGE_KEY)
    return probeId ? await getBackendResult(probeId) : 'ERROR'
  } catch {
    return 'ERROR'
  } finally {
    try {
      await SecureStore.deleteItemAsync(PROBE_ID_STORAGE_KEY)
    } catch {
      // A probe result does not authenticate a user if cleanup is temporarily unavailable.
    }
  }
}

/** Starts the backend-only verification probe; no ID token or app session reaches the device. */
export const runTelegramOidcProbe = async (): Promise<TelegramOidcProbeResult> => {
  let start: ProbeStartResponse
  try {
    start = await api.post<ProbeStartResponse>(
      '/auth/telegram/oidc-probe/start',
      undefined,
      { auth: false },
    )
  } catch {
    return 'ERROR'
  }

  if (
    !isTelegramAuthorizationUrl(start.authorizationUrl) ||
    typeof start.probeId !== 'string' ||
    !start.probeId
  ) return 'ERROR'

  try {
    await SecureStore.setItemAsync(PROBE_ID_STORAGE_KEY, start.probeId)
  } catch {
    return 'ERROR'
  }

  let subscription: ReturnType<typeof Linking.addEventListener> | undefined
  let appStateSubscription: ReturnType<typeof AppState.addEventListener> | undefined
  let timeout: ReturnType<typeof setTimeout> | undefined
  let cancelTimer: ReturnType<typeof setTimeout> | undefined
  let leftApp = false
  let callbackHandled = false
  let settled = false
  let resolveResult: ((result: TelegramOidcProbeResult) => void) | undefined
  const callbackResult = new Promise<TelegramOidcProbeResult>((resolve) => {
    resolveResult = resolve
  })
  const finish = (result: TelegramOidcProbeResult) => {
    if (settled) return
    settled = true
    subscription?.remove()
    appStateSubscription?.remove()
    if (timeout) clearTimeout(timeout)
    if (cancelTimer) clearTimeout(cancelTimer)
    void SecureStore.deleteItemAsync(PROBE_ID_STORAGE_KEY).catch(() => undefined)
    resolveResult?.(result)
  }

  const handleCallback = (url: string) => {
    if (!isProbeCallback(url)) return
    if (cancelTimer) {
      clearTimeout(cancelTimer)
      cancelTimer = undefined
    }
    if (callbackHandled) return
    callbackHandled = true
    void getBackendResult(start.probeId)
      .then((result) => finish(result))
      .catch(() => finish('ERROR'))
  }

  subscription = Linking.addEventListener('url', ({ url }) => handleCallback(url))
  appStateSubscription = AppState.addEventListener('change', (state) => {
    if (state !== 'active') {
      leftApp = true
    } else if (leftApp && !callbackHandled) {
      cancelTimer = setTimeout(() => finish('ERROR'), 1000)
    }
  })
  timeout = setTimeout(() => finish('ERROR'), MAX_WAIT_MS)

  try {
    await Linking.openURL(start.authorizationUrl)
  } catch {
    if (!callbackHandled) finish('ERROR')
  }

  return callbackResult
}
