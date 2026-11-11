# Table

> Semantic table presentation.

## Import

```tsx
import { Table } from 'radix-native'
```

## Parts and props

- **Table.Root**: `size` (`1 | 2 | 3`, default 2), `variant` (`'surface' | 'ghost'`, default ghost), `layout` (`'auto' | 'fixed'`, default auto), margins.
- **Table.Header** / **Table.Body**: rows.
- **Table.Row**: `align` (`'start' | 'center' | 'end' | 'baseline'`, default start).
- **Table.Cell** / **Table.ColumnHeaderCell** (bold) / **Table.RowHeaderCell**: `justify` (`'start' | 'center' | 'end'`), `width` / `minWidth` / `maxWidth` (number, `'Npx'` or `'N%'` of the table), padding props `p…pl`.

## Examples

```tsx
<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.ColumnHeaderCell>Full name</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>Group</Table.ColumnHeaderCell>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.RowHeaderCell>Danilo Sousa</Table.RowHeaderCell>
      <Table.Cell>danilo@example.com</Table.Cell>
      <Table.Cell>Developer</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table.Root>
```

## Layout

RN has no table layout. Every cell reports its natural width: with `layout="auto"` each column takes its widest cell (a cell's `width` replaces its natural width; `minWidth` / `maxWidth` clamp), and a table narrower than its container grows every column in proportion. With `layout="fixed"` the first row's widths are kept and the other columns share the rest. The table is hidden for the first frame while measuring, and scrolls sideways when wider than its container. Text, Link, Code… inside a cell take the table's text size.
