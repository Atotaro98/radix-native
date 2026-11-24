import React from 'react'
import { render } from '@testing-library/react-native'
import { useCollection, useCollectionItem, type Collection } from '../components/internal/collection'

type Part = { value: string; label?: string }
let seen: readonly Part[]
let renders = 0

function Item({ parts, enabled, ...part }: Part & { parts: Collection<Part>; enabled?: boolean }) {
  useCollectionItem(parts, part, enabled)
  return null
}
/** Parts inside a component of the consumer's own. */
function Wrapped({ parts }: { parts: Collection<Part> }) {
  return <><Item parts={parts} value="b" /><Item parts={parts} value="c" /></>
}
function Root({ children }: { children: (parts: Collection<Part>) => React.ReactNode }) {
  const parts = useCollection<Part>()
  seen = parts.items
  renders++
  return <>{children(parts)}</>
}

describe('collection of a compound component\'s parts', () => {
  it('knows its parts in tree order, also inside a component of their own', () => {
    render(<Root>{(p) => <><Item parts={p} value="a" /><Wrapped parts={p} /><Item parts={p} value="d" /></>}</Root>)
    expect(seen.map((p) => p.value)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('a part that unmounts leaves', () => {
    const tree = (b: boolean) => <Root>{(p) => <><Item parts={p} value="a" />{b ? <Item parts={p} value="b" /> : null}</>}</Root>
    const { rerender } = render(tree(true))
    rerender(tree(false))
    expect(seen.map((p) => p.value)).toEqual(['a'])
  })

  it('a changed part is replaced where it is', () => {
    const tree = (label: string) => <Root>{(p) => <><Item parts={p} value="a" label={label} /><Item parts={p} value="b" /></>}</Root>
    const { rerender } = render(tree('One'))
    rerender(tree('Uno'))
    expect(seen).toEqual([{ value: 'a', label: 'Uno' }, { value: 'b' }])
  })

  it('an unchanged part does not make the root render again', () => {
    const tree = () => <Root>{(p) => <Item parts={p} value="a" label="One" />}</Root>
    const { rerender } = render(tree())
    const before = renders
    rerender(tree())
    expect(renders).toBe(before + 1)
  })

  it('a disabled part is not registered', () => {
    render(<Root>{(p) => <><Item parts={p} value="a" enabled={false} /><Item parts={p} value="b" /></>}</Root>)
    expect(seen.map((p) => p.value)).toEqual(['b'])
  })
})
