import { Platform } from 'react-native'
import type { TextStyle, ViewStyle } from 'react-native'
import {
  fontSize as fontSizeScale,
  lineHeight as bodyLineHeight,
  headingLineHeight,
  letterSpacingEm,
  type FontSizeToken,
} from '../tokens/typography'
import { scalingMap, type ScalingMode } from '../tokens/scaling'
import type { ThemeFonts } from '../theme/theme.types'
import { SYSTEM_MONOSPACE } from './fonts'

// ─── Vocabulary (see GLOSSARY.md) ─────────────────────────────────────────────

/** The typographic part a piece of text plays — the Radix Themes text roles. */
export type TextRole = 'default' | 'heading' | 'code' | 'strong' | 'em' | 'quote'

/** The weight a piece of text asks for, independent of the face that renders it. */
export type WeightIntent = 'light' | 'regular' | 'medium' | 'bold'

/**
 * Line-height scale.
 * - `body`    → body line heights (Text, labels, Badge, Button)
 * - `heading` → tighter heading line heights
 * - `tight`   → line height equals font size (Avatar initials)
 * - `none`    → no line height (single-line inputs, inline Code / Kbd)
 */
export type LineHeightScale = 'body' | 'heading' | 'tight' | 'none'

/** `truncate` / `wrap` values accepted by text modules. */
export type TextWrapMode = 'wrap' | 'nowrap' | 'pretty' | 'balance'

// ─── Radix role table ─────────────────────────────────────────────────────────
// Mirrors packages/radix-ui-themes/src/styles/tokens/typography.css:
//   --{role}-font-family, --{role}-font-size-adjust, --{role}-font-style,
//   --{role}-font-weight, --{role}-letter-spacing
// Font families are resolved per weight (RN loads one file per face), so the
// table names a *family slot* instead of a CSS family list.

/** RN ≥ 0.86 marks style props `readonly`; this builder fills them in place. */
type Mutable<T> = { -readonly [K in keyof T]: T[K] }

type FamilySlot = 'body' | 'heading' | 'code' | 'strong' | 'serif-em' | 'serif-quote'

interface RoleSpec {
  family: FamilySlot
  /** Radix `font-size-adjust`: multiplier on the surrounding / token size. */
  sizeAdjust: number
  /** Radix `font-style`. `undefined` = inherit. */
  fontStyle?: 'italic'
  /** Radix `font-weight`. `undefined` = inherit (or regular when standalone). */
  weight?: WeightIntent
  /** Radix `letter-spacing`, in em — added to the size's letter spacing. */
  letterSpacingEm: number
}

export const TEXT_ROLES: Record<TextRole, RoleSpec> = {
  default: { family: 'body',        sizeAdjust: 1,    letterSpacingEm: 0 },
  heading: { family: 'heading',     sizeAdjust: 1,    letterSpacingEm: 0 },
  code:    { family: 'code',        sizeAdjust: 0.95, letterSpacingEm: -0.007 },
  strong:  { family: 'strong',      sizeAdjust: 1,    letterSpacingEm: 0, weight: 'bold' },
  em:      { family: 'serif-em',    sizeAdjust: 1.18, letterSpacingEm: -0.025, fontStyle: 'italic' },
  quote:   { family: 'serif-quote', sizeAdjust: 1.18, letterSpacingEm: -0.025, fontStyle: 'italic' },
}

const WEIGHT_VALUE: Record<WeightIntent, NonNullable<TextStyle['fontWeight']>> = {
  light:   '300',
  regular: '400',
  medium:  '500',
  bold:    '700',
}

/** System serif used by Em / Quote when `fonts.em` / `fonts.quote` is not set (Radix: Times New Roman). */
export const SYSTEM_SERIF: string | undefined = Platform.select({
  ios: 'Times New Roman',
  android: 'serif',
  default: 'serif',
})

/** Default Font scaling cap for Compact text when neither the text nor the Theme sets one. */
export const COMPACT_FONT_SCALING_CAP = 2

// ─── Interface ────────────────────────────────────────────────────────────────

export interface TextStyleTheme {
  scaling: ScalingMode
  fonts: ThemeFonts
  /** Global Font scaling cap from `<Theme maxFontSizeMultiplier>`. */
  maxFontSizeMultiplier?: number
  /** The Theme's radius factor (`--radius-factor`), for radii relative to the text size. Default: 1. */
  radiusFactor?: number
}

export interface TextStyleRequest {
  /** Text role. Default: `'default'`. */
  role?: TextRole
  /**
   * Size token. When omitted: nested text inherits its parent size; standalone
   * text uses `defaultSize`.
   */
  size?: FontSizeToken
  /** Size used when `size` is omitted and the text is not nested. Default: 3. */
  defaultSize?: FontSizeToken
  /** Overrides the role's size adjustment (e.g. Kbd renders at 0.75em). */
  sizeAdjust?: number
  /** Replaces the size's and role's letter spacing, in em (tab and segmented labels). */
  letterSpacingEm?: number
  /** Weight intent. When omitted the role's weight applies, else the text inherits / stays regular. */
  weight?: WeightIntent
  /** Line-height scale. Default: `'body'`. */
  lineHeight?: LineHeightScale
  /** Already-resolved color. `undefined` → inherit (no color set). */
  color?: string
  /** Color used only when `color` is unset and the text is not nested (nested text inherits). */
  standaloneColor?: string
  /** Compact text gets a default Font scaling cap of 2. */
  compact?: boolean
  /** Font scaling cap set on the text itself. Wins over the Theme cap. */
  maxFontSizeMultiplier?: number
  truncate?: boolean
  wrap?: TextWrapMode
  /** Margins — applied only when the text is not nested. */
  margins?: ViewStyle
}

/** The surrounding radix-native text, or `null` when the text is not nested. */
export interface ParentText {
  fontSize: number
  /** Text role of the surrounding text. The same role nested in itself inherits its size unchanged. */
  role?: TextRole
}

export interface ResolvedTextStyle {
  style: TextStyle
  /** RN text props: spread onto `<Text>` / `<TextInput>` before consumer props. */
  textProps: {
    maxFontSizeMultiplier?: number
    numberOfLines?: number
    ellipsizeMode?: 'tail' | 'clip'
  }
  /** Font size nested text inherits — the value for `TextContext`. */
  contextFontSize: number
  /** Size before the role / sizeAdjust multiplier (the token or parent size). */
  baseFontSize: number
  /** Set when a weight was requested but no face is configured for it. */
  missingFace?: WeightIntent
  /** A length of `k` em (Radix `Nem`) on this text's own size, rounded to whole pixels. */
  em: (k: number) => number
  /**
   * A radius relative to this text's size, Radix `calc((offsetPx + k·em) * var(--radius-factor))`
   * with the Theme's radius factor. Not rounded, like every other radius.
   */
  radius: (k: number, offsetPx?: number) => number
}

// ─── Resolver ─────────────────────────────────────────────────────────────────

/**
 * Resolves a piece of text's Text style: size, line height, letter spacing,
 * font face, font style, Font scaling cap, wrapping and nesting rules.
 *
 * Pure — every text-rendering module goes through `useTextStyle`, which reads
 * the theme and `TextContext` and calls this.
 */
export function resolveTextStyle(
  theme: TextStyleTheme,
  request: TextStyleRequest,
  parent: ParentText | null,
): ResolvedTextStyle {
  const role = TEXT_ROLES[request.role ?? 'default']
  const isNested = parent !== null
  const factor = scalingMap[theme.scaling]
  // Radix `.rt-Code :where(.rt-Code)`, `.rt-Em :where(.rt-Em)`…: the same role
  // nested in itself inherits the size instead of applying its adjustment again.
  // An explicit size token still resolves on its own.
  const sameRole = parent !== null && request.size === undefined && parent.role === (request.role ?? 'default')
  const adjust = request.sizeAdjust ?? (sameRole ? 1 : role.sizeAdjust)

  // ─── Size ───────────────────────────────────────────────────────────────────
  // Explicit token, or standalone default → computed from the token scale.
  // Nested without a size → relative to the parent; with no adjustment RN text
  // inheritance does the work, so no size styles are set at all.
  let metrics: Mutable<Pick<TextStyle, 'fontSize' | 'lineHeight' | 'letterSpacing'>> = {}
  let resolvedSize: number | undefined
  const token = request.size ?? (isNested ? undefined : request.defaultSize ?? 3)

  if (token !== undefined) {
    resolvedSize = Math.round(fontSizeScale[token] * factor * adjust)
    metrics = {
      fontSize: resolvedSize,
      lineHeight: resolveLineHeight(request.lineHeight ?? 'body', token, factor, resolvedSize),
      letterSpacing: (request.letterSpacingEm ?? letterSpacingEm[token] + role.letterSpacingEm) * resolvedSize,
    }
  } else if (parent && adjust !== 1) {
    resolvedSize = Math.round(parent.fontSize * adjust)
    metrics = { fontSize: resolvedSize, letterSpacing: (request.letterSpacingEm ?? role.letterSpacingEm) * resolvedSize }
  }
  if (metrics.lineHeight === undefined) delete metrics.lineHeight

  // ─── Face ───────────────────────────────────────────────────────────────────
  const face = resolveFace(theme.fonts, role, request.weight, isNested)

  // ─── Style ──────────────────────────────────────────────────────────────────
  const style: Mutable<TextStyle> = { ...metrics }
  if (face.fontFamily !== undefined) style.fontFamily = face.fontFamily
  if (face.fontWeight !== undefined) style.fontWeight = face.fontWeight
  if (face.fontStyle !== undefined) style.fontStyle = face.fontStyle
  const color = request.color ?? (isNested ? undefined : request.standaloneColor)
  if (color !== undefined) style.color = color
  // Nested text is inline: layout props mean nothing there. Standalone text
  // gets CSS's flex-shrink default so it wraps inside Flex rows.
  if (!isNested) Object.assign(style, { flexShrink: 1 }, request.margins)

  // ─── Text props ─────────────────────────────────────────────────────────────
  const cap =
    request.maxFontSizeMultiplier ??
    theme.maxFontSizeMultiplier ??
    (request.compact ? COMPACT_FONT_SCALING_CAP : undefined)

  const ownSize = resolvedSize ?? parent?.fontSize ?? 0
  const radiusFactor = theme.radiusFactor ?? 1
  return {
    style,
    textProps: { maxFontSizeMultiplier: cap, ...getTextWrapProps(request.truncate, request.wrap) },
    contextFontSize: ownSize,
    em: (k) => Math.round(k * ownSize),
    radius: (k, offsetPx = 0) => (offsetPx + k * ownSize) * radiusFactor,
    baseFontSize: token !== undefined ? fontSizeScale[token] * factor : parent?.fontSize ?? 0,
    missingFace: face.missing,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveLineHeight(
  scale: LineHeightScale,
  token: FontSizeToken,
  factor: number,
  resolvedSize: number,
): number | undefined {
  switch (scale) {
    case 'body':    return Math.round(bodyLineHeight[token] * factor)
    case 'heading': return Math.round(headingLineHeight[token] * factor)
    case 'tight':   return resolvedSize
    case 'none':    return undefined
  }
}

interface Face {
  fontFamily?: string
  fontWeight?: TextStyle['fontWeight']
  fontStyle?: TextStyle['fontStyle']
  missing?: WeightIntent
}

/**
 * Picks the font face for a role + weight.
 *
 * A face from `ThemeFonts` already has its weight and style baked into the
 * font file, so neither `fontWeight` nor `fontStyle` is set alongside it
 * (combining them with a custom family makes iOS drop the family). System
 * families (monospace, serif, the platform default) keep both.
 */
function resolveFace(
  fonts: ThemeFonts,
  role: RoleSpec,
  weightProp: WeightIntent | undefined,
  isNested: boolean,
): Face {
  const weight = weightProp ?? role.weight
  const italic = role.fontStyle

  // Nested body text with nothing to change inherits its parent's face.
  if (role.family === 'body' && weight === undefined && isNested) return {}

  const custom = customFace(fonts, role.family, weight)
  if (custom) return custom

  const systemFamily =
    role.family === 'code' ? SYSTEM_MONOSPACE
    : role.family === 'serif-em' || role.family === 'serif-quote' ? SYSTEM_SERIF
    : undefined

  // Body-like roles fall back to the regular face when the weight has none.
  if (systemFamily === undefined && fonts.regular !== undefined) {
    return {
      fontFamily: fonts.regular,
      missing: weight !== undefined && weight !== 'regular' ? weight : undefined,
    }
  }

  return {
    fontFamily: systemFamily,
    fontWeight: weight !== undefined ? WEIGHT_VALUE[weight] : undefined,
    fontStyle: italic,
  }
}

function customFace(fonts: ThemeFonts, family: FamilySlot, weight: WeightIntent | undefined): Face | undefined {
  const exact = (name: string | undefined): Face | undefined =>
    name !== undefined ? { fontFamily: name } : undefined

  switch (family) {
    case 'body':
      return exact(weight ? fonts[weight] : fonts.regular)
    case 'heading':
      return exact(fonts.heading ?? (weight ? fonts[weight] : undefined))
        ?? (fonts.bold !== undefined
          ? { fontFamily: fonts.bold, missing: weight !== undefined && weight !== 'bold' ? weight : undefined }
          : undefined)
    case 'strong':
      return exact(fonts.strong ?? fonts[weight ?? 'bold'])
    case 'code':
      return exact(fonts.code)
    case 'serif-em':
      return exact(fonts.em)
    case 'serif-quote':
      return exact(fonts.quote)
  }
}

/** Maps Radix `truncate` / `wrap` props to RN `numberOfLines` / `ellipsizeMode`. */
export function getTextWrapProps(
  truncate: boolean | undefined,
  wrap: TextWrapMode | undefined,
): { numberOfLines?: number; ellipsizeMode?: 'tail' | 'clip' } {
  if (truncate) return { numberOfLines: 1, ellipsizeMode: 'tail' }
  if (wrap === 'nowrap') return { numberOfLines: 1, ellipsizeMode: 'clip' }
  return {}
}
