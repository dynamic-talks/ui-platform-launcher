import path from 'path';



const mapToString = (array, mapper) => array.map(mapper).join('\n');
const isProduction = process.env.NODE_ENV === 'production';


const renderHtmlTemplate = ({ headerTitle = '', docLang, modulesStr, stateStr, configStr, scripts, metaTags, linkTags }) => `
<!DOCTYPE html>
<html lang="${docLang}">
  <head>
    <meta charset="utf-8">
    <title>${headerTitle}</title>
    
    ${mapToString(metaTags, ({ name, content }) =>
      `<meta name=${name} content="${content}">`
    )}
    
    ${mapToString(linkTags, ({ rel, href, type, media, sizes, charset }) =>
      `<link rel="${rel}" href="${href}" ${type ? `type="${type}"` : ''} ${media ? `media="${media}"`: ''} ${sizes ? `sizes="${sizes}"`: ''} ${charset ? `charset="${charset}"` : ''}>`
    )}
  </head>
  <body>
    ${modulesStr}
    
    <script>window.__CONFIG__ = ${configStr}</script>
    <script>window.__STATE__ = ${stateStr}</script>
    
    ${mapToString(scripts, src =>`<script type="text/javascript" src="${src}"></script>`)}
  </body>
</html>
`;



const renderHtml = ({ modules, state, config, routeConfig, htmlDocOptions = {} }) => {
  let modulesStr = [];

  for (let module of modules) {
    modulesStr.push(`<div id="${module.id}">${module.html}</div>`);
  }

  let scripts = [
    `/build/${routeConfig.namespace}.js`
  ];

  // prepare <header/> specific data
  const {
    title = routeConfig.namespace,
    docLang = 'en',
    metaTags = [],
    linkTags = [],
  } = htmlDocOptions;

  return renderHtmlTemplate({
    docLang,
    headerTitle: title,
    modulesStr: modulesStr.join(''),
    stateStr: JSON.stringify(state),
    configStr: JSON.stringify(config.get()),
    scripts: scripts,
    metaTags,
    linkTags
  })
};


let renderApp = (res, app, routeConfig) => (htmlDocOptions) => {
  if(isProduction ) {
    const manifestManager = app._ioc.resolve('manifestManager');
    const prodCss = manifestManager.get(`${routeConfig.namespace}.css`);
    if(!htmlDocOptions.linkTags) htmlDocOptions.linkTags = [];
    if(prodCss) {
      htmlDocOptions.linkTags.push({
        href: '/build/' + prodCss,
        rel: 'stylesheet',
        type: 'text/css'
      });
    }
  }

  app.run({}).then((modules) => {
    res.send(renderHtml({
      modules,
      state: app.store ? app.store.getState() : {},
      config: app.getClientConfig(),
      routeConfig,
      htmlDocOptions,
    }));
  }).catch((error) => {
    res.status(500).json(error);
  })
};

export let clientAppMiddleware = ({ routeConfig, cwd, iocContainer }) => {
  const { pagePath } = routeConfig;

  // Check that page module exists
  const appModuleExists = true;

  return (req, res, next) => {

    if (appModuleExists) {
      let module = require(path.join(cwd, pagePath)).default;
      let app = iocContainer.resolve('ServerUiApplication');

      app.addModule(module);

      app.configure();

      res.$app = app;

      res.renderApp = renderApp(res, app, routeConfig);
    }

    next();
  };
};
