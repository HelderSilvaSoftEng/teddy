const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre',
        exclude: /node_modules/,
      },
    ],
  },
  ignoreWarnings: [
    {
      module: /@grpc\/proto-loader/,
      message: /Failed to parse source map/,
    },
    {
      module: /@opentelemetry\/instrumentation/,
      message: /Failed to parse source map|Critical dependency/,
    },
    {
      module: /require-in-the-middle/,
      message: /Critical dependency/,
    },
    {
      module: /node_modules/,
      message: /Failed to parse source map/,
    },
  ],
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      sourceMap: true,
    }),
  ],
};