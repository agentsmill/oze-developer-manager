const webpack = require('webpack');

module.exports = {
  // Dołączamy plugin definiujący process.env.NODE_ENV
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
      }
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  resolve: {
    fallback: {
      "process": require.resolve("process/browser")
    }
  }
}; 