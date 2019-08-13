const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const glob = require('glob')
const packages = require('./package.json')
const manifest = path.resolve(__dirname, "dist/manifest.json")

// let componentEntries = []
// const registeredComponents = ['Counter', 'Hello', 'Nav'].forEach(comp => {
//   const filename = glob.sync(`./example/**/${comp}.tsx`)
//   console.log(filename)
//   componentEntries = componentEntries.concat(filename)
// })

const entry = Object.keys(packages.dependencies).filter(name => name.indexOf('@types') < 0).concat(['react', 'react-dom', 'react-router', 'react-router-dom', 'reselect'])
module.exports = [
  {
		name: 'vendor',
		// mode: "development || "production",
		mode: 'production',
    entry: entry,
		output: {
			path: path.resolve(__dirname, "dist"),
			filename: 'vendor.js',
			library: 'vendor_[hash]'
		},
		plugins: [
			new webpack.DllPlugin({
				name: 'vendor_[hash]',
				path: path.resolve(__dirname, 'dist/manifest.json')
			})
		]
	},

  {
    name: 'app',
    mode: 'development',
    dependencies: ['vendor'],
    devtool: 'inline-source-map',
    entry: {
      app: ['./example/index.tsx']
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].bundle.js',
      publicPath: '/',
      chunkFilename: '[name].bundle.js',
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js"]
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './example/index.html',
        inject: false,
        chunks: ['app'],
        jsassets: [`/vendor.js`],
      }),
      new webpack.DllReferencePlugin({
				manifest: manifest
			}),
    ],

    module: {
      rules: [
        { test: /\.tsx?$/, loader: 'ts-loader' },
      ],
    },
  },

]
