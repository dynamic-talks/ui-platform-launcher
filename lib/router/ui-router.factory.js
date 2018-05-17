import path from 'path';
import fs from 'fs';
import express from 'express';
import { clientAppMiddleware } from './client-app.middleware';
import setDefaultPageRouteHandler from './default-ui-route-handler';
const { resolvePagesSettings } = require('ui-platform-core/dist/lib/pages/pages-settings.resolver');



export const uiRouterFactory = ({ rootDir, iocContainer }) => {
  const { cwd, routes } = resolvePagesSettings(rootDir);

  let uiRouter = express.Router();

  for(let routeConfig of routes) {
    const { routePath, dirPieces } = routeConfig;
    let pageRouter = express.Router();

    const routeFullPath = path.join(cwd, routePath);
    let setRouteHandler;

    if (fs.existsSync(routeFullPath)) {
      setRouteHandler = require(routeFullPath).default;
    } else {
      setRouteHandler = setDefaultPageRouteHandler;
    }

    setRouteHandler({ router: pageRouter  });

    uiRouter.use(
      '/' + dirPieces.join('/'),
      clientAppMiddleware({ routeConfig, cwd, iocContainer }),
      pageRouter
    )
  }

  return uiRouter;
};
