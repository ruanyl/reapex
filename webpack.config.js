const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const glob = require('glob')

let componentEntries = []
const registeredComponents = ['Counter', 'Hello', 'Nav'].forEach(comp => {
  const filename = glob.sync(`./example/**/${comp}.tsx`)
  console.log(filename)
  componentEntries = componentEntries.concat(filename)
})

/* eslint-disable max-len */
module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: [...componentEntries, './example/index.tsx'],
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
