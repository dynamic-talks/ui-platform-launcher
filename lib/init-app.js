import path from 'path';
import createError  from 'http-errors';
import express from 'express';
import cliArgs from 'cli-args';
import { uiRouterFactory } from './router/ui-router.factory';



export default function({ rootPath, serverIoCFactory, assetsManifestPath }) {
  const args = cliArgs(process.argv.slice(2));
  const app  = express();
  const baseConfigPath = path.join(rootPath, 'config', 'base.yaml');

  let configPath;

  if (args.c) {
    // TODO: we might need to give ability to pass absolute path to concrete config
    configPath = path.join(rootPath, args.c);
  } else {
    console.warn('`-c` argument with configuration filename is not passed, so default config is going to be used');

    configPath = baseConfigPath;
  }


  // initialize root IoC container
  const iocContainer = serverIoCFactory({
    baseConfigPath: baseConfigPath,
    configPath: configPath,
    assetsManifestPath
  });


  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(rootPath, 'public')));

  app.use('/', uiRouterFactory({
    rootDir: rootPath,
    iocContainer,
  }));

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {
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
