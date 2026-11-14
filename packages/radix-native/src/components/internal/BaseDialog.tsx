import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native'
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native'
import Animated, { Easing, runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated'
import { useMetrics } from '../../hooks/useMetrics'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useVariantColors } from '../../hooks/useVariantColors'
import { paintSurface } from './surface'
import { createOverlayContext, slot, useOverlayState, type OverlayState, type OverlayStateProps, type SlotChild } from './overlayRoot'
import { PortalHost, type PortalHostHandle } from './Portal'
import { InsetContext, type InsetValues } from '../layout/InsetContext'
import { Heading, type HeadingProps } from '../typography/Heading'
import { Text, type TextProps } from '../typography/Text'
import type { RadiusLevel } from '../../tokens/radius'
import type { SpaceToken } from '../../tokens/spacing'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DialogSize = 1 | 2 | 3 | 4

export interface DialogRootProps extends OverlayStateProps {
  children?: React.ReactNode
}

/** A single element whose `onPress` opens / closes the dialog (Radix: always `asChild`). */
export interface DialogSlotProps {
  children: SlotChild
}

export interface DialogContentProps {
  /** Default: 3 (padding space-5, radius-5). */
  size?: DialogSize
  /** `start` pins the dialog near the top. Default: 'center'. */
  align?: 'start' | 'center'
  width?: DimensionValue
  minWidth?: DimensionValue
  /** Default: 600. */
  maxWidth?: DimensionValue
  height?: DimensionValue
  minHeight?: DimensionValue
  maxHeight?: DimensionValue
  /**
   * Android back button (Radix: Escape). Call `preventDefault()` to keep the
   * dialog open.
   */
  onEscapeKeyDown?: (event: { preventDefault: () => void }) => void
  style?: StyleProp<ViewStyle>
  testID?: string
  accessibilityLabel?: string
  children?: React.ReactNode
}

// ─── Size mappings (base-dialog.css .rt-BaseDialogContent:where(.rt-r-size-N)) ─

const SIZES: Record<DialogSize, { padding: SpaceToken; radius: RadiusLevel }> = {
  1: { padding: 3, radius: 4 },
  2: { padding: 4, radius: 4 },
  3: { padding: 5, radius: 5 },
  4: { padding: 6, radius: 5 },
}

// animations.css / base-dialog.css: ease cubic-bezier(0.16, 1, 0.3, 1)
const EASE = Easing.bezier(0.16, 1, 0.3, 1)
const OPEN_MS = 200
const BACKDROP_CLOSE_MS = 160
const CONTENT_CLOSE_MS = 100

// ─── Context ──────────────────────────────────────────────────────────────────


/**
 * Internal: Radix's base-dialog, shared by Dialog and AlertDialog. A Modal
 * overlay in RN's `Modal` (its own window, with its own portal host), the
 * whole layer scrolling when the content is taller than the screen, as in
 * Radix. AlertDialog ignores backdrop presses.
 */
export function createDialog({ alert, name }: { alert: boolean; name: string }) {
  const Dialog_ = createOverlayContext<OverlayState>(name)
  const useDialog = Dialog_.use

  function Root({ children, ...state }: DialogRootProps) {
    return <Dialog_.Provider value={useOverlayState(state)}>{children}</Dialog_.Provider>
  }
  Root.displayName = `${name}.Root`

  function Trigger({ children }: DialogSlotProps) {
    const ctx = useDialog('Trigger')
    return slot(children, { onPress: () => ctx.setOpen(!ctx.open) })
  }
  Trigger.displayName = `${name}.Trigger`

  function Close({ children }: DialogSlotProps) {
    const ctx = useDialog('Close')
    return slot(children, { onPress: () => ctx.setOpen(false) })
  }
  Close.displayName = `${name}.Close`

  function Content({
    size = 3,
    align = 'center',
    width, minWidth, maxWidth = 600, height, minHeight, maxHeight,
    onEscapeKeyDown,
    style,
    testID,
    accessibilityLabel,
    children,
  }: DialogContentProps) {
    const ctx = useDialog('Content')
    const metrics = useMetrics()
    const { safeAreaInsets: insets } = useThemeContext()
    const colors = useVariantColors('dialog', {})
    const reducedMotion = useReducedMotion()
    const window = useWindowDimensions()
    const cfg = SIZES[size]
    const padding = metrics.space(cfg.padding)
    const borderRadius = metrics.radius(cfg.radius)
    const panel = paintSurface(colors, borderRadius)

    // Presence: stay mounted until the exit animation ends (Radix unmountSuspended)
    const [present, setPresent] = useState(ctx.open)
    const backdrop = useSharedValue(0)
    const content = useSharedValue(0)
    const closing = useSharedValue(0)
    useEffect(() => {
      if (ctx.open) {
        setPresent(true)
        closing.value = 0
        backdrop.value = reducedMotion ? 1 : withTiming(1, { duration: OPEN_MS, easing: EASE })
        content.value = reducedMotion ? 1 : withTiming(1, { duration: OPEN_MS, easing: EASE })
      } else if (present) {
        if (reducedMotion) {
          setPresent(false)
          return
        }
        closing.value = 1
        backdrop.value = withTiming(0, { duration: BACKDROP_CLOSE_MS, easing: EASE }, (done) => {
          if (done) runOnJS(setPresent)(false)
        })
        content.value = withTiming(0, { duration: CONTENT_CLOSE_MS, easing: EASE })
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ctx.open, reducedMotion])

    const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }))
    // show: translateY(5px) scale(0.97) → identity; hide: → translateY(5px) scale(0.99)
    const contentStyle = useAnimatedStyle(() => ({
      opacity: content.value,
      transform: [
        { translateY: (1 - content.value) * 5 },
        { scale: 1 - (1 - content.value) * (closing.value ? 0.01 : 0.03) },
      ],
    }))

    const host = useRef<PortalHostHandle>(null)
    const requestClose = useCallback(() => {
      // An Anchored overlay open inside the dialog takes the back button first (top layer only)
      if (host.current?.dismissTop()) return
      let prevented = false
      onEscapeKeyDown?.({ preventDefault: () => { prevented = true } })
      if (!prevented) ctx.setOpen(false)
    }, [onEscapeKeyDown, ctx])
    const onBackdropPress = useCallback(() => {
      if (!alert) ctx.setOpen(false)
    }, [ctx])

    // Dialog content publishes its padding to an Inset inside it
    const inset = useMemo<InsetValues>(() => ({
      padding: { top: padding, right: padding, bottom: padding, left: padding },
      borderWidth: 0,
      borderRadius: 0,
    }), [padding])

    // .rt-BaseDialogScrollPadding: space-6 top, space-4 sides, max(space-6, 6vh) bottom (+ safe area)
    const scrollPadding: ViewStyle = {
      flexGrow: 1,
      justifyContent: align === 'start' ? 'flex-start' : 'center',
      alignItems: 'center',
      paddingTop: metrics.space(6) + insets.top,
      paddingBottom: Math.max(metrics.space(6), window.height * 0.06) + insets.bottom,
      paddingLeft: metrics.space(4) + insets.left,
      paddingRight: metrics.space(4) + insets.right,
    }

    return (
      <Modal
        visible={present}
        transparent
        animationType="none"
        // Draw under both system bars (edge-to-edge apps), so the overlay covers them as on the web
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={requestClose}
      >
        <PortalHost ref={host}>
          {/* ::before backdrop, --color-overlay */}
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }, backdropStyle]} />
          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            {/* .rt-BaseDialogScroll: the whole layer scrolls when the dialog is taller than the screen */}
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
              <Pressable testID={testID ? `${testID}-backdrop` : undefined} style={scrollPadding} onPress={onBackdropPress} accessible={false}>
                <Animated.View
                  testID={testID}
                  accessibilityViewIsModal
                  accessibilityRole={alert ? 'alert' : undefined}
                  accessibilityLabel={accessibilityLabel}
                  // Presses inside the content never reach the backdrop
                  onStartShouldSetResponder={() => true}
                  style={[
                    {
                      width: width ?? '100%',
                      minWidth,
                      maxWidth,
                      height,
                      minHeight,
                      maxHeight,
                      padding,
                      overflow: height !== undefined || maxHeight !== undefined ? 'hidden' : undefined,
                    },
                    panel.style,
                    contentStyle,
                    style,
                  ]}
                >
                  <InsetContext.Provider value={inset}>
                    {height !== undefined || maxHeight !== undefined
                      // overflow: auto — scrolls inside only when the height is capped
                      ? <ScrollView style={{ margin: -padding }} contentContainerStyle={{ padding }}>{children}</ScrollView>
                      : children}
                  </InsetContext.Provider>
                  {panel.over}
                </Animated.View>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        </PortalHost>
      </Modal>
    )
  }
  Content.displayName = `${name}.Content`

  /** Heading size 5, margin-bottom space-3, leading trimmed above the first line (Radix `trim="start"`). */
  function Title({ size = 5, mb = 3, style, ...rest }: HeadingProps) {
    useDialog('Title')
    const metrics = useMetrics()
    // trim start: 0.42em − line-height / 2 (size 5: 20px / 26px), scaled
    const trim = (0.42 * 20 - 26 / 2) * metrics.scaling
    return <Heading size={size} mb={mb} style={[size === 5 ? { marginTop: trim } : undefined, style]} {...rest} />
  }
  Title.displayName = `${name}.Title`

  /** Text size 3. */
  function Description({ size = 3, ...rest }: TextProps) {
    useDialog('Description')
    return <Text size={size} {...rest} />
  }
  Description.displayName = `${name}.Description`

  return { Root, Trigger, Close, Content, Title, Description, useDialog }
}
