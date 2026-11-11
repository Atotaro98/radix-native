import { createDialog } from '../internal/BaseDialog'

export type { DialogRootProps, DialogContentProps, DialogSlotProps, DialogSize } from '../internal/BaseDialog'

const parts = createDialog({ alert: false, name: 'Dialog' })

/**
 * Window overlaid on the primary window, like Radix Themes `Dialog`: a press
 * on the backdrop or the Android back button closes it.
 */
export const Dialog = Object.assign(parts.Root, {
  Root: parts.Root,
  Trigger: parts.Trigger,
  Content: parts.Content,
  Title: parts.Title,
  Description: parts.Description,
  Close: parts.Close,
})
