import React from 'react'
import { BaseButton } from '../internal/BaseButton'
import type { BaseButtonProps, BaseButtonSize, BaseButtonVariant } from '../internal/BaseButton'

export type IconButtonSize = BaseButtonSize
export type IconButtonVariant = BaseButtonVariant

export interface IconButtonProps extends Omit<BaseButtonProps, 'maxFontSizeMultiplier'> {
  /**
   * Icon element. Icon-only buttons have no text for screen readers: pass an
   * `accessibilityLabel`, or label the content with `AccessibleIcon` or
   * `VisuallyHidden` as in Radix (a dev warning is logged otherwise).
   */
  children?: React.ReactNode
}

export function IconButton(props: IconButtonProps) {
  return <BaseButton {...props} iconOnly />
}
IconButton.displayName = 'IconButton'
