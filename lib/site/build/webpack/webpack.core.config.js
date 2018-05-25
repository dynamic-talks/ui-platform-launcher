const path    = require('path');
const webpack = require('webpack');
const { resolvePagesSettings } = require('ui-platform-core/dist/lib/path-resolvers/pages-settings.resolver');


const __DEV__ = process.env.NODE_ENV === 'development';
const __PROD__ = !process.env.NODE_ENV || process.env.NODE_ENV === 'production';

function createPagesEntries() {
  let { cwd, routes } = resolvePagesSettings(process.cwd());


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
    path: path.join(__dirname, '../', __PROD__ ? 'dist/' : '', 'public/build')
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
      core: path.resolve(__dirname, '../src/core'),
      ui: path.resolve(__dirname, '../src/ui'),
      lib: path.resolve(__dirname, '../src/lib'),
      // todo: below aliases should be updated as soon as platform launcher and core are distributed into separate packages
      'platform-launcher': path.resolve(__dirname, '../platform/platform-launcher'),
      'platform-core': path.resolve(__dirname, '../platform/platform-core')
    },
    extensions: ['.js', '.jsx', '.json']
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
