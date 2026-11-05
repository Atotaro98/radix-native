import type { DimensionValue } from 'react-native'
import type { SpaceToken } from '../tokens/spacing'
import type { ThemeColor, RadiusToken } from '../theme/theme.types'
import type { MarginProps } from './marginProps'

/** Padding props. Each side reads its own token, then its axis, then `p`. */
export interface PaddingProps {
  p?: SpaceToken
  px?: SpaceToken
  py?: SpaceToken
  pt?: SpaceToken
  pr?: SpaceToken
  pb?: SpaceToken
  pl?: SpaceToken
}

/** Gap props of Flex and Grid (`gapX` / `gapY` override `gap`). */
export interface GapProps {
  /** Space token applied to both row and column gaps. */
  gap?: SpaceToken
  /** Space token for column (horizontal) gaps only. Overrides `gap`. */
  gapX?: SpaceToken
  /** Space token for row (vertical) gaps only. Overrides `gap`. */
  gapY?: SpaceToken
}

/**
 * Layout props shared by Box, Flex and Grid.
 * Equivalent to Radix web's layout prop defs (padding, size, position,
 * flex child) plus margins, with RN-only `bg` and `radius`.
 */
export interface LayoutProps extends MarginProps, PaddingProps {
  // ─── Size ─────────────────────────────────────────────────────────
  width?: DimensionValue
  minWidth?: DimensionValue
  maxWidth?: DimensionValue
  height?: DimensionValue
  minHeight?: DimensionValue
  maxHeight?: DimensionValue
  // ─── Position ─────────────────────────────────────────────────────
  position?: 'relative' | 'absolute'
  top?: DimensionValue
  right?: DimensionValue
  bottom?: DimensionValue
  left?: DimensionValue
  // ─── Layout ───────────────────────────────────────────────────────
  overflow?: 'hidden' | 'visible' | 'scroll'
  flexBasis?: DimensionValue
  flexShrink?: number
  flexGrow?: number
  // ─── RN-only theme props ──────────────────────────────────────────
  /** Background color from the theme token system. */
  bg?: ThemeColor
  /** Border radius using the theme radius token (level 4 — card-sized; `'full'` is a pill). */
  radius?: RadiusToken
}
