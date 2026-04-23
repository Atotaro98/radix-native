// radix-native — public entry point

// Theme
export { Theme } from './theme/Theme'
export { createTheme } from './theme/createTheme'
export { useThemeContext } from './hooks/useThemeContext'
export { useColor } from './hooks/useColor'
export type { ColorName, ColorStep, SolidStep, AlphaStep } from './hooks/useResolveColor'
export { useResolveSpace } from './hooks/useResolveSpace'
export { useMargins } from './hooks/useMargins'
export { usePressScale, AnimatedPressable } from './hooks/usePressScale'
export type {
  ThemeProps,
  ThemeContextValue,
  ThemeAppearance,
  ThemeColor,
  ThemeFonts,
  ColorScaleOverride,
  ColorOverrides,
  AccentColor,
  GrayColor,
  RadiusToken,
  ScalingMode,
  ThemeChangeHandlers,
} from './theme/theme.types'

// Native prop types
export type { NativeViewProps, NativePressableProps, NativeTextProps } from './types/nativeProps'
export type { MarginProps } from './types/marginProps'

// Utils
export { applyScaling } from './utils/applyScaling'
export { resolveSpace } from './utils/resolveSpace'
export { resolveColor } from './utils/resolveColor'
export { getClassicEffect } from './utils/classicEffect'
export { resolveFont, FONT_WEIGHT } from './utils/resolveFont'

// Components — Layout
export { Box, type BoxProps } from './components/layout'
export {
  Flex, type FlexProps, type FlexDirection, type FlexAlign, type FlexJustify, type FlexWrap,
} from './components/layout'
export {
  Grid, type GridProps, type GridAlign, type GridJustify,
} from './components/layout'
export { Separator, type SeparatorProps, type SeparatorSize } from './components/layout'
export { Card, type CardProps, type CardSize, type CardVariant } from './components/layout'

// Components — Typography
export {
  Text, type TextProps, type TextSize, type TextWeight, type TextAlign, type TextWrap,
  Heading, type HeadingProps, type HeadingSize,
  Link, type LinkProps, type LinkUnderline,
  Blockquote, type BlockquoteProps,
  Em, type EmProps,
  Strong, type StrongProps,
  Code, type CodeProps, type CodeVariant,
  Kbd, type KbdProps, type KbdVariant,
  Quote, type QuoteProps,
} from './components/typography'

// Components — Display
export {
  Badge, type BadgeProps, type BadgeSize, type BadgeVariant,
  Avatar, type AvatarProps, type AvatarSize, type AvatarVariant,
} from './components/display'

// Components — Actions
export {
  Button, type ButtonProps, type ButtonSize, type ButtonVariant,
  IconButton, type IconButtonProps, type IconButtonSize, type IconButtonVariant,
  Checkbox, type CheckboxProps, type CheckboxSize, type CheckboxVariant, type CheckedState,
  CheckboxGroup, type CheckboxGroupProps, type CheckboxGroupItemProps,
  CheckboxCards, type CheckboxCardsProps, type CheckboxCardsItemProps, type CheckboxCardsVariant,
  Switch, type SwitchProps, type SwitchSize, type SwitchVariant,
  Radio, type RadioProps, type RadioSize, type RadioVariant,
  RadioGroup, type RadioGroupProps, type RadioGroupItemProps,
  RadioCards, type RadioCardsProps, type RadioCardsItemProps, type RadioCardsVariant,
} from './components/actions'

// Components — Feedback
export {
  Spinner, type SpinnerProps, type SpinnerSize,
  Progress, type ProgressProps, type ProgressSize, type ProgressVariant,
  Skeleton, type SkeletonProps,
} from './components/feedback'

// Components — Forms
export {
  TextField, type TextFieldProps, type TextFieldSize, type TextFieldVariant,
  TextArea, type TextAreaProps, type TextAreaSize, type TextAreaVariant,
} from './components/forms'

// Playground
export { ThemeControls, type ThemeControlsProps } from './components/playground'

// Tokens
export { space, type SpaceToken, type MarginToken } from './tokens/spacing'
export { fontSize, lineHeight, headingLineHeight, letterSpacingEm, type FontSizeToken } from './tokens/typography'
export { getRadius, getFullRadius, getRadiusThumb, type RadiusLevel } from './tokens/radius'
export { scalingMap } from './tokens/scaling'
