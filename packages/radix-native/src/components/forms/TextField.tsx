import React from 'react'
import { BaseTextInput, TextFieldSlot } from '../internal/BaseTextInput'
import type { BaseTextInputProps, BaseTextInputSize, BaseTextInputVariant, TextFieldSlotProps } from '../internal/BaseTextInput'

export type TextFieldSize = BaseTextInputSize
export type TextFieldVariant = BaseTextInputVariant
export interface TextFieldProps extends BaseTextInputProps {
  /** `TextField.Slot` elements: icons or buttons inside the field. */
  children?: React.ReactNode
}
export type { TextFieldSlotProps }

/** A one-line Text input (Radix `TextField.Root`); `TextField.Slot` children sit inside it. */
function TextFieldRoot(props: TextFieldProps) {
  return <BaseTextInput {...props} />
}
TextFieldRoot.displayName = 'TextField'

export const TextField = Object.assign(TextFieldRoot, { Root: TextFieldRoot, Slot: TextFieldSlot })
