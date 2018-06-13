import fs from 'fs';
import path from 'path';
import createError  from 'http-errors';
import express from 'express';
import { resolveMultipleAppsSettings } from 'ui-platform-core/dist/lib/path-resolvers/mutiple-apps-settings.resolver';
import { uiRouterFactory } from '../router/ui-router.factory';



/**
 * Configure supplied express server with set of apps (micro-sites) provided in `appsParams` list
 *
 * @param {Object} app - instance of Express server
 * @param {Array} appsParams - set of setting for each app
 * @returns {Promise<express>}
 */
function configureExpressApp(app, appsParams) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // add static middleware with each `public` app folder
  appsParams.forEach(({ rootDir }) => {
    app.use(express.static(path.join(rootDir, 'public')));
  });

  return Promise
    // initialize configuration manager for each app
    .all(appsParams.map(
      ({ rootDir, appName, configReaderType }) => {
        const { ConfigurationManager } = require(`${rootDir}/node_modules/ui-platform-core/dist/lib/configuration-manager`);
        const configManager = new ConfigurationManager(rootDir);

        return configManager.initialize({ appName, readerType: configReaderType })
      })
    )
    // As soon as config managers are ready do the rest of initialization
    .then(configCollection => {

      appsParams
      // merge each app params with an appropriate config
        .map((param, i) => Object.assign({ config: configCollection[i]}, param))
        // initialize app pages
        .forEach(({ rootDir, appName, config, version, useAppURIPrefix = true }) => {
          // todo: think about better solution
          const { createServerIocContainer } = require(`${rootDir}/node_modules/ui-platform-core/dist/lib/ui-application/server.ioc-container`);

          // initialize root IoC container
          const iocContainer = createServerIocContainer({
            // todo: `build-manifest.json` appName is hardcored, should be configured somehow
            assetsManifestPath: path.join(rootDir, 'build-manifest.json'),
            config,
          });

          const namespace = useAppURIPrefix ? `/${appName}` : '/';

          app.use(namespace, uiRouterFactory({
            rootDir,
            iocContainer,
          }));
        });

      // catch 404 and forward to error handler
      app.use(function(req, res, next) {
        next(createError(404));
      });

      // error handler
      app.use(function(err, req, res) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.json(err);
        console.error(err);
      });

      return app;
    });
}


/**
 * Initial single app (Micro-site)
 *
 * @param {String} rootDir
 * @param {String} version
 * @param {String} appName - app appName
 * @param {String} configReaderType
 * @returns {Promise<express>}
 */
export function initSingleApp({ rootDir, appName, version, configReaderType }) {
  return configureExpressApp(express(), [{ appName, rootDir, version, configReaderType, useAppURIPrefix: false }]);
}



/**
 * Initialize set of apps (Micro-sites), which set of artifact folders placed in supplied `appsPath`
 *
 * @param {String} appsPath
 * @param {String} configType
 * @returns {Promise<express>}
 */
export function initMultipleApps({ appsPath, configReaderType }) {
  const appParams = resolveMultipleAppsSettings(appsPath).map(params => Object.assign({ configReaderType }, params));

  return configureExpressApp(express(), appParams);
}
