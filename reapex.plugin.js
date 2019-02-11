module.exports = class ReapexPlugin {
  constructor(options) {
    this.options = options
  }

  apply(compiler) {
    compiler.options.entry = 'xxxx'
  }
}
