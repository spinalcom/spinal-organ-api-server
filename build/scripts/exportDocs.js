"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Exports the API documentation as standalone files that can be sent to a
 * client without deploying the server:
 *   docs-export/openapi.json                -> the raw OpenAPI 3.0 spec
 *   docs-export/spinalcom-api-docs.html     -> self-contained Swagger UI page
 *   docs-export/spinalcom-api-redoc.html    -> self-contained Redoc page (if redoc is installed)
 *
 * Usage: npm run export-docs
 */
const fs_1 = require("fs");
const path_1 = require("path");
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerOption_1 = require("../swagger/swaggerOption");
const outDir = (0, path_1.resolve)(__dirname, '..', '..', 'docs-export');
(0, fs_1.mkdirSync)(outDir, { recursive: true });
const spec = (0, swagger_jsdoc_1.default)(swaggerOption_1.swaggerOption);
const specJson = JSON.stringify(spec, null, 2);
(0, fs_1.writeFileSync)((0, path_1.join)(outDir, 'openapi.json'), specJson);
const uiDist = (0, path_1.dirname)(require.resolve('swagger-ui-dist/package.json'));
const swaggerCss = (0, fs_1.readFileSync)((0, path_1.join)(uiDist, 'swagger-ui.css'), 'utf8');
const swaggerJs = (0, fs_1.readFileSync)((0, path_1.join)(uiDist, 'swagger-ui-bundle.js'), 'utf8');
// The spec is injected as JSON text: </script> inside a description would end
// the script tag early, and U+2028/U+2029 are illegal in JS string literals.
const inlineJson = (json) => json
    .replace(/<\//g, '<\\/')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
const title = spec.info?.title || 'API documentation';
(0, fs_1.writeFileSync)((0, path_1.join)(outDir, 'spinalcom-api-docs.html'), `<!DOCTYPE html>
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
`);
let redocBundle;
try {
    redocBundle = (0, fs_1.readFileSync)(require.resolve('redoc/bundles/redoc.standalone.js'), 'utf8');
}
catch (err) {
    // redoc is optional, only swagger-ui is a direct dependency
}
if (redocBundle) {
    (0, fs_1.writeFileSync)((0, path_1.join)(outDir, 'spinalcom-api-redoc.html'), `<!DOCTYPE html>
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
`);
}
console.log(`Exported ${Object.keys(spec.paths || {}).length} paths to ${outDir}`);
//# sourceMappingURL=exportDocs.js.map