import React from 'react'
import { BaseTextInput } from '../internal/BaseTextInput'
import type { BaseTextInputProps, BaseTextInputSize, BaseTextInputVariant } from '../internal/BaseTextInput'

export type TextAreaSize = BaseTextInputSize
export type TextAreaVariant = BaseTextInputVariant
export type TextAreaProps = BaseTextInputProps

/** A multi-line Text input, at least three lines tall. */
export function TextArea(props: TextAreaProps) {
  return <BaseTextInput {...props} multiline />
}
TextArea.displayName = 'TextArea'
