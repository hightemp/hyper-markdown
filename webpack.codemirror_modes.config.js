const path = require('path');

module.exports = {
  entry: './src/codemirror/modes.min.js',
  output: {
    filename: 'codemirror_modes_bundle.js',
    path: path.resolve(__dirname, 'out'),
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
    ]
  },
  resolve: {
    extensions: ['.js']
  }
};
