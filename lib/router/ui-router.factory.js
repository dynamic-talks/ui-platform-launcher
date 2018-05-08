import path from 'path';
import fs from 'fs';
import express from 'express';
import { clientAppMiddleware } from './client-app.middleware';
import setDefaultPageRouteHandler from './default-ui-route-handler';
import { resolvePagesSettings } from 'platform-core/lib/pages/pages-settings.resolver';

// function getPageRouters(rootDir) {
//   const cwd = path.join(rootDir, 'src', 'ui');
//   return {
//     cwd,
//     routes: glob.sync('**/*.page.js', { cwd })
//       .map( pagePath => {
//         const dirPath = path.dirname(pagePath, '.page.js');
//         const name = path.basename(pagePath, '.page.js');
//         const routePath = path.join(dirPath, `${name}.route.js`);
//         return {
//           name,
//           routePath,
//           pagePath,
//           dirPath,
//           urlPath: dirPath.replace(/^\./, '').split('/')
//         }
//       })
//   };
// }

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
