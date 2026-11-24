import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react'
import { TextInput, View } from 'react-native'
import type { TextInputProps, ViewStyle, TextStyle, StyleProp } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useMetrics } from '../../hooks/useMetrics'
import { useMargins } from '../../hooks/useMargins'
import { useTextStyle } from '../../hooks/useTextStyle'
import { useInteraction } from '../../hooks/useInteraction'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useControllableState } from '../../hooks/useControllableState'
import type { RadiusToken, RadiusLevel } from '../../tokens/radius'
import type { MarginProps } from '../../types/marginProps'
import type { AccentColor } from '../../tokens/colors/types'
import { FocusRing } from './FocusRing'
import { tintChildren } from './tint'
import { paintSurface } from './surface'
import { useSkeletonRadius } from '../feedback/SkeletonContext'
import type { TextInputVariant } from '../../utils/variantPalette'
import type { SpaceToken } from '../../tokens/spacing'

export type BaseTextInputSize = 1 | 2 | 3
export type BaseTextInputVariant = TextInputVariant

export interface BaseTextInputProps extends Omit<TextInputProps, 'style' | 'multiline'>, MarginProps {
  /** Input size (1–3). Default: 2. */
  size?: BaseTextInputSize
  /** Visual variant. Default: 'surface'. */
  variant?: BaseTextInputVariant
  /** Accent color (used for the focus ring and the soft variant). Default: theme accent. */
  color?: AccentColor
  /** Override the theme radius. */
  radius?: RadiusToken
  /** Disables the input. */
  disabled?: boolean
  /** Specifies the largest possible scale a font can reach. */
  maxFontSizeMultiplier?: number
  style?: StyleProp<ViewStyle>
}

export interface TextFieldSlotProps {
  /** Which side of the input. Default: the first slot goes left, a slot after it goes right. */
  side?: 'left' | 'right'
  /** Colors the slot's icons (accent-a11). Default: gray-a11 (soft: the field's accent-12). */
  color?: AccentColor
  /** Space between the slot's children. Default: 2 (size 3: 3). */
  gap?: SpaceToken
  px?: SpaceToken
  pl?: SpaceToken
  pr?: SpaceToken
  style?: StyleProp<ViewStyle>
  testID?: string
  children?: React.ReactNode
}

interface SlotContextValue {
  size: BaseTextInputSize
  variant: BaseTextInputVariant
  color: AccentColor | undefined
  side: 'left' | 'right'
  /** Focuses the input (a press on the slot that no control inside it took). */
  focus: () => void
}
const SlotContext = createContext<SlotContextValue | null>(null)

/** .rt-TextFieldSlot gap / padding-x: space-2 · space-1, space-2 · space-2, space-3 · space-3. */
const SLOT: Record<BaseTextInputSize, { gap: SpaceToken; px: SpaceToken }> = {
  1: { gap: 2, px: 1 }, 2: { gap: 2, px: 2 }, 3: { gap: 3, px: 3 },
}

/**
 * `TextField.Slot`: icons or buttons inside the field, before or after the
 * input. Icons without a `color` take the slot's; a press on the slot (outside
 * a control in it) focuses the input, like Radix.
 */
export function TextFieldSlot({ side: _side, color, gap, px, pl, pr, style, testID, children }: TextFieldSlotProps) {
  const ctx = useContext(SlotContext)
  if (!ctx) throw new Error('TextField.Slot must be used within TextField')
  const metrics = useMetrics()
  const colors = useVariantColors('textFieldSlot', { variant: ctx.variant, color: color ?? ctx.color, own: color !== undefined })
  const cfg = SLOT[ctx.size]
  const left = ctx.side === 'left'
  const slotStyle: ViewStyle = {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: metrics.space(gap ?? cfg.gap),
    paddingLeft: metrics.space(pl ?? px ?? cfg.px),
    paddingRight: metrics.space(pr ?? px ?? cfg.px),
    // Over the field's 1px border, as in Radix (margin: -border-width on the outer side)
    ...(left ? { marginLeft: -1 } : { marginRight: -1 }),
  }
  return (
    <View
      testID={testID}
      style={[slotStyle, style]}
      onStartShouldSetResponder={() => true}
      onResponderRelease={ctx.focus}
    >
      {tintChildren(children, colors.text)}
    </View>
  )
}
TextFieldSlot.displayName = 'TextField.Slot'

interface InternalProps extends BaseTextInputProps {
  /** TextField: `TextField.Slot` elements (other children are ignored). */
  children?: React.ReactNode
  /** TextArea: several lines, top-aligned, at least three lines tall. */
  multiline?: boolean
}

// ─── Size mappings (Radix tokens) ─────────────────────────────────────────────

/** TextField height: space-5, space-6, space-7. */
const SIZE_HEIGHT: Record<BaseTextInputSize, number> = { 1: 24, 2: 32, 3: 40 }
const SIZE_PADDING_X: Record<BaseTextInputSize, number> = { 1: 6, 2: 8, 3: 12 }
/** TextArea vertical padding. */
const SIZE_PADDING_Y: Record<BaseTextInputSize, number> = { 1: 4, 2: 6, 3: 8 }
const SIZE_FONT: Record<BaseTextInputSize, 1 | 2 | 3> = { 1: 1, 2: 2, 3: 3 }
const SIZE_RADIUS_LEVEL: Record<BaseTextInputSize, RadiusLevel> = { 1: 2, 2: 2, 3: 3 }

/**
 * Internal: the shared body of TextField and TextArea (a Text input).
 * Owns sizes, Variant recipe colors, focus (via useInteraction), the Text
 * style and the order consumer props merge in. Read-only (`readOnly` or
 * `editable={false}`) looks disabled, as in Radix, but is not reported as
 * disabled to screen readers.
 *
 * The native input always receives `value` (internal state when the consumer
 * passes `defaultValue` or nothing). React Native on iOS repaints only the text
 * it gets from React when the text style changes: a multiline input keeps text
 * the user typed in the old color (dark text after switching to dark mode), and
 * an uncontrolled input snaps back to `defaultValue`.
 */
export function BaseTextInput({
  multiline = false,
  size = 2,
  variant = 'surface',
  color,
  radius: radiusProp,
  disabled = false,
  maxFontSizeMultiplier,
  m, mx, my, mt, mr, mb, ml,
  style,
  onFocus,
  onBlur,
  editable,
  readOnly,
  accessibilityState,
  value: valueProp,
  defaultValue,
  onChangeText,
  children,
  ...rest
}: InternalProps) {
  const { appearance } = useThemeContext()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const { focused, handlers } = useInteraction({ enabled: !disabled, onFocus, onBlur })

  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue ?? '',
    onChange: onChangeText,
  })

  const isReadOnly = readOnly === true || editable === false
  const metrics = useMetrics({ radius: radiusProp })
  // Radix: TextField is max(radius, full); TextArea uses the plain radius.
  const borderRadius = metrics.radius(SIZE_RADIUS_LEVEL[size], multiline ? 'box' : 'pill')
  useSkeletonRadius(borderRadius)

  const colors = useVariantColors(multiline ? 'textArea' : 'textField', {
    variant,
    color,
    focused,
    disabled: disabled || isReadOnly,
  })

  // Compact text. Single-line inputs set no line height (iOS shifts the text);
  // multiline uses body line heights.
  const text = useTextStyle({
    size: SIZE_FONT[size],
    lineHeight: multiline ? 'body' : 'none',
    color: colors.text,
    compact: true,
    maxFontSizeMultiplier,
  })

  const padX = metrics.px(SIZE_PADDING_X[size])
  const containerStyle: ViewStyle = {
    ...paintSurface(colors, borderRadius).style,
    paddingHorizontal: padX,
    ...(multiline
      ? { paddingVertical: metrics.px(SIZE_PADDING_Y[size]) }
      : { minHeight: metrics.px(SIZE_HEIGHT[size]), justifyContent: 'center' }),
    ...margins,
  }

  // ─── Slots (TextField only) ─────────────────────────────────────────────
  // Radix: a slot goes left unless side="right" or it follows a slot that is not on the right
  const input = useRef<React.ComponentRef<typeof TextInput>>(null)
  const focus = useCallback(() => { if (!disabled) input.current?.focus() }, [disabled])
  const leftSlots: React.ReactNode[] = []
  const rightSlots: React.ReactNode[] = []
  if (!multiline) {
    let afterLeft = false
    React.Children.forEach(children, (child) => {
      if (!React.isValidElement<TextFieldSlotProps>(child) || child.type !== TextFieldSlot) return
      const { side } = child.props
      const right = side === 'right' || (side === undefined && afterLeft)
      if (right) rightSlots.push(child)
      else {
        leftSlots.push(child)
        afterLeft = true
      }
    })
  }
  const hasLeft = leftSlots.length > 0
  const hasRight = rightSlots.length > 0
  const hasSlots = hasLeft || hasRight
  const leftCtx = useMemo<SlotContextValue>(() => ({ size, variant, color, side: 'left', focus }), [size, variant, color, focus])
  const rightCtx = useMemo<SlotContextValue>(() => ({ ...leftCtx, side: 'right' }), [leftCtx])

  // .rt-TextFieldInput:has(~ .rt-TextFieldSlot): a row, with no padding on a side that has a slot
  const slotLayout: ViewStyle | undefined = hasSlots
    ? { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: hasLeft ? 0 : padX, paddingRight: hasRight ? 0 : padX }
    : undefined

  const inputStyle: TextStyle = {
    ...text.style,
    padding: 0,
    ...(multiline
      ? { textAlignVertical: 'top', minHeight: (text.style.lineHeight ?? 0) * 3 }
      : hasSlots ? { flex: 1, minWidth: 0 } : { width: '100%' }),
  }

  return (
    <View style={[containerStyle, slotLayout, style]}>
      {hasLeft ? <SlotContext.Provider value={leftCtx}>{leftSlots}</SlotContext.Provider> : null}
      <TextInput
        ref={input}
        {...text.textProps}
        // Radix sets color-scheme per appearance: native widgets (the iOS keyboard) follow the Theme
        keyboardAppearance={appearance}
        {...rest}
        onFocus={handlers.onFocus}
        onBlur={handlers.onBlur}
        value={value}
        onChangeText={setValue}
        multiline={multiline}
        style={inputStyle}
        placeholderTextColor={colors.placeholder}
        // React Native: a defined `readOnly` wins over `editable`, so both carry the disabled gate
        readOnly={disabled ? true : readOnly}
        editable={!disabled && editable !== false}
        accessibilityState={{ ...accessibilityState, disabled }}
      />
      {hasRight ? <SlotContext.Provider value={rightCtx}>{rightSlots}</SlotContext.Provider> : null}
      {/* 1px border + 1px inner ring = Radix 2px focus outline */}
      <FocusRing visible={focused} color={colors.border} borderRadius={Math.max(0, borderRadius - 1)} width={1} />
    </View>
  )
}
