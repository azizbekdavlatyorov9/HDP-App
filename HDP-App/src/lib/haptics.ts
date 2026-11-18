import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

/**
 * Web versiyasida tebranishni Telegram SDK beradi. Ilovada uning o'rne
 * `expo-haptics` — shu sabi `triggerHaptic` nomi saqlanib qoldi, sahifalar
 * bir xil kod bilan yozilaveradi.
 */
export type HapticKind =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error'

const runHapticSafely = (action: () => Promise<void>): void => {
  try {
    void action().catch(() => undefined)
  } catch {
    // Haptics are optional feedback; failures must never interrupt the UI action.
  }
}

const androidTypeFor = (type: HapticKind): Haptics.AndroidHaptics => {
  if (type === 'selection') return Haptics.AndroidHaptics.Segment_Tick
  if (type === 'success') return Haptics.AndroidHaptics.Confirm
  if (type === 'warning' || type === 'error') return Haptics.AndroidHaptics.Reject
  if (type === 'heavy') return Haptics.AndroidHaptics.Long_Press
  if (type === 'medium') return Haptics.AndroidHaptics.Context_Click
  return Haptics.AndroidHaptics.Keyboard_Tap
}

export const triggerHaptic = (type: HapticKind = 'light'): void => {
  if (Platform.OS === 'android') {
    const androidHaptics = Haptics as typeof Haptics & {
      performAndroidHapticsAsync?: (kind: Haptics.AndroidHaptics) => Promise<void>
    }
    if (typeof androidHaptics.performAndroidHapticsAsync !== 'function') return
    runHapticSafely(() => androidHaptics.performAndroidHapticsAsync!(androidTypeFor(type)))
    return
  }

  if (type === 'selection') {
    runHapticSafely(() => Haptics.selectionAsync())
    return
  }
  if (type === 'success') {
    runHapticSafely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success))
    return
  }
  if (type === 'warning' || type === 'error') {
    runHapticSafely(() =>
      Haptics.notificationAsync(
        type === 'error'
          ? Haptics.NotificationFeedbackType.Error
          : Haptics.NotificationFeedbackType.Warning,
      ),
    )
    return
  }
  const style =
    type === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy
    : type === 'medium' ? Haptics.ImpactFeedbackStyle.Medium
    : Haptics.ImpactFeedbackStyle.Light
  runHapticSafely(() => Haptics.impactAsync(style))
}
