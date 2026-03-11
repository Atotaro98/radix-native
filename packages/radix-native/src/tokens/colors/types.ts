export interface ColorScale {
  1: string
  2: string
  3: string
  4: string
  5: string
  6: string
  7: string
  8: string
  9: string
  10: string
  11: string
  12: string
  a1: string
  a2: string
  a3: string
  a4: string
  a5: string
  a6: string
  a7: string
  a8: string
  a9: string
  a10: string
  a11: string
  a12: string
  /** Text color with sufficient contrast over step 9 background (APCA, hardcoded by Radix) */
  contrast: string
  /** Translucent tinted surface background */
  surface: string
  /** Alias for step 9 — used by Slider and Progress components */
  indicator: string
  /** Alias for step 9 — used by Slider and Progress components */
  track: string
}

export interface ColorScaleWithModes {
  light: ColorScale
  dark: ColorScale
}

export type AccentColor =
  | 'gray'
  | 'gold'
  | 'bronze'
  | 'brown'
  | 'yellow'
  | 'amber'
  | 'orange'
  | 'tomato'
  | 'red'
  | 'ruby'
  | 'crimson'
  | 'pink'
  | 'plum'
  | 'purple'
  | 'violet'
  | 'iris'
  | 'indigo'
  | 'blue'
  | 'cyan'
  | 'teal'
  | 'jade'
  | 'green'
  | 'grass'
  | 'lime'
  | 'mint'
  | 'sky'

export type GrayColor = 'gray' | 'mauve' | 'slate' | 'sage' | 'olive' | 'sand'
