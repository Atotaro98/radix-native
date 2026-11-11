import React from 'react'
import { isDev } from '../../utils/env'
import { AccessibleIcon } from '../utilities/AccessibleIcon'
import { VisuallyHidden } from '../utilities/VisuallyHidden'
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

/** True when the content gives the button a name: text, an AccessibleIcon or VisuallyHidden content. */
function hasLabelledContent(node: React.ReactNode): boolean {
  let found = false
  React.Children.forEach(node, (child) => {
    if (found) return
    if (typeof child === 'string' || typeof child === 'number') found = String(child).trim() !== ''
    else if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
      found = child.type === AccessibleIcon || child.type === VisuallyHidden || hasLabelledContent(child.props.children)
    }
  })
  return found
}

export function IconButton(props: IconButtonProps) {
  const hasLabel = !!props.accessibilityLabel || hasLabelledContent(props.children)
  React.useEffect(() => {
    if (isDev && !hasLabel) {
      console.warn('[radix-native] IconButton has no `accessibilityLabel`; screen readers will announce it as an unlabeled button.')
    }
  }, [hasLabel])

  return <BaseButton {...props} iconOnly />
}
IconButton.displayName = 'IconButton'
