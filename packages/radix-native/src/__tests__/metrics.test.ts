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
  // Radix: --radius-N: calc(Npx * var(--scaling) * var(--radius-factor)), not rounded.
  it.each<[ScalingMode, RadiusToken, 1 | 2 | 3 | 4 | 5 | 6, number]>([
    ['100%', 'none', 3, 0],
    ['100%', 'small', 1, 2.25],
    ['100%', 'small', 4, 6],
    ['100%', 'medium', 1, 3],
    ['100%', 'medium', 3, 6],
    ['100%', 'medium', 6, 16],
    ['100%', 'large', 2, 6],
    ['100%', 'full', 5, 18],
    ['90%', 'small', 1, 2.025],
    ['90%', 'medium', 4, 7.2],
    ['95%', 'large', 6, 22.8],
    ['105%', 'medium', 2, 4.2],
    ['110%', 'medium', 1, 3.3],
    ['110%', 'none', 6, 0],
  ])('at %s, %s level %i → %f', (scaling, token, level, expected) => {
    expect(at(scaling, token).radius(level)).toBeCloseTo(expected, 6)
  })

  it('pill: max(radius-N, radius-full) is a pill only for "full"', () => {
    expect(at('100%', 'full').radius(2, 'pill')).toBe(9999)
    expect(at('110%', 'large').radius(2, 'pill')).toBeCloseTo(6.6, 6)
    expect(at('100%', 'none').radius(2, 'pill')).toBe(0)
  })

  it('thumb: max(radius-N, radius-thumb) is a pill from "medium" up', () => {
    expect(at('100%', 'medium').radius(1, 'thumb')).toBe(9999)
    expect(at('90%', 'full').radius(1, 'thumb')).toBe(9999)
    expect(at('100%', 'small').radius(1, 'thumb')).toBeCloseTo(2.25, 6)
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
