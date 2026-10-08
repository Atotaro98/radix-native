declare const __DEV__: boolean | undefined
declare const process: { env?: { NODE_ENV?: string } } | undefined

/**
 * `__DEV__` only exists under Metro / React Native. Consumers that load the
 * compiled `dist/` build (react-native-web, Node, SSR) would crash on a bare
 * `__DEV__` reference, so fall back to `process.env.NODE_ENV`.
 */
export const isDev: boolean =
  typeof __DEV__ !== 'undefined'
    ? !!__DEV__
    : typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production'
