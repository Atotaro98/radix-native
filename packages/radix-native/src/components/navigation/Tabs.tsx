import React, { createContext, useContext, useMemo } from 'react'
import { View } from 'react-native'
import { useControllableState } from '../../hooks/useControllableState'
import { useMargins } from '../../hooks/useMargins'
import { BaseTabList, BaseTabTrigger, type BaseTabListProps } from '../internal/BaseTabList'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TabsRootProps extends NativeViewProps, MarginProps {
  value?: string
  /** Default: '' (no tab selected), as in Radix. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /**
   * Radix: `automatic` also selects a tab when keyboard focus reaches it. On
   * touch a tab is selected by pressing it either way.
   */
  activationMode?: 'automatic' | 'manual'
}

export type TabsListProps = BaseTabListProps

export interface TabsTriggerProps extends Omit<NativeViewProps, 'children'> {
  value: string
  disabled?: boolean
  children?: React.ReactNode
}

export interface TabsContentProps extends NativeViewProps, MarginProps {
  value: string
  /** Keep the content mounted (hidden) while its tab is not selected. */
  forceMount?: true
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface TabsContextValue {
  value: string
  setValue: (v: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs(part: string): TabsContextValue {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error(`Tabs.${part} must be used within Tabs.Root`)
  return ctx
}

// ─── Parts ────────────────────────────────────────────────────────────────────

/** Set of layered sections of content, displayed one at a time, like Radix Themes `Tabs`. */
function TabsRoot({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  activationMode: _activationMode,
  m, mx, my, mt, mr, mb, ml,
  style,
  children,
  ...rest
}: TabsRootProps) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const [value, setValue] = useControllableState<string>({ prop: valueProp, defaultProp: defaultValue, onChange: onValueChange })
  const ctx = useMemo(() => ({ value, setValue: (v: string) => setValue(v) }), [value, setValue])
  return (
    <View style={[margins, style]} {...rest}>
      <TabsContext.Provider value={ctx}>{children}</TabsContext.Provider>
    </View>
  )
}
TabsRoot.displayName = 'Tabs.Root'

function TabsList(props: TabsListProps) {
  useTabs('List')
  return <BaseTabList role="tablist" {...props} />
}
TabsList.displayName = 'Tabs.List'

function TabsTrigger({ value, disabled, ...rest }: TabsTriggerProps) {
  const ctx = useTabs('Trigger')
  return (
    <BaseTabTrigger
      role="tab"
      active={ctx.value === value}
      disabled={disabled}
      onPress={() => ctx.setValue(value)}
      {...rest}
    />
  )
}
TabsTrigger.displayName = 'Tabs.Trigger'

/** Only the selected tab's content is mounted, unless `forceMount` (Radix Presence). */
function TabsContent({ value, forceMount, m, mx, my, mt, mr, mb, ml, style, children, ...rest }: TabsContentProps) {
  const ctx = useTabs('Content')
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const selected = ctx.value === value
  if (!selected && !forceMount) return null
  return (
    <View style={[margins, !selected && { display: 'none' }, style]} {...rest}>
      {children}
    </View>
  )
}
TabsContent.displayName = 'Tabs.Content'

export const Tabs = Object.assign(TabsRoot, {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
})
