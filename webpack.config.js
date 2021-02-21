const path = require('path');

module.exports = {
  mode: "development",
  entry: [
    './src/index.js',
    './src/terrain.js',
    './src/controls.js'
  ],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  }
};
