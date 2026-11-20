import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { Text as RNText } from 'react-native'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import { useControllableState } from '../../hooks/useControllableState'
import { useMargins } from '../../hooks/useMargins'
import type { AccentColor } from '../../tokens/colors/types'
import type { MarginProps } from '../../types/marginProps'

type SelectionType = 'single' | 'multiple'

/** The value of a Selection group: one option, or several. */
export type SelectionValue<T extends SelectionType> = T extends 'single' ? string : string[]

export interface SelectionRootProps<T extends SelectionType, Shared> {
  value?: SelectionValue<T>
  defaultValue?: SelectionValue<T>
  onValueChange?: (value: SelectionValue<T>) => void
  /** Disables every item; an item cannot re-enable itself. */
  disabled?: boolean
  /** Props every item inherits (size, variant, color, …). */
  shared: Shared
  children?: React.ReactNode
}

export interface SelectionItem<Shared> {
  checked: boolean
  disabled: boolean
  /** Single: selects this item. Multiple: toggles it. No-op when disabled. */
  select: () => void
  shared: Shared
}

interface ContextValue<Shared> {
  shared: Shared
  disabled: boolean
  isChecked: (value: string) => boolean
  select: (value: string) => void
}

/**
 * Internal: the semantics of a Selection group, as Radix's CheckboxGroup /
 * RadioGroup primitives — the value (one or several), controlled or not,
 * and what items inherit. Each family gets its own instance, so an item only
 * connects to a Root of the same family. Rendering stays with the family.
 */
export function createSelectionGroup<T extends SelectionType, Shared>({ name, type }: { name: string; type: T }) {
  const Context = createContext<ContextValue<Shared> | null>(null)
  const empty = (type === 'single' ? '' : []) as SelectionValue<T>

  function SelectionRoot({ value: valueProp, defaultValue, onValueChange, disabled = false, shared, children }: SelectionRootProps<T, Shared>) {
    const [value, setValue] = useControllableState<SelectionValue<T>>({
      prop: valueProp,
      defaultProp: defaultValue ?? empty,
      onChange: onValueChange,
    })

    const select = useCallback((item: string) => {
      if (type === 'single') {
        setValue(item as SelectionValue<T>)
        return
      }
      // Functional update: two quick toggles never work on a stale array.
      setValue(prev => {
        const list = prev as string[]
        return (list.includes(item) ? list.filter(v => v !== item) : [...list, item]) as SelectionValue<T>
      })
    }, [setValue])

    const ctx = useMemo<ContextValue<Shared>>(() => ({
      shared,
      disabled,
      isChecked: item => (type === 'single' ? value === item : (value as string[]).includes(item)),
      select,
    }), [shared, disabled, value, select])

    return <Context.Provider value={ctx}>{children}</Context.Provider>
  }

  function useSelectionItem(value: string, disabled?: boolean): SelectionItem<Shared> {
    const ctx = useContext(Context)
    if (!ctx) throw new Error(`${name}.Item must be used within ${name}.Root`)
    const isDisabled = ctx.disabled || disabled === true
    const { select: selectValue } = ctx
    const select = useCallback(() => {
      if (!isDisabled) selectValue(value)
    }, [isDisabled, selectValue, value])
    return { checked: ctx.isChecked(value), disabled: isDisabled, select, shared: ctx.shared }
  }

  return { Root: SelectionRoot, useItem: useSelectionItem }
}

// ─── Family shell ─────────────────────────────────────────────────────────────

/** What every item of a Selection group inherits from its Root. */
export interface SelectionShared<S, V> {
  size: S
  variant: V
  color?: AccentColor
  highContrast?: boolean
}

/** The Root props every Selection group family takes. */
export interface SelectionFamilyRootProps<T extends SelectionType, S, V> extends MarginProps {
  /** Item size. Default: 2. */
  size?: S
  /** Visual variant. Default: 'surface'. */
  variant?: V
  /** Accent color. Default: theme accent. */
  color?: AccentColor
  /** Increases color contrast with the background. */
  highContrast?: boolean
  /** Controlled selection: one value (single) or several (multiple). */
  value?: SelectionValue<T>
  /** Uncontrolled default selection. */
  defaultValue?: SelectionValue<T>
  /** Called when the selection changes. */
  onValueChange?: (value: SelectionValue<T>) => void
  /** Disables every item in the group. */
  disabled?: boolean
  /** Group children (`.Item`). */
  children?: React.ReactNode
  /** Accessible name for the whole group. */
  accessibilityLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
}

/** What a family's layout receives: the group's container props and the family's own Root props. */
export interface SelectionLayoutProps<Extra> {
  role: 'group' | 'radiogroup'
  accessibilityLabel?: string
  testID?: string
  style: StyleProp<ViewStyle>
  extra: Extra
  children?: React.ReactNode
}

interface SelectionFamilyConfig<T extends SelectionType, S, V, Extra, ItemProps extends { value: string; disabled?: boolean }> {
  name: string
  type: T
  /** Radix: `group` for checkboxes, `radiogroup` for radios. */
  rootRole: 'group' | 'radiogroup'
  size: S
  /** How the items are laid out (a column, a grid of cards). */
  Layout: React.ComponentType<SelectionLayoutProps<Extra>>
  /** How one item renders, from its state in the group and its own props. */
  Item: React.ComponentType<ItemProps & { item: SelectionItem<SelectionShared<S, V>> }>
}

/**
 * Internal: a Selection group family — CheckboxGroup, RadioGroup, CheckboxCards,
 * RadioCards. Owns the Root (value, disabled propagation, what items inherit,
 * margins, the container's role and name) and wires each Item to the group; a
 * family brings only its layout and its item view. Every family is one call.
 */
export function createSelectionFamily<
  T extends SelectionType,
  S,
  V,
  Extra extends object,
  ItemProps extends { value: string; disabled?: boolean },
>({ name, type, rootRole, size: defaultSize, Layout, Item: ItemView }: SelectionFamilyConfig<T, S, V, Extra, ItemProps>) {
  const Selection = createSelectionGroup<T, SelectionShared<S, V>>({ name, type })

  function Root(props: SelectionFamilyRootProps<T, S, V> & Extra) {
    const {
      size = defaultSize,
      variant = 'surface' as V,
      color,
      highContrast,
      value,
      defaultValue,
      onValueChange,
      disabled,
      children,
      accessibilityLabel,
      testID,
      m, mx, my, mt, mr, mb, ml,
      style,
      ...extra
    } = props
    const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
    const shared = useMemo<SelectionShared<S, V>>(() => ({ size, variant, color, highContrast }), [size, variant, color, highContrast])
    return (
      <Selection.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled} shared={shared}>
        <Layout role={rootRole} accessibilityLabel={accessibilityLabel} testID={testID} style={[margins, style]} extra={extra as unknown as Extra}>
          {children}
        </Layout>
      </Selection.Root>
    )
  }
  Root.displayName = `${name}.Root`

  function Item(props: ItemProps) {
    const item = Selection.useItem(props.value, props.disabled)
    return <ItemView {...props} item={item} />
  }
  Item.displayName = `${name}.Item`

  return Object.assign(Root, { Root, Item })
}

/** An item's content: plain strings and numbers in one Text with the item's label style, anything else as given. */
export function renderItemLabel(
  children: React.ReactNode,
  label: { style: StyleProp<TextStyle>; textProps: object },
  style?: StyleProp<TextStyle>,
): React.ReactNode {
  if (typeof children !== 'string' && typeof children !== 'number') return children
  return <RNText {...label.textProps} style={[label.style, style]}>{children}</RNText>
}
