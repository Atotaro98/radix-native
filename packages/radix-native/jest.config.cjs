/** @type {import('jest').Config} */
module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  // Resolve react-native-worklets to its JS (non-native) implementation
  resolver: 'react-native-worklets/jest/resolver',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-reanimated|react-native-worklets)/)',
  ],
}
