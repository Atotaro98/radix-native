import React from 'react'
import { ThemeContext } from '../theme/ThemeContext'
import type { ThemeContextValue } from '../theme/theme.types'

export function useThemeContext(): ThemeContextValue {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('`useThemeContext` must be used within a `Theme`')
  }
  return context
}
