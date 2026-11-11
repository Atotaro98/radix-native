import { createContext, useContext } from 'react'

/**
 * True inside a control that screen readers announce as one element (a button,
 * a pressable Card). Content there must not become its own accessibility
 * element — on Android an `accessible` child turns into a separate focus stop —
 * so it contributes only its label, which the control reads as part of its name.
 */
export const AccessibleControlContext = createContext(false)

export function useIsInsideAccessibleControl(): boolean {
  return useContext(AccessibleControlContext)
}
