import React from 'react'
import { StyleSheet } from 'react-native'
import { screen } from '@testing-library/react-native'
import { Text, Link, Code, Heading, Strong, Em, Quote, Kbd, Button, Badge, Avatar, TextArea } from '../index'
import { SYSTEM_SERIF } from '../utils/textStyle'
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

describe('Radix parity — Strong / Em / Quote', () => {
  it('nested Strong is bold and takes no layout props', () => {
    renderWithTheme(
      <Text>
        Very <Strong>bold</Strong>
      </Text>,
    )
    const strong = styleOf('bold')
    expect(strong.fontWeight).toBe('700')
    expect(strong.flexShrink).toBeUndefined()
  })

  it('nested Em is serif italic at 1.18em with −0.025em tracking', () => {
    renderWithTheme(
      <Text size={3}>
        So <Em>much</Em>
      </Text>,
    )
    const em = styleOf('much')
    expect(em).toMatchObject({ fontSize: 19, fontStyle: 'italic', fontFamily: SYSTEM_SERIF })
    expect(em.letterSpacing).toBeCloseTo(-0.025 * 19)
    expect(em.flexShrink).toBeUndefined()
  })

  it('standalone Quote wraps children in curly quotes at 1.18 × size 3', () => {
    renderWithTheme(<Quote>Hi</Quote>)
    expect(styleOf('“Hi”')).toMatchObject({ fontSize: 19, fontStyle: 'italic', flexShrink: 1 })
  })

  it('a custom em face has its italic baked in', () => {
    renderWithTheme(
      <Text>
        So <Em>lora</Em>
      </Text>,
      { fonts: { em: 'Lora-Italic' } },
    )
    const em = styleOf('lora')
    expect(em.fontFamily).toBe('Lora-Italic')
    expect(em.fontStyle).toBeUndefined()
  })
})

describe('Custom fonts', () => {
  it('a weight with no configured face renders with fonts.regular and warns once', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    renderWithTheme(
      <>
        <Text weight="medium">first</Text>
        <Text weight="medium">second</Text>
      </>,
      { fonts: { regular: 'Inter' } },
    )
    expect(styleOf('first')).toMatchObject({ fontFamily: 'Inter' })
    expect(styleOf('first').fontWeight).toBeUndefined()
    expect(warn.mock.calls.filter(([msg]) => String(msg).includes('"medium"'))).toHaveLength(1)
    warn.mockRestore()
  })

  it('uses the exact face when configured', () => {
    renderWithTheme(<Text weight="bold">heavy</Text>, { fonts: { regular: 'Inter', bold: 'Inter-Bold' } })
    expect(styleOf('heavy').fontFamily).toBe('Inter-Bold')
  })
})

describe('Font scaling cap', () => {
  const capOf = (text: string) => screen.getByText(text).props.maxFontSizeMultiplier

  it('body text has no cap; compact text defaults to 2', () => {
    renderWithTheme(
      <>
        <Text>body</Text>
        <Button>press</Button>
        <Badge>tag</Badge>
        <Kbd>K</Kbd>
      </>,
    )
    expect(capOf('body')).toBeUndefined()
    expect(capOf('press')).toBe(2)
    expect(capOf('tag')).toBe(2)
    expect(capOf('K')).toBe(2)
  })

  it('the Theme cap applies everywhere and a local cap wins', () => {
    renderWithTheme(
      <>
        <Text>body</Text>
        <Button>press</Button>
        <Button maxFontSizeMultiplier={3}>local</Button>
      </>,
      { maxFontSizeMultiplier: 1.5 },
    )
    expect(capOf('body')).toBe(1.5)
    expect(capOf('press')).toBe(1.5)
    expect(capOf('local')).toBe(3)
  })

  it('Avatar initials stay capped at 1', () => {
    renderWithTheme(<Avatar fallback="AB" />, { maxFontSizeMultiplier: 3 })
    expect(capOf('AB')).toBe(1)
  })

  it('TextArea is compact text', () => {
    renderWithTheme(<TextArea testID="area" />)
    expect(screen.getByTestId('area').props.maxFontSizeMultiplier).toBe(2)
  })
})

describe('Kbd', () => {
  it('forwards native view props', () => {
    renderWithTheme(<Kbd testID="key">⌘</Kbd>)
    expect(screen.getByTestId('key')).toBeTruthy()
  })
})
