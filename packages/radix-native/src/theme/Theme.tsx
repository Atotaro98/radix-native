import React from 'react'
import { ThemeContext } from './ThemeContext'
import { ThemeRoot } from './ThemeRoot'
import { ThemeImpl } from './ThemeImpl'
import type { ThemeProps } from './theme.types'

export function Theme(props: ThemeProps) {
  const context = React.useContext(ThemeContext)
  const isRoot = context === undefined
  return isRoot ? <ThemeRoot {...props} /> : <ThemeImpl {...props} />
}
Theme.displayName = 'Theme'
