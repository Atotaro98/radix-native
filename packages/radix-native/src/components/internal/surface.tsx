import React from 'react'
import type { ViewStyle } from 'react-native'
import type { Shadow } from '../../utils/variantPalette'
import { shadowStyle } from '../../utils/shadow'
import { ClassicOverlay } from './ClassicOverlay'
import { CardRing } from './CardRing'

/** The surface parts of a resolved Variant recipe (any recipe output carries the ones it uses). */
export interface SurfaceColors {
  bg?: string
  /** A 1px layout border. */
  border?: string
  /** A ring drawn over the content, taking no layout space (Radix inset box-shadow). */
  ring?: string
  ringWidth?: number
  shadow?: Shadow
  bevel?: true
  opacity?: number
}

export interface PaintedSurface {
  /** Background, border, radius, opacity and drop shadow, for the host's `style`. */
  style: ViewStyle
  /** Render before the content: the classic bevel. */
  under: React.ReactNode
  /** Render after the content: the ring. */
  over: React.ReactNode
}

/**
 * Internal: draws the surface parts of a resolved Variant recipe on a host view
 * — Button, Badge, Code, the Checkbox and Radio Indicators, Progress, Card,
 * Selection cards, Callout, the Select trigger, popper panels and dialogs. The
 * recipe decides which parts apply for the state; this decides how each part is
 * drawn: `bg` as the fill, `border` as a 1px layout border, `ring` as a
 * `CardRing` over the content, `shadow` through `shadowStyle`, `bevel` as a
 * `ClassicOverlay`. Components never read those keys themselves.
 */
export function paintSurface(colors: SurfaceColors, borderRadius: number): PaintedSurface {
  return {
    style: {
      borderRadius,
      backgroundColor: colors.bg,
      ...(colors.border ? { borderWidth: 1, borderColor: colors.border } : null),
      ...(colors.opacity !== undefined ? { opacity: colors.opacity } : null),
      ...shadowStyle(colors.shadow),
    },
    under: colors.bevel ? <ClassicOverlay borderRadius={borderRadius} /> : null,
    over: colors.ring ? <CardRing color={colors.ring} borderRadius={borderRadius} width={colors.ringWidth} /> : null,
  }
}
