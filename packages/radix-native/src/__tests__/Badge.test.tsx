import React from 'react'
import { Text as RNText } from 'react-native'
import { screen } from '@testing-library/react-native'
import { Badge } from '../index'
import { renderWithTheme } from './helpers/render'
import { indigo } from '../tokens/colors'

function Icon(props: { color?: string }) {
  return <RNText testID="icon">{props.color ?? 'none'}</RNText>
}

describe('Badge', () => {
  it('renders an icon next to text, tinting the icon with the text color', () => {
    renderWithTheme(
      <Badge>
        <Icon />
        New {2}
      </Badge>,
    )
    expect(screen.getByText('New 2')).toBeTruthy()
    // soft badge text → accent-a11
    expect(screen.getByTestId('icon')).toHaveTextContent(indigo.light.a11)
  })

  it('keeps an icon color the consumer set', () => {
    renderWithTheme(
      <Badge>
        <Icon color="#123456" />
        Beta
      </Badge>,
    )
    expect(screen.getByTestId('icon')).toHaveTextContent('#123456')
  })

  it('keeps its label to one line', () => {
    renderWithTheme(<Badge>Very long status label</Badge>)
    expect(screen.getByText('Very long status label').props.numberOfLines).toBe(1)
  })
})
