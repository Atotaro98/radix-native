import React, { createContext, useContext, useMemo } from 'react'
import { View } from 'react-native'
import type { ViewStyle } from 'react-native'
import { useMargins } from '../../hooks/useMargins'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { CardRing } from '../internal/CardRing'
import { Text, type TextProps, type TextSize } from '../typography/Text'
import type { AccentColor } from '../../tokens/colors/types'
import type { RadiusLevel } from '../../tokens/radius'
import type { SpaceToken } from '../../tokens/spacing'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'
import type { CalloutVariant } from '../../utils/variantPalette'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CalloutSize = 1 | 2 | 3
export type { CalloutVariant }

export interface CalloutRootProps extends NativeViewProps, MarginProps {
  /** Padding, gaps, radius and text size. Default: 2. */
  size?: CalloutSize
  /** Default: 'soft'. */
  variant?: CalloutVariant
  /** Accent color. Default: the Theme's accent. */
  color?: AccentColor
  /** Text and icons in accent-12 instead of accent-a11. */
  highContrast?: boolean
}

export type CalloutIconProps = NativeViewProps

export type CalloutTextProps = TextProps

// ─── Size mappings (callout.css .rt-CalloutRoot:where(.rt-r-size-N)) ───────────

interface SizeConfig {
  padding: SpaceToken
  columnGap: SpaceToken
  rowGap: SpaceToken
  radius: RadiusLevel
  /** --callout-icon-height: var(--line-height-N), unscaled px. */
  iconHeight: number
  /** mapCalloutSizeToTextSize: size 1 still uses text size 2. */
  textSize: TextSize
}

const SIZES: Record<CalloutSize, SizeConfig> = {
  1: { padding: 3, columnGap: 2, rowGap: 2, radius: 3, iconHeight: 20, textSize: 2 },
  2: { padding: 4, columnGap: 3, rowGap: 2, radius: 4, iconHeight: 20, textSize: 2 },
  3: { padding: 5, columnGap: 4, rowGap: 3, radius: 5, iconHeight: 24, textSize: 3 },
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface CalloutContextValue {
  size: CalloutSize
  /** Resolved text / icon color (accent-a11, high contrast accent-12). */
  color: string
}

const CalloutContext = createContext<CalloutContextValue | null>(null)

// ─── Parts ────────────────────────────────────────────────────────────────────

/** `.rt-CalloutIcon`: a row as tall as the first text line, icons centered in it and tinted. */
function CalloutIcon({ style, children, ...rest }: CalloutIconProps) {
  const ctx = useContext(CalloutContext)
  const metrics = useMetrics()
  const height = metrics.px(SIZES[ctx?.size ?? 2].iconHeight)
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', height }, style]} {...rest}>
      {React.Children.map(children, (child) =>
        // RN has no currentColor: icons without their own color take the callout's
        React.isValidElement<{ color?: string }>(child) && child.props.color === undefined && ctx
          ? React.cloneElement(child, { color: ctx.color })
          : child,
      )}
    </View>
  )
}
CalloutIcon.displayName = 'Callout.Icon'

/** `.rt-CalloutText`: a Text at the callout's text size, in the callout's color unless it sets its own. */
function CalloutText({ size, color, highContrast, style, ...rest }: CalloutTextProps) {
  const ctx = useContext(CalloutContext)
  const own = color !== undefined || highContrast !== undefined
  return (
    <Text
      size={size ?? SIZES[ctx?.size ?? 2].textSize}
      color={color}
      highContrast={highContrast}
      style={[!own && ctx ? { color: ctx.color } : undefined, style]}
      {...rest}
    />
  )
}
CalloutText.displayName = 'Callout.Text'

/**
 * Short message for important information, like Radix Themes `Callout`.
 * Radix lays it out as a grid with the icons in an auto-width column on the
 * left and every other child stacked on the right; RN builds the same with two
 * columns. Pass `accessibilityRole="alert"` for urgent messages (Radix `role="alert"`).
 */
function CalloutRoot({
  size = 2,
  variant = 'soft',
  color,
  highContrast,
  m, mx, my, mt, mr, mb, ml,
  style,
  children,
  ...rest
}: CalloutRootProps) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const metrics = useMetrics()
  const colors = useVariantColors('callout', { variant, color, highContrast })
  const cfg = SIZES[size]
  const borderRadius = metrics.radius(cfg.radius)
  const rowGap = metrics.space(cfg.rowGap)

  const rootStyle = useMemo<ViewStyle>(() => ({
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: metrics.space(cfg.padding),
    columnGap: metrics.space(cfg.columnGap),
    borderRadius,
    backgroundColor: colors.bg,
    ...margins,
  }), [metrics, cfg, borderRadius, colors.bg, margins])

  const ctx = useMemo(() => ({ size, color: colors.text }), [size, colors.text])

  // .rt-CalloutIcon { grid-column-start: -2 } / other children { grid-column-start: -1 }
  const items = React.Children.toArray(children)
  const icons = items.filter((c) => React.isValidElement(c) && c.type === CalloutIcon)
  const content = items.filter((c) => !(React.isValidElement(c) && c.type === CalloutIcon))

  return (
    <View style={[rootStyle, style]} {...rest}>
      <CalloutContext.Provider value={ctx}>
        {icons.length > 0 ? <View style={{ rowGap }}>{icons}</View> : null}
        <View style={{ flex: 1, rowGap }}>{content}</View>
      </CalloutContext.Provider>
      {/* inset 0 0 0 1px ring: drawn over, no layout space */}
      {colors.border ? <CardRing color={colors.border} borderRadius={borderRadius} /> : null}
    </View>
  )
}
CalloutRoot.displayName = 'Callout.Root'

export const Callout = Object.assign(CalloutRoot, {
  Root: CalloutRoot,
  Icon: CalloutIcon,
  Text: CalloutText,
})
