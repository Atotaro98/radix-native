import React from 'react'
import { StyleSheet } from 'react-native'
import { screen } from '@testing-library/react-native'
import { Text, Link, Code, Heading, Strong } from '../index'
import { renderWithTheme } from './helpers/render'
import { indigo, slate } from '../tokens/colors'

const styleOf = (text: string) => StyleSheet.flatten(screen.getByText(text).props.style)

describe('Text', () => {
  it('defaults to size 3 and gray-12 when standalone', () => {
    renderWithTheme(<Text>Body</Text>)
    expect(styleOf('Body')).toMatchObject({ fontSize: 16, lineHeight: 24, color: slate.light[12] })
  })

  it('nested Text without size/color inherits from its parent', () => {
    renderWithTheme(
      <Text size={1} color="blue">
        Outer <Text weight="bold">inner</Text>
      </Text>,
    )
    const inner = styleOf('inner')
    expect(inner.fontSize).toBeUndefined()
    expect(inner.color).toBeUndefined()
    expect(inner.fontWeight).toBe('700')
  })

  it('nested Text with an explicit size still applies it', () => {
    renderWithTheme(
      <Text size={1}>
        Outer <Text size={5}>big</Text>
      </Text>,
    )
    expect(styleOf('big').fontSize).toBe(20)
  })
})

describe('Link', () => {
  it('inherits size and is underlined inside running text', () => {
    renderWithTheme(
      <Text size={1}>
        Read <Link href="https://example.com">more</Link>
      </Text>,
    )
    const link = styleOf('more')
    expect(link.fontSize).toBeUndefined()
    expect(link.color).toBe(indigo.light.a11)
    expect(link.textDecorationLine).toBe('underline')
  })

  it('standalone link: size 3, no underline in auto mode', () => {
    renderWithTheme(<Link>Standalone</Link>)
    expect(styleOf('Standalone')).toMatchObject({ fontSize: 16, textDecorationLine: 'none' })
    expect(screen.getByRole('link')).toBeTruthy()
  })
})

describe('Code', () => {
  it('renders at 0.95em of the surrounding text and uses a monospace font', () => {
    renderWithTheme(
      <Text size={5}>
        Run <Code>yarn</Code>
      </Text>,
    )
    const code = styleOf('yarn')
    expect(code.fontSize).toBe(19) // 20 * 0.95
    expect(code.fontFamily).toBeTruthy()
  })
})

describe('Heading', () => {
  it('has the header role and passes its size to nested text', () => {
    renderWithTheme(
      <Heading size={8}>
        Title <Strong>bold</Strong>
      </Heading>,
    )
    expect(screen.getByRole('header')).toBeTruthy()
    expect(styleOf('bold').fontSize).toBeUndefined()
  })
})
