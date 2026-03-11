import type { AccentColor, GrayColor } from './theme.types'

export function resolveGrayColor(accentColor: AccentColor): GrayColor {
  switch (accentColor) {
    case 'tomato':
    case 'red':
    case 'ruby':
    case 'crimson':
    case 'pink':
    case 'plum':
    case 'purple':
    case 'violet':
      return 'mauve'
    case 'iris':
    case 'indigo':
    case 'blue':
    case 'sky':
    case 'cyan':
      return 'slate'
    case 'teal':
    case 'jade':
    case 'mint':
    case 'green':
      return 'sage'
    case 'grass':
    case 'lime':
      return 'olive'
    case 'gray':
      return 'gray'
    case 'yellow':
    case 'amber':
    case 'orange':
    case 'brown':
    case 'gold':
    case 'bronze':
      return 'sand'
  }
}
