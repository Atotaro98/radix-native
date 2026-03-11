/**
 * generate-colors.ts
 * Generates the 31 color token files into src/tokens/colors/
 * Source: @radix-ui/colors (exact hex values, unmodified)
 * Run: yarn generate:colors
 */

import * as fs from 'fs'
import * as path from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// ─── Color lists ─────────────────────────────────────────────────────────────

const ACCENT_COLORS = [
  'tomato',
  'red',
  'ruby',
  'crimson',
  'pink',
  'plum',
  'purple',
  'violet',
  'iris',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'jade',
  'green',
  'grass',
  'bronze',
  'gold',
  'brown',
  'orange',
  'amber',
  'yellow',
  'lime',
  'mint',
  'sky',
] as const

const GRAY_COLORS = ['gray', 'mauve', 'slate', 'sage', 'olive', 'sand'] as const

const ALL_COLORS = [...ACCENT_COLORS, ...GRAY_COLORS] as const

/**
 * Colors whose step 9 background requires BLACK (#21201c) text (APCA — hardcoded by Radix).
 * All other colors use white (#ffffff).
 */
const BLACK_CONTRAST_COLORS = new Set(['amber', 'yellow', 'lime', 'mint', 'sky'])

/**
 * Exact surface values from @radix-ui/themes — hardcoded per color per mode.
 * Source: packages/radix-ui-themes/src/styles/tokens/colors/{color}.css
 * These are NOT derivable from @radix-ui/colors steps — Radix defines them separately.
 */
const SURFACE_LIGHT: Record<string, string> = {
  amber:   '#fefae4cc',
  blue:    '#f1f9ffcc',
  bronze:  '#fdf5f3cc',
  brown:   '#fbf8f4cc',
  crimson: '#fef5f8cc',
  cyan:    '#eff9facc',
  gold:    '#f9f8efcc',
  grass:   '#f3faf3cc',
  gray:    '#ffffffcc',
  green:   '#f1faf4cc',
  indigo:  '#f5f8ffcc',
  iris:    '#f6f6ffcc',
  jade:    '#f1faf5cc',
  lime:    '#f6f9f0cc',
  mauve:   '#ffffffcc',
  mint:    '#effaf8cc',
  olive:   '#ffffffcc',
  orange:  '#fff5e9cc',
  pink:    '#fef5facc',
  plum:    '#fdf5fdcc',
  purple:  '#faf5fecc',
  red:     '#fff5f5cc',
  ruby:    '#fff5f6cc',
  sage:    '#ffffffcc',
  sand:    '#ffffffcc',
  sky:     '#eef9fdcc',
  slate:   '#ffffffcc',
  teal:    '#f0faf8cc',
  tomato:  '#fff6f5cc',
  violet:  '#f9f6ffcc',
  yellow:  '#fefbe4cc',
}

const SURFACE_DARK: Record<string, string> = {
  amber:   '#271f1380',
  blue:    '#11213d80',
  bronze:  '#27211d80',
  brown:   '#271f1b80',
  crimson: '#2f151f80',
  cyan:    '#11252d80',
  gold:    '#25231d80',
  grass:   '#19231b80',
  gray:    '#21212180',
  green:   '#15251d80',
  indigo:  '#171d3b80',
  iris:    '#1d1b3980',
  jade:    '#13271f80',
  lime:    '#1b211580',
  mauve:   '#22212380',
  mint:    '#15272780',
  olive:   '#1f201e80',
  orange:  '#271d1d80',
  pink:    '#31132980',
  plum:    '#2f152f80',
  purple:  '#2b173580',
  red:     '#2f151780',
  ruby:    '#2b191d80',
  sage:    '#1e201f80',
  sand:    '#21212080',
  sky:     '#13233b80',
  slate:   '#1f212380',
  teal:    '#13272580',
  tomato:  '#2d191580',
  violet:  '#25193980',
  yellow:  '#231f1380',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Maps a color name + variant to its @radix-ui/colors export key */
function toExportKey(color: string, variant: 'light' | 'dark' | 'lightA' | 'darkA'): string {
  switch (variant) {
    case 'light':
      return color
    case 'dark':
      return `${color}Dark`
    case 'lightA':
      return `${color}A`
    case 'darkA':
      return `${color}DarkA`
  }
}

/** Extracts solid steps 1-12 from an object like { blue1: '#...', blue2: '#...', ... } */
function extractSteps(obj: Record<string, string>, colorName: string): Record<number, string> {
  const steps: Record<number, string> = {}
  for (let i = 1; i <= 12; i++) {
    steps[i] = obj[`${colorName}${i}`] ?? ''
  }
  return steps
}

/** Extracts alpha steps a1-a12 from an object like { blueA1: '#...', ... } */
function extractAlphaSteps(obj: Record<string, string>, colorName: string): Record<string, string> {
  const steps: Record<string, string> = {}
  for (let i = 1; i <= 12; i++) {
    steps[`a${i}`] = obj[`${colorName}A${i}`] ?? ''
  }
  return steps
}

// ─── Generation ───────────────────────────────────────────────────────────────

const colors = require('@radix-ui/colors')

const OUTPUT_DIR = path.resolve(__dirname, '../src/tokens/colors')
fs.mkdirSync(OUTPUT_DIR, { recursive: true })

const generated: string[] = []

for (const colorName of ALL_COLORS) {
  const lightObj = colors[toExportKey(colorName, 'light')] as Record<string, string>
  const darkObj = colors[toExportKey(colorName, 'dark')] as Record<string, string>
  const lightAObj = colors[toExportKey(colorName, 'lightA')] as Record<string, string>
  const darkAObj = colors[toExportKey(colorName, 'darkA')] as Record<string, string>

  const lightSteps = extractSteps(lightObj, colorName)
  const darkSteps = extractSteps(darkObj, colorName)
  const lightAlpha = extractAlphaSteps(lightAObj, colorName)
  const darkAlpha = extractAlphaSteps(darkAObj, colorName)

  const contrast = BLACK_CONTRAST_COLORS.has(colorName) ? '#21201c' : '#ffffff'
  const lightSurf = SURFACE_LIGHT[colorName] ?? ''
  const darkSurf = SURFACE_DARK[colorName] ?? ''

  const formatScale = (
    steps: Record<number, string>,
    alpha: Record<string, string>,
    surf: string
  ) => {
    const s = steps
    const a = alpha
    return [
      `    1: '${s[1]}', 2: '${s[2]}', 3: '${s[3]}', 4: '${s[4]}',`,
      `    5: '${s[5]}', 6: '${s[6]}', 7: '${s[7]}', 8: '${s[8]}',`,
      `    9: '${s[9]}', 10: '${s[10]}', 11: '${s[11]}', 12: '${s[12]}',`,
      `    a1: '${a.a1}', a2: '${a.a2}', a3: '${a.a3}', a4: '${a.a4}',`,
      `    a5: '${a.a5}', a6: '${a.a6}', a7: '${a.a7}', a8: '${a.a8}',`,
      `    a9: '${a.a9}', a10: '${a.a10}', a11: '${a.a11}', a12: '${a.a12}',`,
      `    contrast: '${contrast}', surface: '${surf}',`,
      `    indicator: '${s[9]}', track: '${s[9]}',`,
    ].join('\n')
  }

  const content = [
    `// WARNING: Auto-generated — do not edit manually`,
    `// Source: @radix-ui/colors (exact hex values, unmodified)`,
    `// To update: yarn generate:colors`,
    ``,
    `import type { ColorScaleWithModes } from './types'`,
    ``,
    `export const ${colorName}: ColorScaleWithModes = {`,
    `  light: {`,
    formatScale(lightSteps, lightAlpha, lightSurf),
    `  },`,
    `  dark: {`,
    formatScale(darkSteps, darkAlpha, darkSurf),
    `  },`,
    `}`,
    ``,
  ].join('\n')

  fs.writeFileSync(path.join(OUTPUT_DIR, `${colorName}.ts`), content, 'utf-8')
  generated.push(colorName)
  console.log(`  ✓ ${colorName}.ts`)
}

// ─── index.ts ────────────────────────────────────────────────────────────────

const indexContent = [
  `// WARNING: Auto-generated — do not edit manually`,
  `// To update: yarn generate:colors`,
  ``,
  `export type { ColorScale, ColorScaleWithModes, AccentColor, GrayColor } from './types'`,
  ``,
  ...ALL_COLORS.map((c) => `export { ${c} } from './${c}'`),
  ``,
].join('\n')

fs.writeFileSync(path.join(OUTPUT_DIR, 'index.ts'), indexContent, 'utf-8')
console.log(`  ✓ index.ts`)

console.log(`\n✅ ${generated.length} files generated in src/tokens/colors/`)
