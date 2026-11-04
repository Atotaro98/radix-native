import type { ColorName, ColorStep, ResolveColorFn } from '../hooks/useResolveColor'
import { compositeLayers, fadeColor } from './colorMath'

/**
 * Variant recipes — how each Variant family turns a Variant and state into the
 * colors of its parts, taken from Radix Themes CSS (see GLOSSARY.md).
 *
 * Recipes return *paints* (token descriptions), not colors, so they can be
 * tested against Radix's CSS without a theme. `resolveVariantColors` turns
 * paints into colors for the active appearance, accent and overrides.
 *
 * Change colors here only. Each recipe cites the Radix selectors it mirrors.
 */

// ─── Paints ───────────────────────────────────────────────────────────────────

/** `color` = the component's `color` prop (the theme accent when unset). */
type PaintScale = 'color' | 'gray'

export type Paint =
  | { readonly scale: PaintScale; readonly step: ColorStep }
  | { readonly raw: string }
  /** Layers listed top-most first, flattened into one color. */
  | { readonly layers: readonly Paint[] }
  | { readonly fade: Paint; readonly opacity: number }
  | { readonly light: Paint; readonly dark: Paint }

export const c = (step: ColorStep): Paint => ({ scale: 'color', step })
export const g = (step: ColorStep): Paint => ({ scale: 'gray', step })
export const raw = (value: string): Paint => ({ raw: value })
export const layers = (...stack: Paint[]): Paint => ({ layers: stack })
export const fade = (paint: Paint, opacity: number): Paint => ({ fade: paint, opacity })
export const byMode = (light: Paint, dark: Paint): Paint => ({ light, dark })

export const TRANSPARENT = raw('transparent')
export const WHITE = raw('#ffffff')

/** Radix `--black-a*` / `--white-a*` (same in both appearances). */
const OVERLAY_ALPHA = [0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95] as const
type OverlayStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export const blackA = (step: OverlayStep): Paint => raw(`rgba(0, 0, 0, ${OVERLAY_ALPHA[step]})`)
export const whiteA = (step: OverlayStep): Paint => raw(`rgba(255, 255, 255, ${OVERLAY_ALPHA[step]})`)

/**
 * The ring of Radix `--shadow-1` (classic variants, sunken parts):
 * `inset 0 0 0 1px gray-a5` in light mode, gray-a3 over gray-a4 in dark mode.
 */
export const SHADOW_1_RING = byMode(g('a5'), layers(g('a3'), g('a4')))

// ─── State ────────────────────────────────────────────────────────────────────

export interface PaletteState {
  appearance: 'light' | 'dark'
  highContrast?: boolean
  /** Whether the consumer set `color` (Radix `data-accent-color`). */
  hasColor?: boolean
  checked?: boolean
  disabled?: boolean
  pressed?: boolean
  focused?: boolean
}

interface WithVariant<V extends string> extends PaletteState {
  variant: V
}

// ─── Family: buttons (Button, IconButton) — base-button.css ───────────────────

export type ButtonVariant = 'classic' | 'solid' | 'soft' | 'surface' | 'outline' | 'ghost'

export interface ButtonPaints {
  bg: Paint
  text: Paint
  border?: Paint
  pressedBg: Paint
  /** Extra press feedback when the pressed bg cannot change (high-contrast solid). */
  pressedOpacity?: number
}

function button(s: WithVariant<ButtonVariant>): ButtonPaints {
  const hc = !!s.highContrast
  if (s.disabled) {
    // .rt-BaseButton[data-disabled]
    const text = g('a8')
    switch (s.variant) {
      case 'classic': return { bg: g(2), text, pressedBg: g(2) }
      case 'solid':
      case 'soft': return { bg: g('a3'), text, pressedBg: g('a3') }
      case 'surface': return { bg: g('a2'), text, border: g('a6'), pressedBg: g('a2') }
      case 'outline': return { bg: TRANSPARENT, text, border: g('a7'), pressedBg: TRANSPARENT }
      case 'ghost': return { bg: TRANSPARENT, text, pressedBg: TRANSPARENT }
    }
  }
  const coloredText = hc ? c(12) : c('a11')
  switch (s.variant) {
    case 'classic':
    case 'solid':
      return {
        bg: hc ? c(12) : c(9),
        // base-button is the only family whose high-contrast solid text is gray-1
        text: hc ? g(1) : c('contrast'),
        // solid :active ≈ hover step 10; classic :active stays accent-9 (pressed in)
        pressedBg: hc ? c(12) : s.variant === 'classic' ? c(9) : c(10),
        // accent-12 has no darker step: fall back to opacity for press feedback
        pressedOpacity: hc ? 0.88 : undefined,
      }
    case 'soft':
      return { bg: c('a3'), text: coloredText, pressedBg: c('a5') }
    case 'surface':
      return { bg: c('surface'), text: coloredText, border: c('a7'), pressedBg: c('a3') }
    case 'outline':
      // Radix high contrast: double inset ring accent-a7 + gray-a11 → one border
      return { bg: TRANSPARENT, text: coloredText, border: hc ? g('a11') : c('a8'), pressedBg: c('a3') }
    case 'ghost':
      return { bg: TRANSPARENT, text: coloredText, pressedBg: c('a4') }
  }
}

// ─── Family: chips (Badge, Avatar, Code) — badge.css, avatar.css, code.css ────

export type BadgeVariant = 'solid' | 'soft' | 'surface' | 'outline'
export type AvatarVariant = 'solid' | 'soft'
export type CodeVariant = 'solid' | 'soft' | 'outline' | 'ghost'

export interface ChipPaints {
  bg?: Paint
  /** `undefined` = inherit the surrounding text color. */
  text?: Paint
  border?: Paint
}

function chip(s: WithVariant<BadgeVariant | CodeVariant>): ChipPaints {
  const hc = !!s.highContrast
  const coloredText = hc ? c(12) : c('a11')
  switch (s.variant) {
    case 'solid':
      return { bg: hc ? c(12) : c(9), text: hc ? c(1) : c('contrast') }
    case 'soft':
      return { bg: c('a3'), text: coloredText }
    case 'surface':
      return { bg: c('surface'), text: coloredText, border: c('a6') }
    case 'outline':
      // high contrast: double inset ring accent-a7 + gray-a11 → one border (like buttons)
      return { bg: TRANSPARENT, text: coloredText, border: hc ? g('a11') : c('a8') }
    case 'ghost':
      // code.tsx sets data-accent-color on ghost only when `color` is passed;
      // without it the text inherits (code.css .rt-variant-ghost[data-accent-color])
      return { text: s.hasColor ? coloredText : undefined }
  }
}

const badge = (s: WithVariant<BadgeVariant>): ChipPaints => chip(s)
const avatar = (s: WithVariant<AvatarVariant>): ChipPaints => chip(s)
const code = (s: WithVariant<CodeVariant>): ChipPaints => {
  const paints = chip(s)
  return s.variant === 'outline' ? { ...paints, bg: undefined } : paints
}

// ─── Family: selection controls (Checkbox, Radio) — base-checkbox/radio.css ───

export type SelectionVariant = 'classic' | 'surface' | 'soft'

export interface SelectionPaints {
  bg: Paint
  border?: Paint
  /** Check mark / dot. Undefined when unchecked. */
  indicator?: Paint
}

function checkbox(s: WithVariant<SelectionVariant>): SelectionPaints {
  const hc = !!s.highContrast
  if (s.disabled) {
    const indicator = s.checked ? g('a8') : undefined
    return s.variant === 'soft'
      ? { bg: g('a3'), indicator }
      : { bg: g('a3'), border: g('a6'), indicator }
  }
  if (s.variant === 'soft') {
    return { bg: c('a5'), indicator: s.checked ? (hc ? c(12) : c('a11')) : undefined }
  }
  if (s.checked) {
    return { bg: hc ? c(12) : c(9), indicator: hc ? c(1) : c('contrast') }
  }
  return { bg: g('surface'), border: s.variant === 'classic' ? g('a3') : g('a7') }
}

function radio(s: WithVariant<SelectionVariant>): SelectionPaints {
  const hc = !!s.highContrast
  if (s.disabled) {
    return { bg: g('a3'), border: g('a6'), indicator: s.checked ? g('a8') : undefined }
  }
  if (s.variant === 'soft') {
    return { bg: c('a4'), indicator: s.checked ? (hc ? c(12) : c('a11')) : undefined }
  }
  if (s.checked) {
    return { bg: hc ? c(12) : c(9), indicator: hc ? c(1) : c('contrast') }
  }
  return { bg: g('surface'), border: g('a7') }
}

// ─── Family: tracks (Switch, Progress) — switch.css, progress.css ─────────────

export interface SwitchPaints {
  track: Paint
  border?: Paint
  thumb: Paint
}

function switchRecipe(s: WithVariant<SelectionVariant>): SwitchPaints {
  const hc = !!s.highContrast
  if (s.disabled) {
    return { track: g('a3'), border: s.variant !== 'soft' ? g('a6') : undefined, thumb: g('a5') }
  }
  if (s.checked) {
    return s.variant === 'soft'
      ? { track: c('a5'), thumb: hc ? c(12) : c('a11') }
      : { track: hc ? c(12) : c(9), thumb: WHITE }
  }
  return s.variant === 'soft'
    ? { track: g('a5'), thumb: g('a11') }
    : { track: g('a3'), border: g('a7'), thumb: WHITE }
}

export interface ProgressPaints {
  track: Paint
  border?: Paint
  /** Top edge of the classic ring (approximates the inset shadow). */
  borderTop?: Paint
  indicator: Paint
}

function progress(s: WithVariant<SelectionVariant>): ProgressPaints {
  const indicator = s.highContrast ? c(12) : c(9)
  switch (s.variant) {
    case 'classic': return { track: g('a3'), border: g('a4'), borderTop: g('a5'), indicator }
    case 'surface': return { track: g('a3'), border: g('a4'), indicator }
    case 'soft': return { track: g('a4'), indicator }
  }
}

// ─── Family: cards (Card, CheckboxCards, RadioCards) — base-card.css ──────────

export type CardVariant = 'surface' | 'classic' | 'ghost'
export type CardItemVariant = 'surface' | 'classic'

export interface CardPaints {
  bg?: Paint
  border?: Paint
  /** Pressed background; when absent the card fades instead. */
  pressedBg?: Paint
}

function card(s: WithVariant<CardVariant>): CardPaints {
  switch (s.variant) {
    case 'surface': return { bg: g('surface'), border: g('a6') }
    case 'classic': return { bg: g(2), border: g('a3') }
    case 'ghost': return { pressedBg: g('a4') }
  }
}

export interface CardItemPaints {
  bg: Paint
  border: Paint
  /** Thicker ring drawn when the item is checked (RadioCards). */
  checkedBorder?: Paint
  /** Label color for plain-string children. Undefined = default text color. */
  text?: Paint
}

function checkboxCard(s: WithVariant<CardItemVariant>): CardItemPaints {
  return s.variant === 'classic'
    ? { bg: g(2), border: g('a3') }
    : { bg: g('surface'), border: g('a5') }
}

function radioCard(s: WithVariant<CardItemVariant>): CardItemPaints {
  const checkedBorder = s.highContrast ? c(12) : c(9)
  return s.variant === 'classic'
    ? { bg: g(2), border: g('a3'), checkedBorder }
    : { bg: g('surface'), border: g('a6'), checkedBorder }
}

// ─── Family: text inputs (TextField, TextArea) — text-field.css, text-area.css ─

export type TextInputVariant = 'classic' | 'surface' | 'soft'

export interface TextInputPaints {
  bg: Paint
  border: Paint
  text: Paint
  placeholder: Paint
}

function textInput(s: WithVariant<TextInputVariant>): TextInputPaints {
  if (s.disabled) {
    return {
      bg: s.variant === 'soft' ? g('a3') : g('a2'),
      border: s.variant === 'soft' ? TRANSPARENT : g('a6'),
      text: g('a11'),
      placeholder: fade(g('a10'), 0.5),
    }
  }
  const focusBorder = c(8)
  if (s.variant === 'soft') {
    return {
      bg: c('a3'),
      border: s.focused ? focusBorder : TRANSPARENT,
      text: c(12),
      placeholder: fade(c(12), 0.6),
    }
  }
  return {
    bg: g('surface'),
    border: s.focused ? focusBorder : g('a7'),
    text: g(12),
    placeholder: g('a10'),
  }
}

const textField = (s: WithVariant<TextInputVariant>) => textInput(s)
const textArea = (s: WithVariant<TextInputVariant>) => textInput(s)

// ─── Family: text (Text, Heading, Link, Blockquote) — text.css, link.css… ─────

export interface TextPaints {
  /** `undefined` only when the text has no color of its own (see `text`). */
  text: Paint
  /** Link underline / Blockquote border. */
  decoration?: Paint
}

/** Text and Heading: colored with `color`, else gray-12. */
function text(s: PaletteState): TextPaints {
  return { text: s.hasColor ? (s.highContrast ? c(12) : c('a11')) : g(12) }
}

/** Link: always colored (accent by default); underline a5, a6 in high contrast. */
function link(s: PaletteState): TextPaints {
  return {
    text: s.highContrast ? c(12) : c('a11'),
    decoration: s.highContrast ? c('a6') : c('a5'),
  }
}

/** Blockquote: text like Text, border accent-a6. */
function blockquote(s: PaletteState): TextPaints {
  return { ...text(s), decoration: c('a6') }
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const VARIANT_RECIPES = {
  button,
  badge,
  avatar,
  code,
  checkbox,
  radio,
  switch: switchRecipe,
  progress,
  card,
  checkboxCard,
  radioCard,
  textField,
  textArea,
  text,
  link,
  blockquote,
} as const

export type RecipeName = keyof typeof VARIANT_RECIPES
export type RecipeState<R extends RecipeName> = Parameters<(typeof VARIANT_RECIPES)[R]>[0]
type RecipePaints<R extends RecipeName> = ReturnType<(typeof VARIANT_RECIPES)[R]>

/** A recipe's output with every paint resolved to a color string. */
export type VariantColors<R extends RecipeName> = {
  [K in keyof RecipePaints<R>]-?: Exclude<RecipePaints<R>[K], undefined> extends number
    ? number | undefined
    : undefined extends RecipePaints<R>[K] ? string | undefined : string
}

// ─── Resolution ───────────────────────────────────────────────────────────────

export interface PaintContext {
  rc: ResolveColorFn
  /** What the `color` scale means for this component (`color ?? 'accent'`). */
  color: ColorName
  appearance: 'light' | 'dark'
}

export function resolvePaint(paint: Paint, ctx: PaintContext): string {
  if ('raw' in paint) return paint.raw
  if ('scale' in paint) return ctx.rc(paint.scale === 'color' ? ctx.color : 'gray', paint.step)
  if ('layers' in paint) return compositeLayers(paint.layers.map(p => resolvePaint(p, ctx)))
  if ('fade' in paint) return fadeColor(resolvePaint(paint.fade, ctx), paint.opacity)
  return resolvePaint(paint[ctx.appearance], ctx)
}

export function getVariantPaints<R extends RecipeName>(name: R, state: RecipeState<R>): RecipePaints<R> {
  const recipe = VARIANT_RECIPES[name] as (s: RecipeState<R>) => RecipePaints<R>
  return recipe(state)
}

export function resolveVariantColors<R extends RecipeName>(
  name: R,
  state: RecipeState<R>,
  ctx: PaintContext,
): VariantColors<R> {
  const paints = getVariantPaints(name, state) as Record<string, Paint | number | undefined>
  const colors: Record<string, string | number | undefined> = {}
  for (const key of Object.keys(paints)) {
    const value = paints[key]
    colors[key] = value === undefined || typeof value === 'number' ? value : resolvePaint(value, ctx)
  }
  return colors as VariantColors<R>
}
