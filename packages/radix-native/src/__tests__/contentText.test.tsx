import React from 'react'
import { Text as RNText, View } from 'react-native'
import { screen } from '@testing-library/react-native'
import { contentPieces, plainText, renderContentText } from '../components/internal/contentText'
import { renderWithTheme } from './helpers/render'
import { CheckboxGroup } from '../components/actions/CheckboxGroup'
import { RadioGroup } from '../components/actions/RadioGroup'
import { CheckboxCards } from '../components/actions/CheckboxCards'
import { RadioCards } from '../components/actions/RadioCards'
import { VisuallyHidden } from '../components/utilities/VisuallyHidden'
import { Skeleton } from '../components/feedback/Skeleton'
import { Avatar } from '../components/display/Avatar'

const name = 'B'
const icon = <View testID="icon" />

describe('contentPieces', () => {
  const kinds = (children: React.ReactNode) =>
    contentPieces(children).map((p) => (p.kind === 'text' ? p.text : '<node>'))

  it.each<[string, React.ReactNode, string[]]>([
    ['a string', 'Option', ['Option']],
    ['a number', 3, ['3']],
    ['several pieces', ['Option ', name], ['Option B']],
    ['text and numbers', ['Step ', 2, ' of ', 3], ['Step 2 of 3']],
    ['text, element, text', ['Save ', icon, ' now'], ['Save ', '<node>', ' now']],
    ['an element alone', icon, ['<node>']],
    ['pieces grouped in a fragment', <>Option {name}</>, ['Option B']],
    ['a fragment between text', ['Save ', <>{icon} now</>], ['Save ', '<node>', ' now']],
    ['nothing', null, []],
    ['booleans and nulls between text', ['A', false, null, undefined, 'B'], ['AB']],
    ['an empty string', '', []],
  ])('%s', (_label, children, expected) => {
    expect(kinds(children)).toEqual(expected)
  })
})

describe('plainText', () => {
  it.each<[string, React.ReactNode, string | undefined]>([
    ['a string', 'Option', 'Option'],
    ['several pieces', ['Option ', name], 'Option B'],
    ['a number', 0, '0'],
    ['text with an element', ['Save ', icon], undefined],
    ['nothing', null, undefined],
  ])('%s', (_label, children, expected) => {
    expect(plainText(children)).toBe(expected)
  })
})

describe('renderContentText', () => {
  const text = (value: string) => <RNText>{value}</RNText>

  it('returns the content as given when it holds no text', () => {
    expect(renderContentText(icon, text)).toBe(icon)
  })

  it('wraps each run of text and keeps elements in place', () => {
    renderWithTheme(<View>{renderContentText(['Save ', icon, 'now ', 2], text)}</View>)
    expect(screen.getByText('Save ')).toBeTruthy()
    expect(screen.getByTestId('icon')).toBeTruthy()
    expect(screen.getByText('now 2')).toBeTruthy()
  })
})

describe('text written in several pieces reads as one text', () => {
  it('CheckboxGroup item', () => {
    renderWithTheme(
      <CheckboxGroup.Root>
        <CheckboxGroup.Item value="b">Option {name}</CheckboxGroup.Item>
      </CheckboxGroup.Root>,
    )
    expect(screen.getByText('Option B')).toBeTruthy()
  })

  it('RadioGroup item', () => {
    renderWithTheme(
      <RadioGroup.Root>
        <RadioGroup.Item value="b">Option {name}</RadioGroup.Item>
      </RadioGroup.Root>,
    )
    expect(screen.getByText('Option B')).toBeTruthy()
  })

  it('CheckboxCards item', () => {
    renderWithTheme(
      <CheckboxCards.Root>
        <CheckboxCards.Item value="b">Option {name}</CheckboxCards.Item>
      </CheckboxCards.Root>,
    )
    expect(screen.getByText('Option B')).toBeTruthy()
  })

  it('RadioCards item', () => {
    renderWithTheme(
      <RadioCards.Root>
        <RadioCards.Item value="b">Option {name}</RadioCards.Item>
      </RadioCards.Root>,
    )
    expect(screen.getByText('Option B')).toBeTruthy()
  })

  it('VisuallyHidden', () => {
    renderWithTheme(<VisuallyHidden>Option {name}</VisuallyHidden>)
    expect(screen.getByText('Option B')).toBeTruthy()
  })

  it('Skeleton', () => {
    renderWithTheme(<Skeleton>Option {name}</Skeleton>)
    expect(screen.getByText('Option B', { includeHiddenElements: true })).toBeTruthy()
  })

  it('Avatar fallback', () => {
    renderWithTheme(<Avatar fallback={['A', name]} />)
    expect(screen.getByText('AB')).toBeTruthy()
  })
})
