import { createDialog } from '../internal/BaseDialog'

const parts = createDialog({ alert: true, name: 'AlertDialog' })

/**
 * Modal confirmation dialog that interrupts the user and expects a response,
 * like Radix Themes `AlertDialog`: a backdrop press does nothing; Action and
 * Cancel close it (the Android back button too, as Escape does in Radix).
 */
export const AlertDialog = Object.assign(parts.Root, {
  Root: parts.Root,
  Trigger: parts.Trigger,
  Content: parts.Content,
  Title: parts.Title,
  Description: parts.Description,
  /** Closes; run the action in the child's own `onPress`. */
  Action: parts.Close,
  /** Closes without acting. */
  Cancel: parts.Close,
})
