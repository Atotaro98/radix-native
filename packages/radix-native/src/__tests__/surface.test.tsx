import React from 'react'
import { render } from '@testing-library/react-native'
import { View } from 'react-native'
import { paintSurface } from '../components/internal/surface'
import { cardRings, hasBevel } from './helpers/queries'

const shadow = { color: '#000000', opacity: 0.15, offsetY: 1, radius: 2, elevation: 2 }

function drawn(colors: Parameters<typeof paintSurface>[0]) {
  const surface = paintSurface(colors, 6)
  const { UNSAFE_root } = render(<View style={surface.style}>{surface.under}{surface.over}</View>)
  return { surface, root: UNSAFE_root }
}

describe('paintSurface (internal/surface)', () => {
  it('fill and radius always; a border only when the recipe gives one', () => {
    expect(paintSurface({ bg: 'red' }, 6).style).toEqual({ borderRadius: 6, backgroundColor: 'red' })
    expect(paintSurface({ bg: 'red', border: 'blue' }, 6).style).toMatchObject({ borderWidth: 1, borderColor: 'blue' })
  })

  it('a ring is drawn over the content, 1px unless the recipe sets its width', () => {
    expect(cardRings(drawn({ ring: 'blue' }).root)).toEqual([{ color: 'blue', width: 1 }])
    expect(cardRings(drawn({ ring: 'blue', ringWidth: 2 }).root)).toEqual([{ color: 'blue', width: 2 }])
    expect(cardRings(drawn({ bg: 'red' }).root)).toEqual([])
  })

  it('bevel under the content, opacity and drop shadow on the host', () => {
    const { surface, root } = drawn({ bevel: true, opacity: 0.88, shadow })
    expect(hasBevel(root)).toBe(true)
    expect(surface.style.opacity).toBe(0.88)
    expect(surface.style).toMatchObject({ shadowOpacity: 0.15 })
    expect(hasBevel(drawn({}).root)).toBe(false)
  })
})
