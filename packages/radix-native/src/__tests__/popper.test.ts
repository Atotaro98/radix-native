import { place, resolvePadding, type PlaceOptions } from '../utils/popper'

const boundary = { x: 0, y: 0, width: 400, height: 800 }
const base: PlaceOptions = {
  side: 'bottom', align: 'start', sideOffset: 8, alignOffset: 0, boundary, collisionPadding: 10, avoidCollisions: true, sticky: 'partial',
}
const anchor = { x: 50, y: 100, width: 80, height: 32 }

describe('popper placement (Radix Popper middleware)', () => {
  it('places below the anchor, aligned to its start, sideOffset away', () => {
    expect(place(anchor, { width: 200, height: 100 }, base)).toMatchObject({ x: 50, y: 140, side: 'bottom' })
  })

  it.each([
    ['center', 50 + 40 - 100],
    ['end', 50 + 80 - 200],
  ] as const)('align %s', (align, x) => {
    const p = place({ ...anchor, x: 200 }, { width: 200, height: 100 }, { ...base, align })
    expect(p.x).toBe(x + 150)
  })

  it('flips to the top when the bottom overflows', () => {
    const p = place({ ...anchor, y: 700 }, { width: 200, height: 150 }, base)
    expect(p).toMatchObject({ side: 'top', y: 700 - 150 - 8 })
  })

  it('shifts along the alignment axis to stay inside the collision padding', () => {
    const p = place({ ...anchor, x: 350, width: 40 }, { width: 200, height: 100 }, base)
    expect(p.x).toBe(400 - 10 - 200)
  })

  it('reports the available height on the placed side', () => {
    expect(place(anchor, { width: 100, height: 100 }, base).availableHeight).toBe(800 - 10 - 140)
  })

  it('transform origin sits on the anchor-facing edge at the align point', () => {
    expect(place(anchor, { width: 200, height: 100 }, base)).toMatchObject({ originX: 0, originY: 0 })
    expect(place(anchor, { width: 200, height: 100 }, { ...base, side: 'right', align: 'center' })).toMatchObject({ originX: 0, originY: 50 })
  })

  it('keeps the content on screen when neither side fits (a sub-menu on a phone)', () => {
    const p = place({ x: 90, y: 450, width: 250, height: 32 }, { width: 200, height: 150 }, { ...base, side: 'right', alignOffset: -8 })
    expect(p).toMatchObject({ side: 'left', x: 10, y: 442 })
  })

  it('does not move without avoidCollisions', () => {
    const p = place({ ...anchor, y: 700 }, { width: 200, height: 150 }, { ...base, avoidCollisions: false })
    expect(p.side).toBe('bottom')
  })

  it('pads per side', () => {
    expect(resolvePadding({ top: 4 })).toEqual({ top: 4, right: 0, bottom: 0, left: 0 })
  })
})
