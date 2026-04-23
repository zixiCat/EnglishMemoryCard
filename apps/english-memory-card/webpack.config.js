const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { NxReactWebpackPlugin } = require('@nx/react/webpack-plugin');
const { isAbsolute, join, resolve } = require('path');

const workspaceRoot = resolve(__dirname, '../..');
const outputPath = resolveOutputPath();
const baseHref = process.env.ENGLISH_CARD_BASE_HREF || '/';

if (outputPath === workspaceRoot) {
  throw new Error(
    'Refusing to write the webpack output directly into the repository root. Use scripts/build-github-static.mjs --publish-docs instead.'
  );
}

module.exports = {
  module: {
    rules: [
      {
        test: /\.md$/i,
        type: 'asset/source',
      },
    ],
  },
  output: {
    path: outputPath,
    clean: true,
  },
  devServer: {
    port: 4200,
    historyApiFallback: {
      index: '/index.html',
      disableDotRule: true,
      htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
    },
  },
  plugins: [
    new NxAppWebpackPlugin({
      tsConfig: './tsconfig.app.json',
      compiler: 'babel',
      main: './src/main.tsx',
      index: './src/index.html',
      baseHref,
      assets: ["./src/favicon.ico","./src/assets"],
      styles: ["./src/styles.css"],
      outputHashing: process.env['NODE_ENV'] === 'production' ? 'all' : 'none',
      optimization: process.env['NODE_ENV'] === 'production',
    }),
    new NxReactWebpackPlugin({
      // Uncomment this line if you don't want to use SVGR
      // See: https://react-svgr.com/
      // svgr: false
    }),
  ],
};

function resolveOutputPath() {
  const requestedOutputPath = process.env.ENGLISH_CARD_OUTPUT_PATH;

  if (!requestedOutputPath) {
    return join(__dirname, 'dist');
  }

  return isAbsolute(requestedOutputPath)
    ? requestedOutputPath
    : resolve(workspaceRoot, requestedOutputPath);
}
