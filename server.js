const webpack = require('webpack')
const path = require('path')
const webpackDevMiddleware = require('webpack-dev-middleware')
const config = require('./webpack.config')

const app = new (require('express'))()
const port = 3030

const compiler = webpack(config)
app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config[1].output.publicPath }))

app.use((req, res, next) => {
  const filename = path.join(compiler.compilers[1].outputPath, 'index.html')
  compiler.compilers[1].outputFileSystem.readFile(filename, function(err, result) {
    if (err) {
      return next(err)
    }
    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})

app.listen(port, error => {
  if (error) {
    console.error(error)
  } else {
    console.info('==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.', port, port)
  }
})
