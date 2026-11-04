import React from 'react'
import { isDev } from '../../utils/env'
import { BaseButton } from '../internal/BaseButton'
import type { BaseButtonProps, BaseButtonSize, BaseButtonVariant } from '../internal/BaseButton'

export type IconButtonSize = BaseButtonSize
export type IconButtonVariant = BaseButtonVariant

export interface IconButtonProps extends Omit<BaseButtonProps, 'maxFontSizeMultiplier'> {
  /**
   * Icon element. Icon-only buttons have no text for screen readers:
   * always pass an `accessibilityLabel` (a dev warning is logged otherwise).
   */
  children?: React.ReactNode
}

export function IconButton(props: IconButtonProps) {
  const hasLabel = !!props.accessibilityLabel
  React.useEffect(() => {
    if (isDev && !hasLabel) {
      console.warn('[radix-native] IconButton has no `accessibilityLabel`; screen readers will announce it as an unlabeled button.')
    }
  }, [hasLabel])

  return <BaseButton {...props} iconOnly />
}
IconButton.displayName = 'IconButton'
