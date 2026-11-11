# radix-native

A React Native port of Radix Themes. This glossary names the concepts the library is built around, so that code, docs and design discussions use the same words.

## Principles

**Radix parity**:
Matching the behaviour and values of Radix Themes on the web, adapted only where React Native forces a difference; every such difference is recorded in `llm/differences.md`.
_Avoid_: Radix-like, inspired by Radix

## Theme

**Theme**:
The settings every component reads: appearance, accent color, gray color, radius, scaling, fonts, color overrides and the Font scaling cap. A nested Theme inherits all of them from its parent and overrides only what it sets.
_Avoid_: provider, config, global theme

**Metrics**:
The pixel values a component derives from the Theme — spacing, sizes and radius — with the Theme's scaling and radius factor already applied the way Radix applies them. A radius takes one of Radix's shapes: a plain step, a pill or a thumb. A radius relative to the text size comes from the Text style instead.
_Avoid_: sizes, dimensions, tokens (for resolved values)

**Layout props**:
The spacing, size, position and background props that the layout primitives (Box, Flex, Grid) share, resolved with the Theme's Metrics the way Radix resolves its layout props. Padding and margin read from the most specific side first, then the axis, then all sides.
_Avoid_: style props, box props

## Typography

**Text style**:
Everything that decides how a piece of text renders: size, line height, letter spacing, font face, font style, font scaling cap, wrapping, and what it inherits from or passes on to nested text. It also gives the lengths and radius Radix writes relative to the text size (in em), measured on the text's own size. Every text-rendering module, including controls with internal labels, gets its Text style from one place.
_Avoid_: typography (for the whole concept), font props, text config

**Text role**:
The typographic part a piece of text plays, taken from Radix: `default`, `heading`, `code`, `strong`, `em` or `quote`. Each role carries its own font family, relative size, style, weight and letter-spacing offset.
_Avoid_: font role, text variant, text type

**Weight intent**:
The weight a piece of text asks for (`light`, `regular`, `medium`, `bold`), as distinct from the font face that ends up rendering it. When no face is configured for that weight, the intent is reported as unmet rather than silently dropped.
_Avoid_: font weight (when the configured face is meant)

**Compact text**:
Text inside a control that grows with its label (a Control label, Kbd, TextField, TextArea) but whose layout would break under unbounded accessibility font scaling, so it gets a default Font scaling cap of 2. Text in a truly fixed-size box (Avatar initials) is capped at 1 instead.
_Avoid_: small text, control text

**Font scaling cap**:
The maximum multiplier that system accessibility font scaling may apply to a piece of text. It can be set on the text itself or globally on the Theme.
_Avoid_: max font, font multiplier

**Nested text**:
Text rendered inside another radix-native text module. It flows inline, inherits color from its parent, and takes no layout of its own. Its size is the closest surrounding text's size scaled by its own Text role (an Em inside a Text is 1.18×, a Code inside that Em is 0.95× the Em), except that a role nested in itself keeps the outer size.
_Avoid_: inline child, sub-text

## Color

**Variant**:
The look a consumer asks a component for: `solid`, `soft`, `surface`, `outline`, `ghost` or `classic`. A variant names an appearance, not a set of colors; what it means in colors depends on the component's Variant family.
_Avoid_: style, appearance (reserved for light/dark)

**Variant family**:
A group of components that Radix colors with the same rules: buttons (Button, IconButton), chips (Badge, Code, Avatar), selection controls (Checkbox, Radio), tracks (Switch, Progress, Slider), cards (Card, CheckboxCards, RadioCards), text inputs (TextField, TextArea), callouts (Callout), segmented (SegmentedControl), menus (DropdownMenu, ContextMenu) and text (Text, Heading, Link, Blockquote). Components in one family may still differ where Radix itself differs.
_Avoid_: color family, component group

**Variant recipe**:
How a Variant family turns each Variant and state (high contrast, checked, disabled, pressed, focused) into the colors of its parts (background, text, border, indicator, track, thumb, placeholder), and into their drop shadows and classic bevel, taken from Radix. Where Radix is inconsistent between families, each recipe keeps Radix's value rather than unifying.
_Avoid_: generic palette, color scheme, theme colors

## Controls

**Control label**:
The single row of content inside a Button, IconButton or Badge: runs of text and icons. Adjacent text reads as one piece of Compact text in the control's Text style, kept to one line; icons take the control's text color unless they set their own. While a button is loading, its Control label stays readable by screen readers even though it is hidden on screen.
_Avoid_: content, children, button text

**Toggle**:
A control with a checked state the user flips by pressing it: Checkbox, Radio or Switch. Its role decides what a press does (a Checkbox toggles and leaves indeterminate as checked, a Radio only checks, a Switch toggles) and how the state is announced. What a Toggle looks like is its Indicator, which is drawn apart from the behaviour.
_Avoid_: selection control (that is a Variant family), input

**Indicator**:
The visual part of a Toggle — the box and check, the ring and dot, the track and thumb — drawn from the checked state alone, with no behaviour of its own. Rows and cards that act as a Toggle show an Indicator without containing a second Toggle.
_Avoid_: control (for the visual part), icon

**Toggle surface**:
The pressable part shared by everything that acts as a Toggle: a Toggle itself, a labelled row of a Selection group, and a Selection card. It decides the role, how the checked state is announced, the disabled gate, the press scale, the minimum touch target and the focus ring. It holds no checked state of its own; it receives it from the Toggle or from the Selection group. The focus ring surrounds the Indicator, except on a card, where it follows the card's edge.
_Avoid_: pressable, toggle shell, base toggle

**Text input**:
A field the user types into: TextField (one line) or TextArea (several lines). Both behave the same and differ only in line count, height and radius. A read-only Text input looks like a disabled one, but stays readable and copyable.
_Avoid_: input, field (on their own)

**Selection group**:
A set of options where the user picks one (RadioGroup, RadioCards) or several (CheckboxGroup, CheckboxCards). The group owns the value and passes its size, variant, color and disabled state down to its items; a disabled group disables every item.
_Avoid_: group (on its own), option list

**Selection card**:
An item of CheckboxCards or RadioCards: a card that acts as a Toggle inside a Selection group, takes its size from the group's size, and is announced as one checkbox or radio named by its content. A checkbox card shows its Indicator at the trailing edge; a radio card shows none and marks its checked state with a ring.
_Avoid_: card item, option card

## Overlays

**Overlay**:
Content shown above the rest of the screen, outside the layout flow, that the user can dismiss. It takes its Theme from where its content is placed among the components, not from where it ends up drawn on screen.
_Avoid_: popup, modal (on its own), sheet

**Modal overlay**:
An Overlay that blocks interaction with everything else until it is closed: Dialog and AlertDialog.
_Avoid_: modal (on its own), dialog (for the whole category)

**Anchored overlay**:
An Overlay placed relative to the element that triggered it, its anchor: Popover, Tooltip, HoverCard, DropdownMenu, ContextMenu and the content of a Select. Popover and HoverCard are not modal: touching outside closes them and still reaches what is underneath. Menus and Select block that touch.
_Avoid_: floating element, dropdown (for the whole category)
