import React from 'react'
import { BaseButton } from '../internal/BaseButton'
import type { BaseButtonProps, BaseButtonSize, BaseButtonVariant } from '../internal/BaseButton'

export type ButtonSize = BaseButtonSize
export type ButtonVariant = BaseButtonVariant

export interface ButtonProps extends BaseButtonProps {
  /** Button content: text, icons, or both (its Control label). */
  children?: React.ReactNode
}

export function Button(props: ButtonProps) {
  return <BaseButton {...props} />
}
Button.displayName = 'Button'
