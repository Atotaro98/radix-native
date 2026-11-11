import React from 'react'
import { View } from 'react-native'
import { useIsInsideAccessibleControl } from '../internal/accessibleControl'

export interface AccessibleIconProps {
  /** The text screen readers announce in place of the icon. */
  label: string
  /** Exactly one icon element. */
  children: React.ReactElement
  /**
   * Passed on to the icon when it sets no `color` itself. Buttons and Badges give
   * it their text color (Control label), so a labelled icon is tinted like a bare one.
   */
  color?: string
}

/**
 * Makes an icon accessible by giving it a label, like Radix `AccessibleIcon`.
 * Radix hides the icon (`aria-hidden`) and adds a visually hidden sibling with
 * the label; RN cannot add a sibling, so the icon is wrapped in a View that
 * carries the label and hides the icon from screen readers. Standalone, that
 * View is an image named by the label; inside a button or pressable Card it is
 * not a separate element and the label becomes part of the control's name.
 */
export function AccessibleIcon({ label, children, color }: AccessibleIconProps) {
  const insideControl = useIsInsideAccessibleControl()
  const only = React.Children.only(children) as React.ReactElement<{ color?: string }>
  const icon = color !== undefined && only.props.color === undefined ? React.cloneElement(only, { color }) : only

  return (
    <View
      accessible={!insideControl}
      accessibilityRole={insideControl ? undefined : 'image'}
      accessibilityLabel={label}
    >
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {icon}
      </View>
    </View>
  )
}
AccessibleIcon.displayName = 'AccessibleIcon'
