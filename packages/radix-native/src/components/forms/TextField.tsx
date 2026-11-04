import React from 'react'
import { BaseTextInput } from '../internal/BaseTextInput'
import type { BaseTextInputProps, BaseTextInputSize, BaseTextInputVariant } from '../internal/BaseTextInput'

export type TextFieldSize = BaseTextInputSize
export type TextFieldVariant = BaseTextInputVariant
export type TextFieldProps = BaseTextInputProps

/** A one-line Text input. */
export function TextField(props: TextFieldProps) {
  return <BaseTextInput {...props} />
}
TextField.displayName = 'TextField'
