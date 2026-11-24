import React from 'react'

/** A piece of a component's content: a run of text, or anything else as given. */
export type ContentPiece =
  | { kind: 'text'; text: string }
  | { kind: 'node'; node: Exclude<React.ReactNode, null | undefined | boolean> }

/**
 * Internal: content as React hands it over, read the way a browser reads it.
 * Strings and numbers next to each other are one run of text, however many
 * pieces they were written in (`Option {name}` arrives as two) and whether
 * or not a fragment groups them; nothing, booleans and empty strings are no
 * content. Everything else is a node.
 */
export function contentPieces(children: React.ReactNode): ContentPiece[] {
  const pieces: ContentPiece[] = []
  const read = (nodes: React.ReactNode) => {
    React.Children.forEach(nodes, (child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        const text = String(child)
        if (text === '') return
        const last = pieces[pieces.length - 1]
        if (last?.kind === 'text') last.text += text
        else pieces.push({ kind: 'text', text })
      } else if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === React.Fragment) {
        read(child.props.children)
      } else if (child != null && typeof child !== 'boolean') {
        pieces.push({ kind: 'node', node: child })
      }
    })
  }
  read(children)
  return pieces
}

/** The content's text when it is written as text alone (in any number of pieces), else `undefined`. */
export function plainText(children: React.ReactNode): string | undefined {
  const pieces = contentPieces(children)
  return pieces.length === 1 && pieces[0].kind === 'text' ? pieces[0].text : undefined
}

/**
 * Internal: React Native throws on a string outside a Text, so every module
 * that takes content written as text renders it through here. Each run of
 * text becomes what `text` returns for it (one Text in the caller's Text
 * style); nodes stay where they are, through `node` when the caller has
 * something to add to them. Content with no text and no `node` is returned
 * as given.
 */
export function renderContentText(
  children: React.ReactNode,
  text: (value: string) => React.ReactElement,
  node?: (element: React.ReactElement<Record<string, unknown>>) => React.ReactElement,
): React.ReactNode {
  const pieces = contentPieces(children)
  if (!node && pieces.every((piece) => piece.kind === 'node')) return children
  if (pieces.length === 1 && pieces[0].kind === 'text') return text(pieces[0].text)
  return pieces.map((piece, i) => {
    if (piece.kind === 'text') return React.cloneElement(text(piece.text), { key: `text-${i}` })
    if (!React.isValidElement<Record<string, unknown>>(piece.node)) return piece.node
    return React.cloneElement(node ? node(piece.node) : piece.node, { key: piece.node.key ?? `node-${i}` })
  })
}
