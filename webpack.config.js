const webpack = require('webpack')
const path = require('path')

const config = {
  entry: {
    app: ['@babel/polyfill', './public/js/index.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['@babel/preset-env'],
        },
      },
    ],
  },
}

module.exports = config
