import { placeAnchored, placementBoundary, placementContains, type AnchoredPlacementOptions, type PlacementEnvironment } from '../utils/anchoredPlacement'

const env: PlacementEnvironment = {
  window: { width: 400, height: 800 },
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  keyboardTop: null,
  origin: { x: 0, y: 0 },
  rtl: false,
}
const popper: AnchoredPlacementOptions = {
  side: 'bottom', align: 'start', sideOffset: 8, alignOffset: 0, avoidCollisions: true, collisionPadding: 10, sticky: 'partial',
}
const anchor = { x: 50, y: 100, width: 80, height: 32 }
const content = { width: 200, height: 100 }

describe('boundary: the window minus the safe area and the keyboard', () => {
  it('is the whole window on a bare device', () => {
    expect(placementBoundary(env)).toEqual({ x: 0, y: 0, width: 400, height: 800 })
  })
  it('leaves the safe area out', () => {
    expect(placementBoundary({ ...env, insets: { top: 47, right: 4, bottom: 34, left: 6 } }))
      .toEqual({ x: 6, y: 47, width: 390, height: 800 - 47 - 34 })
  })
  it('ends at the keyboard when it is higher than the bottom inset', () => {
    expect(placementBoundary({ ...env, insets: { ...env.insets, top: 47, bottom: 34 }, keyboardTop: 500 }).height).toBe(500 - 47)
  })
  it('never has a negative height', () => {
    expect(placementBoundary({ ...env, insets: { ...env.insets, top: 60 }, keyboardTop: 40 }).height).toBe(0)
  })
})

describe('popper strategy on the device', () => {
  it('places below the anchor in window coordinates', () => {
    expect(placeAnchored(anchor, content, popper, env)).toMatchObject({ x: 50, y: 140, left: 50, top: 140, side: 'bottom' })
  })

  it('draws relative to the portal host origin (a root Theme under a header)', () => {
    const p = placeAnchored(anchor, content, popper, { ...env, origin: { x: 12, y: 64 } })
    expect(p).toMatchObject({ x: 50, y: 140, left: 38, top: 76 })
  })

  it('flips above the anchor when the keyboard takes the space below', () => {
    const low = { ...anchor, y: 400 }
    expect(placeAnchored(low, content, popper, env).side).toBe('bottom')
    expect(placeAnchored(low, content, popper, { ...env, keyboardTop: 480 })).toMatchObject({ side: 'top', y: 400 - 100 - 8 })
  })

  it('gives the space up to the keyboard as the available height', () => {
    expect(placeAnchored(anchor, content, popper, { ...env, keyboardTop: 500 }).availableHeight).toBe(500 - 10 - 140)
  })

  it('stays inside the safe area plus the collision padding', () => {
    const p = placeAnchored({ ...anchor, x: 0 }, content, popper, { ...env, insets: { ...env.insets, left: 30 } })
    expect(p.x).toBe(40)
  })

  it.each([
    ['start', 150 + 80 - 200],
    ['end', 150],
    ['center', 150 + 40 - 100],
  ] as const)('RTL: align %s above / below starts from the right edge', (align, x) => {
    expect(placeAnchored({ ...anchor, x: 150 }, content, { ...popper, align }, { ...env, rtl: true }).x).toBe(x)
  })

  it('RTL: left / right sides stay physical and keep their align', () => {
    const o = { ...popper, side: 'right' as const }
    expect(placeAnchored(anchor, content, o, { ...env, rtl: true })).toEqual(placeAnchored(anchor, content, o, env))
  })
})

describe('item-aligned strategy (Radix SelectItemAlignedPosition)', () => {
  const trigger = { x: 40, y: 400, width: 160, height: 32 }
  const list = { width: 200, height: 160 }
  // content padding 8 + gutter 24; trigger padding-x 12; the third 32px item: 8 + 64 + 16
  const strategy = { kind: 'item-aligned' as const, rowCenter: 88, textInset: 32, anchorTextInset: 12 }
  const options = { ...popper, strategy }

  it('lines the row text up with the trigger value text, the row centred on the trigger', () => {
    expect(placeAnchored(trigger, list, options, env)).toMatchObject({ x: 40 + 12 - 32, y: 416 - 88 })
  })
  it('stays inside the padded boundary', () => {
    expect(placeAnchored({ ...trigger, x: 0, y: 20 }, list, { ...options, strategy: { ...strategy, rowCenter: 120 } }, env))
      .toMatchObject({ x: 10, y: 10 })
  })
  it('keeps a per-side collision padding', () => {
    expect(placeAnchored(trigger, list, { ...options, collisionPadding: { left: 60 } }, env).x).toBe(60)
  })
  it('stays above the keyboard', () => {
    expect(placeAnchored(trigger, list, options, { ...env, keyboardTop: 420 }).y).toBe(420 - 10 - 160)
  })
  it('RTL: the texts line up on their right edges', () => {
    const p = placeAnchored({ x: 100, y: 300, width: 120, height: 32 }, { width: 160, height: 100 }, options, { ...env, rtl: true })
    expect(p.x).toBe(100 + 120 - 12 + 32 - 160)
  })
  it('has the whole padded boundary to grow into, and scales from its centre', () => {
    expect(placeAnchored(trigger, list, options, env)).toMatchObject({ availableWidth: 380, availableHeight: 780, originX: 100, originY: 80 })
  })
  it('is drawn relative to the portal host origin too', () => {
    expect(placeAnchored(trigger, list, options, { ...env, origin: { x: 0, y: 50 } }).top).toBe(416 - 88 - 50)
  })
})

describe('placementContains', () => {
  it('is true on the content, false beside it', () => {
    expect(placementContains({ x: 50, y: 140 }, content, 60, 150)).toBe(true)
    expect(placementContains({ x: 50, y: 140 }, content, 380, 700)).toBe(false)
  })
})
