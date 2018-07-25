/*
    ./webpack.config.js
*/
const path = require('path');
const PrerenderSpaPlugin = require('prerender-spa-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')


module.exports = {
  entry:  {
    index: './client/index.js',
    instanceInfo: './client/instance_info.js'
  },
  output: {
    path: path.resolve('dist'),
    filename: '[name]_bundle.js'
  },
  devtool: "inline-source-map",
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.scss$/,   use: ['style-loader', 'css-loader', 'sass-loader'] },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&mimetype=application/font-woff" },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" }
    ]
  },
  devServer: {
      contentBase: path.join(__dirname, "client"),
      proxy: {
        "/api": "http://localhost:3000",
        "/data": "http://localhost:3000"
      }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'client/html/index.html',
      chunks: ['index']
    }), // Generates default index.html
    new HtmlWebpackPlugin({  // Also generate a test.html
      filename: 'info.html',
      template: 'client/html/index.html',
      chunks: ['instanceInfo']
    }),
    new PrerenderSpaPlugin(
      // Absolute path to compiled SPA
      path.join(__dirname, './dist'),
      // List of routes to prerender
      [ '/' ],
      {
        captureAfterElementExists: '.group-first'
      }
    )
  ]
}
