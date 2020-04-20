// fake webpack config used only to help make WebStorm resolve imported .sass files
var webpack = require('webpack');

module.exports = {
  context: __dirname,

  // Directory resolution fix
  resolve: {
    extensions: ['.ts', '.js', '.vue'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
};
