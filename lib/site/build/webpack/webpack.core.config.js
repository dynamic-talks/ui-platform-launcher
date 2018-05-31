const path    = require('path');
const webpack = require('webpack');
const { resolvePagesSettings } = require('ui-platform-core/dist/lib/path-resolvers/pages-settings.resolver');
const buildConfig = require('../build-params');


const __DEV__ = process.env.NODE_ENV === 'development';
const __PROD__ = !process.env.NODE_ENV || process.env.NODE_ENV === 'production';

function createPagesEntries() {
  let { cwd, routes } = resolvePagesSettings(buildConfig.ROOT_DIR);


  return routes.reduce(
    (res, {namespace, clientPath }) => {
      res[namespace] = path.join(cwd, clientPath);

      return res;
    },
    {}
  );
}

const pagesEntries = createPagesEntries();

module.exports = () => ({
  entry: {
    ...pagesEntries
  },

  output: {
    path: path.join(buildConfig.ROOT_DIR, __PROD__ ? buildConfig.DIST_FOLDER_NAME : '', 'public/build')
  },



  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          babelrc: false,
          presets: ['es2015', 'stage-0', 'react']
        },
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: path.resolve(__dirname, './webpack/postcss.config.js')
              }
            }
          }
        ]
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        exclude: /node_modules/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]',
          publicPath: '../build'
        }
      },
      {
        test: /\.(png|jpg|gif)$/,
        exclude: /node_modules/,
        loader: 'file-loader',
        options: {
          name: 'img/[name].[ext]',
          publicPath: '../build'
        }
      },
      {
        test: /\.icon.svg$/,
        use: [
          'svg-sprite-loader',
          {
            loader: 'svgo-loader',
            options: {
              esModule: true,
              plugins: [
                {removeTitle: true},
                {removeDimensions: true},
                {convertPathData: true},
                {convertTransform: true},
                {convertShapeToPath: true},
                {
                  removeAttrs: {
                    attrs: ['fill', 'stroke'],
                  }
                }
              ]
            }
          }
        ]
      }
    ]
  },



  resolve: {
    alias: {
      core: path.resolve(buildConfig.ROOT_DIR, 'src/core'),
      ui: path.resolve(buildConfig.ROOT_DIR, 'src/ui'),
      lib: path.resolve(buildConfig.ROOT_DIR, 'src/lib'),
      // todo: below aliases should be updated as soon as platform launcher and core are distributed into separate packages
      'platform-launcher': path.resolve(buildConfig.ROOT_DIR, 'platform/platform-launcher'),
      'platform-core': path.resolve(buildConfig.ROOT_DIR, 'platform/platform-core'),
      /**
       * Fixes that svg sprite loader is always requeres to be installed on top of node_modules ierarchy relative to
       * target assets for compilation
       */
      'svg-sprite-loader': path.resolve(buildConfig.PACKAGE_NODE_MODULES_PATH, 'svg-sprite-loader'),
      'svg-baker-runtime': path.resolve(buildConfig.PACKAGE_NODE_MODULES_PATH, 'svg-baker-runtime')
    },
    extensions: ['.js', '.jsx', '.json']
  },

  resolveLoader: {
    modules: [
      buildConfig.PACKAGE_NODE_MODULES_PATH,
      path.resolve(buildConfig.ROOT_DIR, 'node_modules'),
      'node_modules'
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        __DEV__,
        __PROD__
      }
    }),
  ],
});
