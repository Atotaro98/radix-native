# radix-native

A React Native port of Radix Themes. This glossary names the concepts the library is built around, so that code, docs and design discussions use the same words.

## Principles

**Radix parity**:
Matching the behaviour and values of Radix Themes on the web, adapted only where React Native forces a difference; every such difference is recorded in `llm/differences.md`.
_Avoid_: Radix-like, inspired by Radix

## Typography

**Text style**:
Everything that decides how a piece of text renders: size, line height, letter spacing, font face, font style, font scaling cap, wrapping, and what it inherits from or passes on to nested text. Every text-rendering module, including controls with internal labels, gets its Text style from one place.
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
Text rendered inside another radix-native text module. It flows inline, inherits size and color from its parent, and takes no layout of its own.
_Avoid_: inline child, sub-text

## Color

**Variant**:
The look a consumer asks a component for: `solid`, `soft`, `surface`, `outline`, `ghost` or `classic`. A variant names an appearance, not a set of colors; what it means in colors depends on the component's Variant family.
_Avoid_: style, appearance (reserved for light/dark)

**Variant family**:
A group of components that Radix colors with the same rules: buttons (Button, IconButton), chips (Badge, Code, Avatar), selection controls (Checkbox, Radio), tracks (Switch, Progress), cards (Card, CheckboxCards, RadioCards), text inputs (TextField, TextArea) and text (Text, Heading, Link, Blockquote). Components in one family may still differ where Radix itself differs.
_Avoid_: color family, component group

**Variant recipe**:
How a Variant family turns each Variant and state (high contrast, checked, disabled, pressed, focused) into the colors of its parts (background, text, border, indicator, track, thumb, placeholder), taken from Radix. Where Radix is inconsistent between families, each recipe keeps Radix's value rather than unifying.
_Avoid_: generic palette, color scheme, theme colors

## Controls

**Control label**:
The single row of content inside a Button, IconButton or Badge: runs of text and icons. Adjacent text reads as one piece of Compact text in the control's Text style, kept to one line; icons take the control's text color unless they set their own. While a button is loading, its Control label stays readable by screen readers even though it is hidden on screen.
_Avoid_: content, children, button text
