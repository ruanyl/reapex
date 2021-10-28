const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = [
  {
    name: 'app',
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
      app: ['./example/index.tsx'],
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].bundle.js',
      publicPath: '/',
      chunkFilename: '[name].bundle.js',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './example/index.html',
        chunks: ['app'],
      }),
    ],

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          include: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'example'),
          ],
          loader: 'ts-loader',
        },
      ],
    },

    devServer: {
      contentBase: './dist',
      hot: true,
    },
  },
]
