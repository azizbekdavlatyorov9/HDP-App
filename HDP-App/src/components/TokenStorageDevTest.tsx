import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  clearTokens,
  getTokens,
  saveTokens,
  TokenStorageError,
} from '../lib/tokenStorage'

const TEST_ACCESS_TOKEN = 'hdp-dev-only-access-token'
const TEST_REFRESH_TOKEN = 'hdp-dev-only-refresh-token'

type TestResult = { ok: boolean; message: string }

const TokenStorageDevTest = () => {
  const [expanded, setExpanded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  if (!__DEV__) return null

  const runAction = async (action: () => Promise<void>, successMessage: string) => {
    setBusy(true)
    setResult(null)
    try {
      await action()
      setResult({ ok: true, message: `PASS — ${successMessage}` })
    } catch (error: unknown) {
      const message = error instanceof TokenStorageError
        ? error.message
        : 'Amalni bajarib bo‘lmadi.'
      setResult({ ok: false, message: `FAIL — ${message}` })
    } finally {
      setBusy(false)
    }
  }

  const saveTestTokens = () =>
    runAction(
      () => saveTokens(TEST_ACCESS_TOKEN, TEST_REFRESH_TOKEN),
      'development test tokenlari SecureStore’da saqlandi.',
    )

  const checkTestTokens = () =>
    runAction(async () => {
      const tokens = await getTokens()
      if (
        !tokens ||
        tokens.accessToken !== TEST_ACCESS_TOKEN ||
        tokens.refreshToken !== TEST_REFRESH_TOKEN
      ) {
        throw new TokenStorageError('read', 'Kutilgan test tokenlari topilmadi.')
      }
    }, 'test tokenlari mavjudligi tasdiqlandi (qiymatlar yashirilgan).')

  const clearTestTokens = () =>
    runAction(async () => {
      await clearTokens()
      if (await getTokens()) {
        throw new TokenStorageError('clear', 'Tokenlar tozalangandan keyin ham mavjud.')
      }
    }, 'tokenlar SecureStore’dan tozalandi.')

  return (
    <View pointerEvents="box-none" style={styles.container}>
      {expanded ? (
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title}>Secure Storage sinovi</Text>
            <Pressable accessibilityRole="button" onPress={() => setExpanded(false)}>
              <Text style={styles.close}>Yopish</Text>
            </Pressable>
          </View>
          <Text style={styles.note}>Faqat soxta development tokenlari; qiymatlar ko‘rsatilmaydi.</Text>
          <View style={styles.actions}>
            <ActionButton label="Test token saqlash" disabled={busy} onPress={saveTestTokens} />
            <ActionButton label="Mavjudligini tekshirish" disabled={busy} onPress={checkTestTokens} />
            <ActionButton label="Tokenlarni tozalash" disabled={busy} onPress={clearTestTokens} />
          </View>
          {result ? (
            <Text style={[styles.result, result.ok ? styles.success : styles.error]}>
              {result.message}
            </Text>
          ) : null}
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => setExpanded(true)}
          style={styles.launcher}
        >
          <Text style={styles.launcherText}>SecureStore sinovi</Text>
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
    bottom: 78,
    zIndex: 1001,
    alignItems: 'flex-end',
  },
  launcher: {
    borderRadius: 20,
    backgroundColor: '#31547A',
    paddingHorizontal: 16,
    paddingVertical: 11,
    elevation: 6,
  },
  launcherText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  panel: {
    width: 290,
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
  title: { color: '#233E5C', fontSize: 15, fontWeight: '700' },
  close: { color: '#52635F', fontSize: 12, padding: 4 },
  note: { color: '#52635F', fontSize: 12, lineHeight: 17, marginTop: 10 },
  actions: { gap: 8, marginTop: 12 },
  actionButton: {
    alignItems: 'center',
    borderRadius: 9,
    backgroundColor: '#31547A',
    paddingVertical: 10,
  },
  disabled: { opacity: 0.6 },
  actionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  result: { fontSize: 12, lineHeight: 18, marginTop: 12 },
  success: { color: '#167448' },
  error: { color: '#B42318' },
})

export default TokenStorageDevTest
