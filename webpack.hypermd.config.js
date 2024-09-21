const path = require('path');

module.exports = {
  entry: './src/hypermd/index.js',
  output: {
    filename: 'hypermd_bundle.js',
    path: path.resolve(__dirname, 'out'),
  },
  mode: 'production', // или 'development' для разработки
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
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.css']
  }
};
