export type ScalingMode = '90%' | '95%' | '100%' | '105%' | '110%'

/** Multiplier applied to space, fontSize and lineHeight */
export const scalingMap: Record<ScalingMode, number> = {
  '90%': 0.9,
  '95%': 0.95,
  '100%': 1.0,
  '105%': 1.05,
  '110%': 1.1,
}
