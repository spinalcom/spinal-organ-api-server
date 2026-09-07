/*
 * Exports the API documentation as standalone files that can be sent to a
 * client without deploying the server:
 *   docs-export/openapi.json                -> the raw OpenAPI 3.0 spec
 *   docs-export/spinalcom-api-docs.html     -> self-contained Swagger UI page
 *   docs-export/spinalcom-api-redoc.html    -> self-contained Redoc page (if redoc is installed)
 *
 * Usage: npm run export-docs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import { swaggerOption } from '../swagger/swaggerOption';

const outDir = resolve(__dirname, '..', '..', 'docs-export');
mkdirSync(outDir, { recursive: true });

const spec = swaggerJSDoc(swaggerOption);
const specJson = JSON.stringify(spec, null, 2);

writeFileSync(join(outDir, 'openapi.json'), specJson);

const uiDist = dirname(require.resolve('swagger-ui-dist/package.json'));
const swaggerCss = readFileSync(join(uiDist, 'swagger-ui.css'), 'utf8');
const swaggerJs = readFileSync(join(uiDist, 'swagger-ui-bundle.js'), 'utf8');

// The spec is injected as JSON text: </script> inside a description would end
// the script tag early, and U+2028/U+2029 are illegal in JS string literals.
const inlineJson = (json: string): string =>
  json
    .replace(/<\//g, '<\\/')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

const title = (spec as any).info?.title || 'API documentation';

writeFileSync(
  join(outDir, 'spinalcom-api-docs.html'),
  `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>${swaggerCss}</style>
<style>.swagger-ui .topbar { background: #dbdbdb; }</style>
</head>
<body>
<div id="swagger-ui"></div>
<script>${swaggerJs}</script>
<script>
window.onload = function () {
  window.ui = SwaggerUIBundle({
    spec: ${inlineJson(specJson)},
    dom_id: '#swagger-ui',
    deepLinking: true,
    docExpansion: 'none',
    presets: [SwaggerUIBundle.presets.apis],
  });
};
</script>
</body>
</html>
`
);

let redocBundle: string | undefined;
try {
  redocBundle = readFileSync(
    require.resolve('redoc/bundles/redoc.standalone.js'),
    'utf8'
  );
} catch (err) {
  // redoc is optional, only swagger-ui is a direct dependency
}

if (redocBundle) {
  writeFileSync(
    join(outDir, 'spinalcom-api-redoc.html'),
    `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>body { margin: 0; padding: 0; }</style>
</head>
<body>
<div id="redoc"></div>
<script>${redocBundle}</script>
<script>
Redoc.init(${inlineJson(specJson)}, {}, document.getElementById('redoc'));
</script>
</body>
</html>
`
  );
}

console.log(`Exported ${Object.keys((spec as any).paths || {}).length} paths to ${outDir}`);
