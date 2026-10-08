// Used by Jest only — the library build uses unbuild/esbuild.
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Turns animated-style callbacks into worklets (as in a consumer app)
  plugins: ['react-native-worklets/plugin'],
}
