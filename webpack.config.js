const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

/* eslint-disable max-len */
module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './example/index.tsx',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[hash].js',
    publicPath: '/',
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './example/index.html',
      inject: true,
    }),
  ],

  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
    ],
  },
}
