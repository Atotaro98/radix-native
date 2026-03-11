const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Watch all files in the monorepo
config.watchFolders = [monorepoRoot]

// Resolve modules from the monorepo root (for workspace packages)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

// Enable the react-native export condition so Metro uses src/index.ts directly
config.resolver.unstable_conditionNames = ['react-native', 'require', 'default']

// Handle TypeScript source from workspace packages
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx']

module.exports = config
