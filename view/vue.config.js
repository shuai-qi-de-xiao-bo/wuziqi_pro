module.exports = {
  assetsDir: "static",
  outputDir: 'dist',
  pluginOptions: {
    quasar: {
      rtlSupport: true,
      treeShake: true,
    }
  },
  transpileDependencies: [
    /[\\\/]node_modules[\\\/]quasar[\\\/]/
  ]
}
