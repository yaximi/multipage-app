const path = require('path')
const glob = require('glob')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const notifier = require('node-notifier')
const packageConfig = require('../package.json')
const PAGE_PATH = path.resolve(__dirname, '../src/pages')

exports.assetsPath = _path => path.posix.join('static', _path)

exports.entries = () => {
  let entryFiles = glob.sync(PAGE_PATH + '/*/*.js')
  let entries = {}
  entryFiles.forEach(filePath => {
    let filename = path.basename(filePath, '.js')
    entries[filename] = filePath
  })
  return entries
}

exports.htmlPlugin = () => {
  let entryHtml = glob.sync(PAGE_PATH + '/*/*.html')
  let plugins = []
  entryHtml.forEach(filePath => {
    let filename = path.basename(filePath, '.html')
    let config = {
      template: filePath,
      filename: filename + '.html',
      inject: true
    }
    if (process.env.NODE_ENV === 'production') {
      Object.assign({}, config, {
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
        }
      })
    }
    plugins.push(new HtmlWebpackPlugin(config))
  })
  return plugins
}

exports.cssLoaders = (options = {}) => {
  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }
  const px2remLoader = {
    loader: 'px2rem-loader',
    options: {
      remUnit: 75
    }
  }
  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }
  const generateLoaders = (loader, loaderOptions) => {
    const loaders = options.usePostCSS ? [cssLoader, px2remLoader, postcssLoader] : [cssLoader, px2remLoader]
    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }
    if (options.extract) {
      return [{
        loader: MiniCssExtractPlugin.loader,
        options: {
          publicPath: '../../',
          sourceMap: options.sourceMap
        }
      }].concat(loaders)
    } else {
      return [{
        loader: 'style-loader',
        options: {
          sourceMap: options.sourceMap
        }
      }].concat(loaders)
    }
  }
  return {
    css: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

exports.styleLoaders = (options = {}) => {
  const rules = []
  const loaders = exports.cssLoaders(options)
  for (const extension in loaders) {
    const loader = loaders[extension]
    rules.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return rules
}

exports.createNotifierCallback = () => (severity, errors) => {
  if (severity !== 'error') return
  const error = errors[0]
  const filename = error.file && error.file.split('!').pop()
  notifier.notify({
    title: packageConfig.name,
    message: severity + ': ' + error.name,
    subtitle: filename || '',
    icon: path.join(__dirname, '')
  })
}
