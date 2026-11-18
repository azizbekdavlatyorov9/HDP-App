import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  AppState,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Path } from 'react-native-svg'
import WebView, { type WebViewMessageEvent } from 'react-native-webview'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useApp } from '../store/useStore'
import { saveTokens } from '../lib/tokenStorage'
import {
  createTelegramLoginChallenge,
  exchangeTelegramIdToken,
  getTelegramOidcPageUrl,
  isTrustedTelegramOidcUrl,
  TELEGRAM_OIDC_ORIGIN,
} from '../lib/telegramOidc'
import { triggerHaptic } from '../lib/haptics'
import { checkTelegramLogin, startTelegramLogin } from '../lib/telegramAuth'
import { ABS_FILL, C, R } from '../theme/tokens'

export const TelegramMark = ({ size = 22 }: { size?: number }) => (
  <Svg viewBox="0 0 24 24" width={size} height={size}>
    <Path
      fill="#229ED9"
      d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.5.5 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.259-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.324-.437.891-.662 3.483-1.517 5.806-2.518 6.967-3.003 3.32-1.381 4.011-1.621 4.46-1.628z"
    />
  </Svg>
)

type Props = {
  visible: boolean
  onClose: () => void
  onDone: () => void
}

type Mode = 'oidc' | 'legacy'
type OidcPhase = 'starting' | 'ready' | 'verifying' | 'error'
type LegacyPhase = 'starting' | 'waiting' | 'error'

const POLL_MS = 1500
const MAX_WAIT_MS = 10 * 60 * 1000

const isIdTokenMessage = (value: unknown): value is { type: string; idToken: string } => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  const keys = Object.keys(record)
  if (
    keys.length !== 2 ||
    !keys.includes('type') ||
    !keys.includes('idToken') ||
    record.type !== 'TELEGRAM_OIDC_ID_TOKEN' ||
    typeof record.idToken !== 'string' ||
    record.idToken.length > 10_000
  ) return false

  const jwtParts = record.idToken.split('.')
  return jwtParts.length === 3 && jwtParts.every((part) => part.length > 0)
}

const TelegramAuthSheet = ({ visible, onClose, onDone }: Props) => {
  const insets = useSafeAreaInsets()
  const signInWithTelegram = useApp((s) => s.signInWithTelegram)
  const webViewRef = useRef<WebView<Record<never, never>>>(null)
  const challengeRef = useRef<{ nonce: string; expiresAt: string } | null>(null)
  const consumedMessage = useRef(false)
  const alive = useRef(true)
  const recheck = useRef<() => void>(() => {})

  const [mode, setMode] = useState<Mode>('oidc')
  const [oidcPhase, setOidcPhase] = useState<OidcPhase>('starting')
  const [oidcPageUrl, setOidcPageUrl] = useState<string | null>(null)
  const [oidcError, setOidcError] = useState<string | null>(null)

  const [legacyPhase, setLegacyPhase] = useState<LegacyPhase>('starting')
  const [legacyDetail, setLegacyDetail] = useState<string | null>(null)
  const [legacyNonce, setLegacyNonce] = useState<string | null>(null)
  const [legacyUrl, setLegacyUrl] = useState<string | null>(null)

  const beginOidc = useCallback(async () => {
    alive.current = true
    consumedMessage.current = false
    challengeRef.current = null
    setOidcPageUrl(null)
    setOidcError(null)
    setOidcPhase('starting')

    if (Platform.OS !== 'android') {
      setOidcPhase('error')
      setOidcError('Telegram OIDC WebView hozircha faqat Android uchun sozlangan.')
      return
    }

    try {
      const pageUrl = getTelegramOidcPageUrl()
      const challenge = await createTelegramLoginChallenge()
      if (!alive.current) return
      challengeRef.current = challenge
      setOidcPageUrl(pageUrl)
      setOidcPhase('ready')
    } catch {
      if (!alive.current) return
      setOidcPhase('error')
      setOidcError('Telegram login boshlanmadi. Server manzili va tarmoqni tekshirib qayta urinib ko‘ring.')
    }
  }, [])

  const openBot = useCallback(async (link: string, startNonce?: string) => {
    const targets = startNonce
      ? [`tg://resolve?domain=hdpappbot&start=${startNonce}`, link]
      : [link]

    for (const target of targets) {
      try {
        await Linking.openURL(target)
        return
      } catch {
        // Next compatible Telegram URL is attempted.
      }
    }

    if (!alive.current) return
    setLegacyPhase('error')
    setLegacyDetail("Telegram ochilmadi. Play Store'dan Telegram o'rnatib, qayta urinib ko'ring.")
  }, [])

  const beginLegacy = useCallback(async () => {
    alive.current = true
    setLegacyPhase('starting')
    setLegacyDetail(null)
    setLegacyNonce(null)
    setLegacyUrl(null)
    try {
      const start = await startTelegramLogin()
      if (!alive.current) return
      setLegacyUrl(start.url)
      setLegacyNonce(start.nonce)
      setLegacyPhase('waiting')
      setTimeout(() => { void openBot(start.url, start.nonce) }, 450)
    } catch {
      if (!alive.current) return
      setLegacyPhase('error')
      setLegacyDetail("Serverga ulanib bo'lmadi. Internetni tekshirib qayta urinib ko'ring.")
    }
  }, [openBot])

  useEffect(() => {
    if (!visible) {
      alive.current = false
      return undefined
    }
    if (mode === 'oidc') void beginOidc()
    else void beginLegacy()
    return () => { alive.current = false }
  }, [visible, mode, beginOidc, beginLegacy])

  useEffect(() => {
    if (!visible || mode !== 'legacy' || legacyPhase !== 'waiting' || !legacyNonce) return undefined
    let stop = false
    let finished = false
    let timer: ReturnType<typeof setTimeout> | null = null
    const started = Date.now()

    const tick = async () => {
      if (stop || finished) return
      try {
        const result = await checkTelegramLogin(legacyNonce)
        if (stop || finished) return
        if (result.status === 'ready') {
          finished = true
          signInWithTelegram(result.user.name, result.user.username, result.user.id)
          onClose()
          onDone()
          return
        }
        if (result.status === 'expired' || result.status === 'invalid') {
          finished = true
          setLegacyPhase('error')
          setLegacyDetail("Tasdiqlash muddati tugadi. Qaytadan urinib ko'ring.")
          return
        }
      } catch {
        // Continue polling after temporary relay/network errors.
      }
      if (stop || finished) return
      if (Date.now() - started > MAX_WAIT_MS) {
        finished = true
        setLegacyPhase('error')
        setLegacyDetail("Tasdiq kutilmadi. «Qaytadan urinish»ni bosing.")
        return
      }
      timer = setTimeout(tick, POLL_MS)
    }

    recheck.current = () => {
      if (stop || finished) return
      if (timer) clearTimeout(timer)
      void tick()
    }
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') recheck.current()
    })
    timer = setTimeout(tick, 500)

    return () => {
      stop = true
      sub.remove()
      recheck.current = () => {}
      if (timer) clearTimeout(timer)
    }
  }, [visible, mode, legacyPhase, legacyNonce, onClose, onDone, signInWithTelegram])

  const injectNonce = useCallback(() => {
    const nonce = challengeRef.current?.nonce
    if (!nonce || !webViewRef.current) return
    const message = JSON.stringify({ type: 'HDP_TELEGRAM_SET_NONCE', nonce })
    const script = `window.postMessage(${JSON.stringify(message)}, ${JSON.stringify(TELEGRAM_OIDC_ORIGIN)}); true;`
    webViewRef.current.injectJavaScript(script)
  }, [])

  const handleOidcMessage = useCallback(async (event: WebViewMessageEvent) => {
    if (!alive.current || consumedMessage.current) return
    if (!isTrustedTelegramOidcUrl(event.nativeEvent.url)) return

    let message: unknown
    try {
      message = JSON.parse(event.nativeEvent.data) as unknown
    } catch {
      return
    }
    if (!isIdTokenMessage(message)) return

    const challenge = challengeRef.current
    if (!challenge || Date.parse(challenge.expiresAt) <= Date.now()) {
      setOidcPhase('error')
      setOidcError('Telegram challenge muddati tugagan. Qaytadan urinib ko‘ring.')
      return
    }

    consumedMessage.current = true
    setOidcPhase('verifying')
    try {
      const session = await exchangeTelegramIdToken(message.idToken)
      if (!alive.current) return
      await saveTokens(session.accessToken, session.refreshToken)
      if (!alive.current) return
      signInWithTelegram(session.user.displayName, session.user.displayName, null, true)
      triggerHaptic('success')
      onClose()
      onDone()
    } catch {
      if (!alive.current) return
      setOidcPhase('error')
      setOidcError('Telegram token backend tomonidan tasdiqlanmadi yoki sessiya saqlanmadi.')
    }
  }, [onClose, onDone, signInWithTelegram])

  const pageAllowed = useCallback((url: string) => isTrustedTelegramOidcUrl(url), [])
  const legacyWaiting = legacyPhase === 'waiting'

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={ABS_FILL} onPress={onClose} accessibilityLabel="Yopish" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }, mode === 'oidc' && styles.oidcSheet]}>
          <View style={styles.grip} />
          <View style={styles.head}>
            <View style={styles.logoTile}><TelegramMark size={26} /></View>
            <View style={styles.headText}><Text style={styles.title}>Telegram bilan kirish</Text></View>
          </View>

          {mode === 'oidc' ? (
            <>
              <View style={[styles.statusCard, oidcPhase === 'error' && styles.statusCardBad]}>
                {oidcPhase === 'starting' || oidcPhase === 'verifying' ? (
                  <>
                    <ActivityIndicator size="small" color={C.brand} />
                    <Text style={styles.statusTitle}>
                      {oidcPhase === 'starting' ? 'Xavfsiz Telegram challenge olinmoqda…' : 'Backend Telegram tokenini tekshirmoqda…'}
                    </Text>
                  </>
                ) : oidcPhase === 'error' ? (
                  <View style={styles.statusMid}>
                    <Text style={[styles.statusTitle, { color: '#B5403A' }]}>Kirish yakunlanmadi</Text>
                    <Text style={styles.statusSub}>{oidcError}</Text>
                  </View>
                ) : (
                  <Text style={styles.statusTitle}>Telegram OIDC — ID token backendda tekshiriladi.</Text>
                )}
              </View>

              {oidcPhase === 'ready' && oidcPageUrl ? (
                <View style={styles.webViewFrame}>
                  <WebView<Record<never, never>>
                    ref={webViewRef}
                    source={{ uri: oidcPageUrl }}
                    originWhitelist={[TELEGRAM_OIDC_ORIGIN]}
                    javaScriptEnabled
                    javaScriptCanOpenWindowsAutomatically
                    setSupportMultipleWindows
                    thirdPartyCookiesEnabled
                    mixedContentMode="never"
                    onLoadEnd={injectNonce}
                    onMessage={(event) => { void handleOidcMessage(event) }}
                    onShouldStartLoadWithRequest={(request) => pageAllowed(request.url)}
                    onError={() => {
                      setOidcPhase('error')
                      setOidcError('Telegram login sahifasi yuklanmadi. Tarmoqni tekshiring.')
                    }}
                    style={styles.webView}
                  />
                </View>
              ) : null}
              <Pressable
                onPress={() => { setMode('legacy'); triggerHaptic('light') }}
                style={({ pressed }) => [styles.legacyLink, pressed && { opacity: 0.6 }]}
              >
                <Text style={styles.legacyLinkText}>Muqobil eski Telegram usulidan foydalanish</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={[styles.statusCard, legacyPhase === 'error' && styles.statusCardBad]}>
                {legacyPhase === 'starting' ? (
                  <><ActivityIndicator size="small" color={C.brand} /><Text style={styles.statusTitle}>Telegram ochilmoqda...</Text></>
                ) : legacyWaiting ? (
                  <>
                    <ActivityIndicator size="small" color="#229ED9" />
                    <View style={styles.statusMid}>
                      <Text style={styles.statusTitle}>Tasdiqlash kutilmoqda</Text>
                      <Text style={styles.statusSub}>Telegram'da «Start» tugmasini bosing</Text>
                      <Pressable onPress={() => recheck.current()} hitSlop={8} style={styles.checkNow}>
                        <Text style={styles.checkNowText}>Tasdiqladim — tekshirish</Text>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <View style={styles.statusMid}>
                    <Text style={[styles.statusTitle, { color: '#B5403A' }]}>Kirish yakunlanmadi</Text>
                    <Text style={styles.statusSub}>{legacyDetail}</Text>
                  </View>
                )}
              </View>
              <View style={styles.steps}>
                {[
                  { n: '1', title: 'Telegram ochiladi', sub: '@hdpappbot bilan suhbat' },
                  { n: '2', title: '«Start» tugmasini bosing', sub: 'Bir marta bosish yetarli' },
                  { n: '3', title: 'Ilovaga qayting', sub: 'Kirish avtomatik yakunlanadi' },
                ].map((step) => (
                  <View key={step.n} style={styles.stepRow}>
                    <View style={styles.stepN}><Text style={styles.stepNText}>{step.n}</Text></View>
                    <View style={styles.stepMid}><Text style={styles.stepTitle}>{step.title}</Text><Text style={styles.stepSub}>{step.sub}</Text></View>
                  </View>
                ))}
              </View>
              <Pressable onPress={() => setMode('oidc')} style={styles.legacyLink}>
                <Text style={styles.legacyLinkText}>Telegram OIDC usuliga qaytish</Text>
              </Pressable>
            </>
          )}

          <View style={styles.btns}>
            <Pressable onPress={onClose} style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.85 }]}>
              <Text style={styles.cancelText}>Bekor</Text>
            </Pressable>
            {mode === 'oidc' ? (
              <Pressable
                disabled={oidcPhase === 'starting' || oidcPhase === 'verifying'}
                onPress={() => { triggerHaptic('light'); void beginOidc() }}
                style={({ pressed }) => [styles.ok, pressed && { opacity: 0.85 }]}
              >
                <LinearGradient colors={['#2AABEE', '#229ED9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={ABS_FILL} />
                <TelegramMark size={18} />
                <Text style={styles.okText}>{oidcPhase === 'error' ? 'Qaytadan urinish' : 'Challenge yangilash'}</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => {
                  triggerHaptic('medium')
                  if (legacyPhase === 'error' || !legacyUrl) { void beginLegacy(); return }
                  void openBot(legacyUrl, legacyNonce ?? undefined)
                }}
                style={({ pressed }) => [styles.ok, pressed && { opacity: 0.85 }]}
              >
                <LinearGradient colors={['#2AABEE', '#229ED9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={ABS_FILL} />
                <TelegramMark size={18} />
                <Text style={styles.okText}>{legacyPhase === 'error' ? 'Qaytadan urinish' : 'Telegramni ochish'}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(14,26,18,0.55)' },
  sheet: {
    width: '100%', maxWidth: 430, alignSelf: 'center', backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12,
  },
  oidcSheet: { maxHeight: '94%' },
  grip: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#E1E7DA', alignSelf: 'center', marginBottom: 16 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoTile: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF6FD', borderWidth: 1, borderColor: '#CBE8F8' },
  headText: { flex: 1, minWidth: 0 },
  title: { fontSize: 18, lineHeight: 23, fontWeight: '600', color: C.ink },
  statusCard: { marginTop: 16, minHeight: 64, paddingHorizontal: 14, paddingVertical: 12, borderRadius: R.md, backgroundColor: '#EDF8FD', borderWidth: 1, borderColor: '#CFEAF7', flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusCardBad: { backgroundColor: '#FBEEEC', borderColor: '#F2D3CE' },
  statusMid: { flex: 1, minWidth: 0 },
  statusTitle: { fontSize: 13.5, lineHeight: 18, fontWeight: '600', color: C.ink },
  statusSub: { marginTop: 2, fontSize: 12, lineHeight: 17, fontWeight: '500', color: C.ink3 },
  webViewFrame: { height: 360, marginTop: 12, overflow: 'hidden', borderRadius: R.md, borderWidth: 1, borderColor: '#DDE8E0' },
  webView: { flex: 1, backgroundColor: '#FFFFFF' },
  legacyLink: { alignSelf: 'center', paddingVertical: 10 },
  legacyLinkText: { color: '#587064', fontSize: 12, fontWeight: '600', textDecorationLine: 'underline' },
  checkNow: { marginTop: 6, alignSelf: 'flex-start' },
  checkNowText: { fontSize: 12, lineHeight: 16, fontWeight: '600', color: '#1B87BE' },
  steps: { marginTop: 16, gap: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepN: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: C.leafTint, borderWidth: 1, borderColor: '#DDEBD6' },
  stepNText: { fontSize: 11.5, fontWeight: '600', color: C.brand },
  stepMid: { flex: 1, minWidth: 0 },
  stepTitle: { fontSize: 13.5, lineHeight: 18, fontWeight: '600', color: C.ink2 },
  stepSub: { marginTop: 1, fontSize: 11.5, lineHeight: 16, fontWeight: '500', color: C.ink4 },
  btns: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  cancel: { width: 92, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: R.full, backgroundColor: '#F1F4F0' },
  cancelText: { fontSize: 13, fontWeight: '600', color: C.ink3 },
  ok: { flex: 1, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: R.full, overflow: 'hidden' },
  okText: { fontSize: 13.5, fontWeight: '600', color: '#FFFFFF' },
})

export default TelegramAuthSheet
