import React from 'react'
import { ScrollView, Text } from 'react-native'
import { screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { ScrollArea } from '../components/layout/ScrollArea'

const scrollViews = () => screen.UNSAFE_getAllByType(ScrollView)

describe('ScrollArea', () => {
  it('scrollbars="vertical" scrolls only vertically', () => {
    renderWithTheme(<ScrollArea scrollbars="vertical"><Text>x</Text></ScrollArea>)
    expect(scrollViews()).toHaveLength(1)
    expect(scrollViews()[0].props.horizontal).toBeFalsy()
  })

  it('scrollbars="horizontal" scrolls only horizontally', () => {
    renderWithTheme(<ScrollArea scrollbars="horizontal"><Text>x</Text></ScrollArea>)
    expect(scrollViews()).toHaveLength(1)
    expect(scrollViews()[0].props.horizontal).toBe(true)
  })

  it('defaults to both axes: a horizontal ScrollView inside a vertical one', () => {
    renderWithTheme(<ScrollArea><Text>x</Text></ScrollArea>)
    const [outer, inner] = scrollViews()
    expect([outer.props.horizontal, inner.props.horizontal]).toEqual([undefined, true])
  })

  it('forwards the ref to the outer ScrollView', () => {
    const ref = React.createRef<React.ComponentRef<typeof ScrollView>>()
    renderWithTheme(<ScrollArea ref={ref} scrollbars="vertical"><Text>x</Text></ScrollArea>)
    expect(ref.current).toBeTruthy()
  })
})

describe('ScrollArea both axes', () => {
  it('stacks children in a column inside the horizontal ScrollView', () => {
    renderWithTheme(<ScrollArea><Text>a</Text><Text>b</Text></ScrollArea>)
    const inner = screen.UNSAFE_getAllByType(ScrollView)[1]
    const column = inner.props.children
    expect(React.Children.count(column.props.children)).toBe(2)
  })
})
