import { useCallback, useEffect, useRef, useState } from 'react'
import { Easing, runOnJS, useReducedMotion, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated'

// animations.css / base-dialog.css: every overlay eases with cubic-bezier(0.16, 1, 0.3, 1)
const EASE = Easing.bezier(0.16, 1, 0.3, 1)

export interface PresenceTiming {
  /** Enter duration in ms; 0 appears at once. */
  open: number
  /** Exit duration in ms; 0 disappears at once. */
  close: number
}

/**
 * Internal: Presence — an overlay stays mounted after `open` goes false until
 * its exit animation has ended (Radix `Presence`). Render while `present`;
 * give `onExited` to the `useEnterExit` whose exit is the last to end.
 */
export function usePresence(open: boolean): { present: boolean; onExited: () => void } {
  const [present, setPresent] = useState(open)
  useEffect(() => { if (open) setPresent(true) }, [open])
  const onExited = useCallback(() => setPresent(false), [])
  return { present: present || open, onExited }
}

/**
 * Internal: the 0 → 1 progress of one animated part of an overlay. It enters
 * once `open` and `ready` (an Anchored overlay waits to be placed), exits when
 * `open` goes false, and calls `onExited` when the exit has ended — at once
 * under Reduce Motion or with a 0ms timing. Reopening mid-exit enters again.
 */
export function useEnterExit({ open, ready = true, timing, onExited }: {
  open: boolean
  ready?: boolean
  timing: PresenceTiming
  onExited?: () => void
}): SharedValue<number> {
  const reducedMotion = useReducedMotion()
  const progress = useSharedValue(0)
  const exited = useRef(onExited)
  exited.current = onExited
  const notify = useCallback(() => exited.current?.(), [])
  const entered = useRef(false)
  const { open: openMs, close: closeMs } = timing

  useEffect(() => {
    if (open) {
      if (!ready) return
      entered.current = true
      progress.value = reducedMotion || !openMs ? 1 : withTiming(1, { duration: openMs, easing: EASE })
    } else if (entered.current) {
      entered.current = false
      if (reducedMotion || !closeMs) {
        progress.value = 0
        notify()
        return
      }
      progress.value = withTiming(0, { duration: closeMs, easing: EASE }, (done) => {
        if (done) runOnJS(notify)()
      })
    } else {
      // Closed before it ever entered (dismissed while still unplaced): nothing to animate
      notify()
    }
  }, [open, ready, reducedMotion, openMs, closeMs, progress, notify])

  return progress
}
