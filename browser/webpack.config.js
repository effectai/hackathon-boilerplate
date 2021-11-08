const path = require('path');

const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

// module.exports = {
//     {...},
//     resolve: {
//       {...},
//       fallback: {
//         "http": require.resolve("stream-http")
//       }
//     },
//     plugins: [
//       {...},
//       new NodePolyfillPlugin()
//     ],
//   };


module.exports = {
  entry: './src/main.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
};