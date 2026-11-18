import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  runTelegramOidcProbe,
  resumeTelegramOidcProbeFromInitialUrl,
  type TelegramOidcProbeResult,
} from '../lib/telegramOidcProbe'

const TelegramOidcProbeDevTest = () => {
  const [expanded, setExpanded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<TelegramOidcProbeResult | null>(null)

  useEffect(() => {
    let mounted = true
    void resumeTelegramOidcProbeFromInitialUrl().then((initialResult) => {
      if (!mounted || initialResult === null) return
      setExpanded(true)
      setResult(initialResult)
    })
    return () => {
      mounted = false
    }
  }, [])

  if (!__DEV__) return null

  const run = async () => {
    setBusy(true)
    setResult(null)
    try {
      setResult(await runTelegramOidcProbe())
    } catch {
      setResult('ERROR')
    } finally {
      setBusy(false)
    }
  }

  return (
    <View pointerEvents="box-none" style={styles.container}>
      {expanded ? (
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title}>Telegram OIDC PoC</Text>
            <Pressable accessibilityRole="button" onPress={() => setExpanded(false)}>
              <Text style={styles.close}>Yopish</Text>
            </Pressable>
          </View>
          <Text style={styles.note}>Backend ID tokenni tekshiradi; qurilmaga PASS, FAIL yoki ERROR holati qaytadi.</Text>
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => void run()}
            style={[styles.actionButton, busy && styles.disabled]}
          >
            <Text style={styles.actionText}>{busy ? 'Tekshirilmoqda…' : 'PoC testini boshlash'}</Text>
          </Pressable>
          {result ? (
            <Text accessibilityRole="text" style={[styles.result, result === 'PASS' ? styles.pass : result === 'FAIL' ? styles.fail : styles.error]}>
              {result}
            </Text>
          ) : null}
        </View>
      ) : (
        <Pressable accessibilityRole="button" onPress={() => setExpanded(true)} style={styles.launcher}>
          <Text style={styles.launcherText}>Telegram OIDC PoC</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 12,
    bottom: 132,
    zIndex: 1002,
    alignItems: 'flex-end',
  },
  launcher: {
    borderRadius: 20,
    backgroundColor: '#174E42',
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
  note: { color: '#52635F', fontSize: 12, lineHeight: 17, marginTop: 10 },
  actionButton: {
    alignItems: 'center',
    borderRadius: 9,
    backgroundColor: '#174E42',
    paddingVertical: 10,
    marginTop: 12,
  },
  disabled: { opacity: 0.6 },
  actionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  result: { fontSize: 15, fontWeight: '700', textAlign: 'center', marginTop: 12 },
  pass: { color: '#167448' },
  fail: { color: '#B42318' },
  error: { color: '#996300' },
})

export default TelegramOidcProbeDevTest
