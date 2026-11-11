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

/**
 * `color` = the component's `color` prop (the theme accent when unset).
 * `focus` = Radix `--focus-*`: the `color` scale, except a gray component
 * keeps the theme accent (color.css sets `--focus-*` on
 * `[data-accent-color]:not([data-accent-color='gray'])` only).
 */
type PaintScale = 'color' | 'gray' | 'focus'

export type Paint =
  | { readonly scale: PaintScale; readonly step: ColorStep }
  | { readonly raw: string }
  /** Layers listed top-most first, flattened into one color. */
  | { readonly layers: readonly Paint[] }
  | { readonly fade: Paint; readonly opacity: number }
  | { readonly light: Paint; readonly dark: Paint }

export const c = (step: ColorStep): Paint => ({ scale: 'color', step })
export const g = (step: ColorStep): Paint => ({ scale: 'gray', step })
export const f = (step: ColorStep): Paint => ({ scale: 'focus', step })
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

// ─── Shadows ──────────────────────────────────────────────────────────────────

/**
 * A drop shadow as a recipe part: its color is a paint, the rest are numbers in
 * points. `shadowStyle` (utils/shadow.ts) turns the resolved shadow into iOS
 * `shadow*` props and Android `elevation`. Radix's inset shadows have no RN
 * equivalent; recipes keep them as rings (`border`) or the bevel instead.
 */
export interface ShadowPaint {
  readonly color: Paint
  readonly opacity: number
  readonly offsetY: number
  readonly radius: number
  /** Android `elevation`. */
  readonly elevation: number
}

/** A ShadowPaint with its color resolved. */
export interface Shadow {
  color: string
  opacity: number
  offsetY: number
  radius: number
  elevation: number
}

const BLACK = raw('#000000')

/**
 * The drop shadow of a raised classic part. Radix Card and card items have a real
 * outer shadow (--base-card-classic-box-shadow-outer); Button draws its raised look
 * with inset shadows only, which this stands in for (see llm/differences.md).
 */
const classicLift = (s: PaletteState): ShadowPaint =>
  ({ color: BLACK, opacity: s.appearance === 'dark' ? 0.3 : 0.15, offsetY: 1, radius: 2, elevation: 2 })

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
  /** Classic only: the raised look's drop shadow, gone while pressed. */
  shadow?: ShadowPaint
  /** Classic only: the bevel gradient (`ClassicOverlay`). */
  bevel?: true
}

const CLASSIC_DISABLED_RING = byMode(g('a4'), layers(g('a5'), g('a2')))

function button(s: WithVariant<ButtonVariant>): ButtonPaints {
  const hc = !!s.highContrast
  if (s.disabled) {
    // .rt-BaseButton[data-disabled]
    const text = g('a8')
    switch (s.variant) {
      // --base-button-classic-disabled-box-shadow keeps a 1px ring: gray-a4 in
      // light, gray-a5 over gray-a2 in dark (else gray-2 vanishes on gray-1)
      case 'classic': return { bg: g(2), text, border: CLASSIC_DISABLED_RING, pressedBg: g(2) }
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
        // .rt-variant-classic: bevel gradient at rest and :active; :active sinks (no lift).
        // [data-disabled] (set by loading too) drops both: handled above.
        ...(s.variant === 'classic' ? { bevel: true as const, shadow: s.pressed ? undefined : classicLift(s) } : {}),
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
  /** Classic checked: the bevel gradient (inset only in Radix, so no drop shadow). */
  bevel?: true
}

/** Disabled ring: surface gray-a6, classic shadow-1, soft none. */
function disabledSelectionBorder(variant: SelectionVariant): Paint | undefined {
  if (variant === 'surface') return g('a6')
  if (variant === 'classic') return SHADOW_1_RING
  return undefined
}

/** `.rt-variant-classic[data-state='checked']`: the bevel gradient (never when disabled). */
const classicBevel = (variant: SelectionVariant): { bevel?: true } =>
  variant === 'classic' ? { bevel: true } : {}

function checkbox(s: WithVariant<SelectionVariant>): SelectionPaints {
  const hc = !!s.highContrast
  if (s.disabled) {
    // checkbox.css :disabled → gray-a3 for every variant; indicator gray-a8
    return {
      bg: g('a3'),
      border: disabledSelectionBorder(s.variant),
      indicator: s.checked ? g('a8') : undefined,
    }
  }
  if (s.variant === 'soft') {
    // .rt-variant-soft → accent-a5; indicator accent-a11 (hc accent-12)
    return { bg: c('a5'), indicator: s.checked ? (hc ? c(12) : c('a11')) : undefined }
  }
  if (s.checked) {
    // checked → accent-indicator; indicator accent-contrast (hc: accent-12 / accent-1);
    // classic adds the bevel gradient
    return { bg: hc ? c(12) : c('indicator'), indicator: hc ? c(1) : c('contrast'), ...classicBevel(s.variant) }
  }
  // unchecked → color-surface; surface ring gray-a7, classic gray-a3 + shadow-1
  return {
    bg: g('surface'),
    border: s.variant === 'classic' ? layers(g('a3'), SHADOW_1_RING) : g('a7'),
  }
}

function radio(s: WithVariant<SelectionVariant>): SelectionPaints {
  const hc = !!s.highContrast
  if (s.disabled) {
    return {
      bg: g('a3'),
      border: disabledSelectionBorder(s.variant),
      indicator: s.checked ? g('a8') : undefined,
    }
  }
  if (s.variant === 'soft') {
    // .rt-variant-soft → accent-a4 (Checkbox uses a5); dot accent-a11 (hc accent-12)
    return { bg: c('a4'), indicator: s.checked ? (hc ? c(12) : c('a11')) : undefined }
  }
  if (s.checked) {
    return { bg: hc ? c(12) : c('indicator'), indicator: hc ? c(1) : c('contrast'), ...classicBevel(s.variant) }
  }
  // unchecked → color-surface; surface ring gray-a7, classic solid gray-7 + shadow-1
  return {
    bg: g('surface'),
    border: s.variant === 'classic' ? layers(g(7), SHADOW_1_RING) : g('a7'),
  }
}

// ─── Family: tracks (Switch, Progress) — switch.css, progress.css ─────────────

export interface SwitchPaints {
  track: Paint
  /** Ring drawn over the track (Radix inset box-shadow). */
  border?: Paint
  thumb: Paint
  /** The thumb's drop shadow (every variant). */
  thumbShadow: ShadowPaint
}

/**
 * `.rt-SwitchThumb`: a multi-layer drop shadow in every variant (`0 1px 3px
 * black-a2/a3, 0 2px 4px -1px black-a1`; [data-disabled] `0 1px 3px black-a1`),
 * approximated with one shadow.
 */
const switchThumbShadow = (disabled: boolean): ShadowPaint =>
  ({ color: BLACK, opacity: disabled ? 0.05 : 0.15, offsetY: 1, radius: 1.5, elevation: disabled ? 0 : 1 })

/** `--switch-high-contrast-checked-color-overlay`: black-a8 in light mode, none in dark. */
const SWITCH_HC_OVERLAY = byMode(blackA(8), TRANSPARENT)

/**
 * switch.css paints the track as stacked gradients (checked half / unchecked
 * half) over a background color; each state flattens its half of the stack.
 */
function switchRecipe(s: WithVariant<SelectionVariant>): SwitchPaints {
  return { ...switchColors(s), thumbShadow: switchThumbShadow(!!s.disabled) }
}

function switchColors(s: WithVariant<SelectionVariant>): Omit<SwitchPaints, 'thumbShadow'> {
  const hc = !!s.highContrast
  // .rt-SwitchThumb → white in every variant (soft only desaturates it); disabled gray-2
  const thumb = s.disabled ? g(2) : WHITE
  const solidChecked = hc ? layers(SWITCH_HC_OVERLAY, c('track')) : c('track')

  switch (s.variant) {
    case 'surface':
      if (s.disabled) return { track: g('a3'), border: g('a3'), thumb }
      return { track: s.checked ? solidChecked : g('a3'), border: g('a5'), thumb }

    case 'classic':
      if (s.disabled) {
        // [data-disabled]::before → gray-a5 + shadow-1 at opacity 0.5
        return { track: fade(g('a5'), 0.5), border: fade(SHADOW_1_RING, 0.5), thumb }
      }
      if (!s.checked) return { track: g('a4'), border: SHADOW_1_RING, thumb }
      return {
        track: solidChecked,
        border: hc ? layers(g('a3'), blackA(2)) : layers(g('a3'), c('a4'), blackA(1)),
        thumb,
      }

    case 'soft':
      if (s.disabled) return { track: g('a4'), thumb }
      if (!s.checked) return { track: layers(whiteA(1), g('a3'), g('a3')), thumb }
      return {
        track: hc
          ? layers(SWITCH_HC_OVERLAY, c('a6'), c('a6'), c('a6'), c('a3'))
          : layers(c('a4'), c('a4'), c('a4'), g('a2')),
        thumb,
      }
  }
}

export interface ProgressPaints {
  track: Paint
  /** Ring drawn over the track (Radix inset box-shadow). */
  border?: Paint
  indicator: Paint
}

function progress(s: WithVariant<SelectionVariant>): ProgressPaints {
  const hc = !!s.highContrast
  switch (s.variant) {
    case 'surface':
      return { track: g('a3'), border: g('a4'), indicator: hc ? c(12) : c('track') }
    case 'classic':
      return { track: g('a3'), border: SHADOW_1_RING, indicator: hc ? c(12) : c('track') }
    case 'soft':
      // track gray-a4 + white-a1; indicator accent-8 (hc accent-12) under accent-a5
      return {
        track: layers(whiteA(1), g('a4')),
        indicator: layers(c('a5'), hc ? c(12) : c(8)),
      }
  }
}

// ─── Family: cards (Card, CheckboxCards, RadioCards) — base-card.css ──────────

export type CardVariant = 'surface' | 'classic' | 'ghost'
export type CardItemVariant = 'surface' | 'classic'

export interface CardPaints {
  bg?: Paint
  border?: Paint
  /** Ring while pressed (Radix :active box-shadow). */
  pressedBorder?: Paint
  /** Pressed background (ghost). */
  pressedBg?: Paint
  /** Classic: the outer drop shadow, kept while pressed. */
  shadow?: ShadowPaint
}

/** `--base-card-classic-border-color`: gray-a3 in light mode, gray-a6 in dark mode. */
const CARD_CLASSIC_BORDER = byMode(g('a3'), g('a6'))

function card(s: WithVariant<CardVariant>): CardPaints {
  switch (s.variant) {
    // card.css: background --color-panel; ring --base-card-surface-box-shadow (gray-a5, :active gray-a6)
    case 'surface': return { bg: g('panel'), border: g('a5'), pressedBorder: g('a6') }
    // ring --base-card-classic-border-color (:active gray-a4 light / gray-a6 dark)
    // shadow --base-card-classic-box-shadow-outer; :active (--base-card-classic-active-*) keeps it
    case 'classic': return { bg: g('panel'), border: CARD_CLASSIC_BORDER, pressedBorder: byMode(g('a4'), g('a6')), shadow: classicLift(s) }
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
  /** Classic: the outer drop shadow, kept when disabled. */
  shadow?: ShadowPaint
}

/**
 * `--color-surface` flattened onto the page background (`--color-background`:
 * white / dark gray-1). Card items carry a drop shadow in the classic variant,
 * and iOS draws a shadow through a translucent fill, graying it out.
 */
const OPAQUE_SURFACE = layers(g('surface'), byMode(WHITE, g(1)))

/** checkbox-cards.css / radio-cards.css: items fill with --color-surface. */
function cardItem(s: WithVariant<CardItemVariant>): CardItemPaints {
  const border = s.variant === 'classic' ? CARD_CLASSIC_BORDER : g('a5')
  // classic: the card's outer shadow, which :has(:disabled) / :disabled keeps
  const shadow = s.variant === 'classic' ? classicLift(s) : undefined
  if (s.disabled) {
    // :has(:disabled) → text gray-a9, gray-a2 over the background
    return { bg: layers(g('a2'), OPAQUE_SURFACE), border, text: g('a9'), shadow }
  }
  return { bg: OPAQUE_SURFACE, border, shadow }
}

const checkboxCard = (s: WithVariant<CardItemVariant>): CardItemPaints => cardItem(s)

function radioCard(s: WithVariant<CardItemVariant>): CardItemPaints {
  // [data-state='checked'] → 2px outline accent-indicator (hc accent-12, disabled gray-8)
  const checkedBorder = s.disabled ? g(8) : s.highContrast ? c(12) : c('indicator')
  return { ...cardItem(s), checkedBorder }
}

// ─── Family: text inputs (TextField, TextArea) — text-field.css, text-area.css ─

export type TextInputVariant = 'classic' | 'surface' | 'soft'

export interface TextInputPaints {
  bg: Paint
  border: Paint
  text: Paint
  placeholder: Paint
}

/**
 * text-field.css / text-area.css. `softPlaceholderOpacity`: TextField 0.6,
 * TextArea 0.65. Disabled inputs keep their variant's placeholder at half
 * opacity and turn their text gray-a11.
 */
function textInput(s: WithVariant<TextInputVariant>, softPlaceholderOpacity: number): TextInputPaints {
  // Disabled and read-only look the same (Radix `:disabled, :read-only`). Only a
  // read-only input can still take focus; its ring is then gray-8. Soft uses
  // accent-8 instead of focus-8 ("use gray outline when component color is gray").
  const disabled = !!s.disabled
  const focusBorder = disabled ? g(8) : s.variant === 'soft' ? c(8) : f(8)

  if (s.variant === 'soft') {
    const placeholder = fade(c(12), softPlaceholderOpacity * (disabled ? 0.5 : 1))
    if (disabled) return { bg: g('a3'), border: s.focused ? focusBorder : TRANSPARENT, text: g('a11'), placeholder }
    return { bg: c('a3'), border: s.focused ? focusBorder : TRANSPARENT, text: c(12), placeholder }
  }

  // surface ring gray-a7 (disabled gray-a6); classic ring shadow-1 (kept when disabled)
  const ring = s.variant === 'classic' ? SHADOW_1_RING : g('a7')
  if (disabled) {
    return {
      bg: layers(g('a2'), g('surface')),
      border: s.focused ? focusBorder : s.variant === 'classic' ? SHADOW_1_RING : g('a6'),
      text: g('a11'),
      placeholder: fade(g('a10'), 0.5),
    }
  }
  return {
    bg: g('surface'),
    border: s.focused ? focusBorder : ring,
    text: g(12),
    placeholder: g('a10'),
  }
}

const textField = (s: WithVariant<TextInputVariant>) => textInput(s, 0.6)
const textArea = (s: WithVariant<TextInputVariant>) => textInput(s, 0.65)

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

/**
 * DataList.Label (data-list.css): gray-a11, high contrast gray-12; with `color`
 * accent-a11, high contrast accent-12.
 */
function dataListLabel(s: PaletteState): TextPaints {
  if (s.hasColor) return { text: s.highContrast ? c(12) : c('a11') }
  return { text: s.highContrast ? g(12) : g('a11') }
}

/** Blockquote: text like Text, border accent-a6. */
function blockquote(s: PaletteState): TextPaints {
  return { ...text(s), decoration: c('a6') }
}

// ─── Kbd — kbd.css ────────────────────────────────────────────────────────────

export type KbdVariant = 'classic' | 'soft'

export interface KbdPaints {
  bg: Paint
  text: Paint
  /** Classic only: the 1px ring of `--kbd-box-shadow`. */
  ring?: Paint
  /** Classic only: the darker bottom edge. */
  bottomEdge?: Paint
  /** Classic only: the inset top highlight. */
  highlight?: Paint
  /** Classic only: the outer drop shadow. */
  shadow?: ShadowPaint
}

/**
 * `.rt-Kbd`: gray-12 text. Classic: gray-1 with `--kbd-box-shadow` (ring
 * gray-a5 / dark gray-a7, bottom edge gray-a7 / dark black-a11, top highlight
 * gray-a3 / dark gray-a11, drop shadow gray-12 / dark black). Soft: gray-a3.
 */
function kbd(s: WithVariant<KbdVariant>): KbdPaints {
  if (s.variant === 'soft') return { bg: g('a3'), text: g(12) }
  return {
    bg: g(1),
    text: g(12),
    ring: byMode(g('a5'), g('a7')),
    bottomEdge: byMode(g('a7'), blackA(11)),
    highlight: byMode(g('a3'), g('a11')),
    shadow: {
      color: byMode(g(12), BLACK),
      opacity: s.appearance === 'dark' ? 0.95 : 0.12,
      offsetY: 1,
      radius: 1,
      elevation: 1,
    },
  }
}

// ─── Family: callouts (Callout) — callout.css ─────────────────────────────────

export type CalloutVariant = 'soft' | 'surface' | 'outline'

export interface CalloutPaints {
  bg: Paint
  /** The inset 1px ring (surface, outline). */
  border?: Paint
  /** Text and icons: accent-a11, high contrast accent-12, in every variant. */
  text: Paint
}

/**
 * `.rt-CalloutRoot:where(.rt-variant-*)`: soft accent-a3; surface accent-a2 with an
 * accent-a6 ring; outline no fill and an accent-a7 ring. Unlike chips, surface is a
 * tint (accent-a2, not --color-surface) and high contrast changes only the text.
 */
function callout(s: WithVariant<CalloutVariant>): CalloutPaints {
  const text = s.highContrast ? c(12) : c('a11')
  switch (s.variant) {
    case 'soft': return { bg: c('a3'), text }
    case 'surface': return { bg: c('a2'), border: c('a6'), text }
    case 'outline': return { bg: TRANSPARENT, border: c('a7'), text }
  }
}

// ─── Control label (CheckboxGroup / RadioGroup item text) ─────────────────────

export interface ControlLabelPaints {
  text: Paint
}

/** `.rt-BaseCheckboxRoot ~ label` text: gray-12, gray-a8 when disabled. */
function controlLabel(s: PaletteState): ControlLabelPaints {
  return { text: s.disabled ? g('a8') : g(12) }
}

// ─── Focus ring (every focusable control but text inputs) ─────────────────────

export interface FocusRingPaints {
  ring: Paint
}

/** `:focus-visible { outline: 2px solid var(--focus-8) }` (base-button, base-checkbox, base-card…). */
function focusRing(_s: PaletteState): FocusRingPaints {
  return { ring: f(8) }
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
  dataListLabel,
  kbd,
  callout,
  controlLabel,
  focusRing,
} as const

export type RecipeName = keyof typeof VARIANT_RECIPES
export type RecipeState<R extends RecipeName> = Parameters<(typeof VARIANT_RECIPES)[R]>[0]
type RecipePaints<R extends RecipeName> = ReturnType<(typeof VARIANT_RECIPES)[R]>

/** A recipe's output with every paint resolved to a color string. */
export type VariantColors<R extends RecipeName> = {
  [K in keyof RecipePaints<R>]-?: Resolved<Exclude<RecipePaints<R>[K], undefined>, undefined extends RecipePaints<R>[K] ? true : false>
}

type Resolved<P, Optional extends boolean> =
  P extends number ? number | undefined
  : P extends true ? true | undefined
  : P extends ShadowPaint ? (Optional extends true ? Shadow | undefined : Shadow)
  : Optional extends true ? string | undefined : string

// ─── Resolution ───────────────────────────────────────────────────────────────

export interface PaintContext {
  rc: ResolveColorFn
  /** What the `color` scale means for this component (`color ?? 'accent'`). */
  color: ColorName
  appearance: 'light' | 'dark'
}

function scaleColor(scale: PaintScale, color: ColorName): ColorName {
  if (scale === 'gray') return 'gray'
  if (scale === 'focus' && color === 'gray') return 'accent'
  return color
}

export function resolvePaint(paint: Paint, ctx: PaintContext): string {
  if ('raw' in paint) return paint.raw
  if ('scale' in paint) return ctx.rc(scaleColor(paint.scale, ctx.color), paint.step)
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
  const paints = getVariantPaints(name, state) as Record<string, Paint | ShadowPaint | number | true | undefined>
  const colors: Record<string, string | number | true | Shadow | undefined> = {}
  for (const key of Object.keys(paints)) {
    const value = paints[key]
    if (value === undefined || typeof value === 'number' || value === true) colors[key] = value
    else if ('elevation' in value) colors[key] = { ...value, color: resolvePaint(value.color, ctx) }
    else colors[key] = resolvePaint(value, ctx)
  }
  return colors as VariantColors<R>
}
