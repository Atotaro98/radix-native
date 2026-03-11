import React from 'react'
import { Theme } from './Theme'
import type { ThemeProps } from './theme.types'

/**
 * Factory that creates a pre-configured Theme component.
 * Useful for white-label or multi-brand applications.
 */
export function createTheme(
  config: Omit<ThemeProps, 'children'>,
): (props: { children: React.ReactNode }) => React.JSX.Element {
  function ThemeProvider({ children }: { children: React.ReactNode }) {
    return <Theme {...config}>{children}</Theme>
  }
  ThemeProvider.displayName = 'ThemeProvider'
  return ThemeProvider
}
