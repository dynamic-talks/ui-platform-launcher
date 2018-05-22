import path from 'path';
import createError  from 'http-errors';
import express from 'express';
import { resolveMultipleAppsSettings } from 'ui-platform-core/dist/lib/path-resolvers/mutiple-apps-settings.resolver';
import { uiRouterFactory } from './router/ui-router.factory';



/**
 * Initialize web app with set of apps, which should be found in supplied `appsPath` directory
 *
 * @param {String} appsPath - absolute path to directory with set of app artifacts
 * @returns {express}
 */
export default function({ appsPath }) {
  const app  = express();
  const appSettings = resolveMultipleAppsSettings(appsPath);

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // add static middleware with each `public` app folder
  appSettings.forEach(({ rootDir }) => {
    app.use(express.static(path.join(rootDir, 'public')));
  });

  // initialize app pages
  appSettings.forEach(({ rootDir, name, version, params }) => {
    const baseConfigPath = path.join(rootDir, 'config', 'base.yaml');
    const { configPath } = params;
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

    app.use(`/${name}`, uiRouterFactory({
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
