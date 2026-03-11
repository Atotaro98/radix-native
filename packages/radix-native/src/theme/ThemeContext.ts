import React from 'react'
import type { ThemeContextValue } from './theme.types'

export const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)
