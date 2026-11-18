import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  ApiError,
  api,
  getRefreshRequestCountForDevTest,
  logout,
  resetRefreshRequestCountForDevTest,
  type AuthMeResponse,
} from '../lib/api'
import { getTokens } from '../lib/tokenStorage'

type TestResult = { tone: 'success' | 'error' | 'neutral'; text: string }
type TestAction = () => Promise<TestResult>

const safeErrorText = (error: unknown): string => {
  if (!(error instanceof ApiError)) return 'Amalni bajarib bo‘lmadi.'
  if (error.kind === 'network') return 'Tarmoq xatosi.'
  if (error.kind === 'configuration') return 'API konfiguratsiyasi sozlanmagan.'
  if (error.kind === 'session_expired') return 'Sessiya tugagan yoki refresh rad etilgan.'
  if (error.status !== null) return `HTTP ${error.status} javobi.`
  return 'API javobini tekshirib bo‘lmadi.'
}

const ApiClientDevTest = () => {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const baseUrlConfigured = Boolean(process.env.EXPO_PUBLIC_API_BASE_URL?.trim())

  if (!__DEV__) return null

  const runTest = async (action: TestAction) => {
    setLoading(true)
    setResult(null)
    try {
      setResult(await action())
    } catch {
      setResult({ tone: 'error', text: 'FAIL — Sinovni bajarib bo‘lmadi.' })
    } finally {
      setLoading(false)
    }
  }

  const checkTokens = async (): Promise<TestResult> => {
    try {
      const tokens = await getTokens()
      return tokens
        ? { tone: 'success', text: 'PASS — SecureStore’da access va refresh token mavjud.' }
        : { tone: 'error', text: 'FAIL — SecureStore’da token jufti topilmadi.' }
    } catch {
      return { tone: 'error', text: 'FAIL — SecureStore’ni o‘qib bo‘lmadi.' }
    }
  }

  const requestMe = async (): Promise<TestResult> => {
    try {
      await api.get<AuthMeResponse>('/auth/me')
      return { tone: 'success', text: 'PASS — GET /auth/me muvaffaqiyatli.' }
    } catch (error: unknown) {
      return { tone: 'error', text: `FAIL — GET /auth/me: ${safeErrorText(error)}` }
    }
  }

  const requestParallel = async (): Promise<TestResult> => {
    resetRefreshRequestCountForDevTest()
    const countBefore = getRefreshRequestCountForDevTest()
    const results = await Promise.allSettled([
      api.get<AuthMeResponse>('/auth/me'),
      api.get<AuthMeResponse>('/auth/me'),
      api.get<AuthMeResponse>('/auth/me'),
    ])
    const successful = results.filter((item) => item.status === 'fulfilled').length
    const refreshCount = getRefreshRequestCountForDevTest() - countBefore

    if (successful !== results.length) {
      return {
        tone: 'error',
        text: `FAIL — parallel protected so‘rovlar: ${successful}/3 muvaffaqiyatli. ${refreshCount} refresh so‘rovi.`,
      }
    }
    if (refreshCount > 1) {
      return {
        tone: 'error',
        text: `FAIL — 3 so‘rov uchun ${refreshCount} ta refresh yuborildi.`,
      }
    }
    if (refreshCount === 1) {
      return {
        tone: 'success',
        text: 'PASS — 3 protected so‘rov muvaffaqiyatli; bitta refresh yuborildi.',
      }
    }
    return {
      tone: 'neutral',
      text: '3 protected so‘rov muvaffaqiyatli; access token faol bo‘lgani uchun refresh kerak bo‘lmadi. Single-flight bu urinishda tekshirilmadi.',
    }
  }

  const logoutAndCheck = async (): Promise<TestResult> => {
    try {
      if (!(await getTokens())) {
        return { tone: 'error', text: 'FAIL — Tokenlar yo‘q; backend logout yuborilmadi.' }
      }
    } catch {
      return { tone: 'error', text: 'FAIL — Logout’dan oldin SecureStore’ni o‘qib bo‘lmadi.' }
    }

    let remoteError: string | null = null
    try {
      await logout()
    } catch (error: unknown) {
      remoteError = safeErrorText(error)
    }

    try {
      const tokens = await getTokens()
      if (tokens) {
        return { tone: 'error', text: 'FAIL — Logout’dan keyin lokal tokenlar hali mavjud.' }
      }
    } catch {
      return { tone: 'error', text: 'FAIL — Logout’dan keyin SecureStore holatini tekshirib bo‘lmadi.' }
    }

    return remoteError
      ? {
          tone: 'error',
          text: `Lokal tokenlar tozalandi, ammo backend logout so‘rovida xato: ${remoteError}`,
        }
      : { tone: 'success', text: 'PASS — Backend logout muvaffaqiyatli; lokal tokenlar tozalandi.' }
  }

  return (
    <View pointerEvents="box-none" style={styles.container}>
      {expanded ? (
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title}>API / session sinovi</Text>
            <Pressable accessibilityRole="button" onPress={() => setExpanded(false)}>
              <Text style={styles.close}>Yopish</Text>
            </Pressable>
          </View>
          <Text style={styles.config}>
            EXPO_PUBLIC_API_BASE_URL: {baseUrlConfigured ? 'sozlangan' : 'topilmadi'}
          </Text>
          <Text style={styles.description}>Natijalarda token yoki profil qiymatlari ko‘rsatilmaydi.</Text>
          <View style={styles.actions}>
            <ActionButton label="SecureStore tokenlarini tekshirish" disabled={loading} onPress={() => void runTest(checkTokens)} />
            <ActionButton label="GET /auth/me (token bilan)" disabled={loading} onPress={() => void runTest(requestMe)} />
            <ActionButton label="3 ta parallel protected request" disabled={loading} onPress={() => void runTest(requestParallel)} />
            <ActionButton label="Logout va tokenlarni tekshirish" disabled={loading} onPress={() => void runTest(logoutAndCheck)} />
          </View>
          {loading ? <Text style={styles.result}>So‘rovlar bajarilmoqda…</Text> : null}
          {result ? (
            <Text
              accessibilityRole="text"
              style={[
                styles.result,
                result.tone === 'success' && styles.success,
                result.tone === 'error' && styles.error,
              ]}
            >
              {result.text}
            </Text>
          ) : null}
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => setExpanded(true)}
          style={styles.launcher}
        >
          <Text style={styles.launcherText}>API/session sinovi</Text>
        </Pressable>
      )}
    </View>
  )
}

const ActionButton = ({
  label,
  disabled,
  onPress,
}: {
  label: string
  disabled: boolean
  onPress: () => void
}) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    style={[styles.actionButton, disabled && styles.disabled]}
  >
    <Text style={styles.actionText}>{label}</Text>
  </Pressable>
)

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 12,
    bottom: 24,
    zIndex: 1000,
    alignItems: 'flex-end',
  },
  launcher: {
    borderRadius: 20,
    backgroundColor: '#173B35',
    paddingHorizontal: 16,
    paddingVertical: 11,
    elevation: 6,
  },
  launcherText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  panel: {
    width: 310,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    elevation: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#173B35', fontSize: 15, fontWeight: '700' },
  close: { color: '#52635F', fontSize: 12, padding: 4 },
  config: { color: '#52635F', fontSize: 12, marginTop: 10 },
  description: { color: '#26332F', fontSize: 12, marginTop: 5 },
  actions: { gap: 7, marginTop: 12 },
  actionButton: {
    alignItems: 'center',
    borderRadius: 9,
    backgroundColor: '#173B35',
    paddingVertical: 9,
    paddingHorizontal: 6,
  },
  disabled: { opacity: 0.6 },
  actionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  result: { color: '#26332F', fontSize: 12, lineHeight: 18, marginTop: 12 },
  success: { color: '#167448' },
  error: { color: '#B42318' },
})

export default ApiClientDevTest
