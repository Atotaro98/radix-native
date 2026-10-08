import React from 'react'
import { render } from '@testing-library/react-native'
import { Theme } from '../../theme/Theme'
import type { ThemeProps } from '../../theme/theme.types'

/** Renders `ui` inside a root `<Theme>` (light appearance by default). */
export function renderWithTheme(
  ui: React.ReactElement,
  themeProps: Omit<ThemeProps, 'children'> = {},
) {
  return render(
    <Theme appearance="light" {...themeProps}>
      {ui}
    </Theme>,
  )
}
