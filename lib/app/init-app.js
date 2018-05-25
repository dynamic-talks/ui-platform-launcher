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
 * @returns {express}
 */
function configureExpressApp(app, appsParams) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // add static middleware with each `public` app folder
  appsParams.forEach(({ rootDir }) => {
    app.use(express.static(path.join(rootDir, 'public')));
  });

  // initialize app pages
  appsParams.forEach(({ rootDir, name, version, configPath }) => {
    const baseYamlConfigPath = path.join(rootDir, 'config', 'base.yaml');
    const baseJsonConfigPath = path.join(rootDir, 'config', 'base.json');
    let baseConfigPath;

    // decide which base config file use in `YAML` or `JSON` format
    // `YAML` has precedence over `JSON`
    if (fs.existsSync(baseYamlConfigPath)) {
      baseConfigPath = baseYamlConfigPath;
    } else if (fs.existsSync(baseJsonConfigPath)) {
      baseConfigPath = baseJsonConfigPath;
    } else {
      throw new Error(`Base configuration file isn't found in "${path.join(rootDir, 'config')}", in both formats: YAML and JSON`);
    }

    // todo: think about better solution
    const { createServerIocContainer } = require(`${rootDir}/node_modules/ui-platform-core/dist/lib/ui-application/server.ioc-container`);
    let absConfigPath;

    if (configPath) {
      absConfigPath = path.join(rootDir, configPath);
    } else {
      absConfigPath = baseConfigPath;
    }

    // initialize root IoC container
    const iocContainer = createServerIocContainer({
      configPath: absConfigPath,
      // todo: `build-manifest.json` name is hardcored, should be configured somehow
      assetsManifestPath: path.join(rootDir, 'build-manifest.json'),
      baseConfigPath,
    });

    const namespace = name ? `/${name}` : '/';

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
}


/**
 * Initial single app (Micro-site)
 *
 * @param {String} rootDir
 * @param {String} version
 * @param {String} configPath
 * @returns {express}
 */
export function initSingleApp({ rootDir, version, configPath }) {
  return configureExpressApp(express(), [{ rootDir, version, configPath }]);
}



/**
 * Initialize set of apps (Micro-sites), which set of artifact folders placed in supplied `appsPath`
 *
 * @param {String} appsPath
 * @returns {express}
 */
export function initMultipleApps({ appsPath }) {
  return configureExpressApp(express(), resolveMultipleAppsSettings(appsPath));
}
