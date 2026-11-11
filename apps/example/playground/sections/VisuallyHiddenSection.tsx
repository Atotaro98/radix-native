import React from 'react'
import { IconButton, VisuallyHidden } from 'radix-native'
import { ComponentSection } from '../ui'

// U+2699 gear + VS15 so iOS draws it as text (tinted), not as an emoji.
const GEAR = '\u2699\uFE0E'

/** Radix primitive docs: a gear icon button named "Settings" by hidden text. */
function Docs() {
  return (
    <IconButton variant="soft">
      {GEAR}
      <VisuallyHidden>Settings</VisuallyHidden>
    </IconButton>
  )
}

export function VisuallyHiddenSection() {
  return <ComponentSection title="VisuallyHidden" tabs={[{ id: 'docs', label: 'Example', render: () => <Docs /> }]} />
}
