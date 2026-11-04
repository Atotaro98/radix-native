import { resolveMetrics } from '../utils/metrics'
import type { RadiusToken } from '../tokens/radius'
import type { ScalingMode } from '../tokens/scaling'

const at = (scaling: ScalingMode, radius: RadiusToken = 'medium') => resolveMetrics({ scaling, radius })

describe('px', () => {
  // Radix: calc(Npx * var(--scaling)), rounded to whole pixels.
  it.each<[ScalingMode, number, number]>([
    ['90%', 32, 29],
    ['95%', 32, 30],
    ['100%', 32, 32],
    ['105%', 32, 34],
    ['110%', 32, 35],
    ['110%', 9, 10],
  ])('at %s, %ipx → %i', (scaling, value, expected) => {
    expect(at(scaling).px(value)).toBe(expected)
  })
})

describe('space', () => {
  // Radix: --space-N: calc(Npx * var(--scaling)).
  it.each<[ScalingMode, Parameters<ReturnType<typeof at>['space']>[0], number]>([
    ['100%', 0, 0],
    ['100%', 1, 4],
    ['100%', 5, 24],
    ['100%', 9, 64],
    ['90%', 3, 11],
    ['110%', 4, 18],
    ['100%', -3, -12],
    ['110%', -4, -18],
  ])('at %s, token %i → %i', (scaling, token, expected) => {
    expect(at(scaling).space(token)).toBe(expected)
  })
})

describe('radius', () => {
  // Radix: --radius-N: calc(Npx * var(--scaling) * var(--radius-factor)).
  it.each<[RadiusToken, 1 | 2 | 3 | 4 | 5 | 6, number]>([
    ['none', 3, 0],
    ['small', 1, 2],
    ['small', 4, 6],
    ['medium', 1, 3],
    ['medium', 3, 6],
    ['medium', 6, 16],
    ['large', 2, 6],
    ['full', 5, 18],
  ])('%s at level %i → %i (100%%)', (token, level, expected) => {
    expect(at('100%', token).radius(level)).toBe(expected)
  })

  it('pill: max(radius-N, radius-full) is a pill only for "full"', () => {
    expect(at('100%', 'full').radius(2, 'pill')).toBe(9999)
    expect(at('100%', 'large').radius(2, 'pill')).toBe(6)
    expect(at('100%', 'none').radius(2, 'pill')).toBe(0)
  })

  it('thumb: max(radius-N, radius-thumb) is a pill from "medium" up', () => {
    expect(at('100%', 'medium').radius(1, 'thumb')).toBe(9999)
    expect(at('100%', 'full').radius(1, 'thumb')).toBe(9999)
    expect(at('100%', 'small').radius(1, 'thumb')).toBe(2)
    expect(at('100%', 'none').radius(1, 'thumb')).toBe(0.5)
  })
})

describe('raw Radix variables', () => {
  it('exposes --scaling, --radius-factor and --radius-thumb', () => {
    const m = at('105%', 'small')
    expect(m.scaling).toBe(1.05)
    expect(m.radiusFactor).toBe(0.75)
    expect(m.radiusThumb).toBe(0.5)
    expect(at('100%', 'large').radiusThumb).toBe(9999)
  })
})
