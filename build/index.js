"use strict";
/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const api_server_1 = __importDefault(require("./api-server"));
const spinalAPIMiddleware_1 = __importDefault(require("./spinalAPIMiddleware"));
const swagger_1 = require("./swagger");
const spinal_lib_organ_monitoring_1 = __importDefault(require("spinal-lib-organ-monitoring"));
const preloadingScript_1 = require("./preloadingScript/preloadingScript");
const snapshotPreloader_1 = require("./preloadingScript/snapshotPreloader");
const workHours_1 = require("./utilities/workHours");
const preload_config = require('../preload_config');
function Requests(logger) {
    async function initSpinalHub() {
        const spinalAPIMiddleware = spinalAPIMiddleware_1.default.getInstance();
        await spinalAPIMiddleware.getGraph();
        console.log('graph loaded successfully.');
        return spinalAPIMiddleware;
    }
    function initApiServer(spinalAPIMiddleware) {
        const api = (0, api_server_1.default)(logger, spinalAPIMiddleware);
        // TODO add swagger specs here for external documentation and for the organ to ask for it
        (0, swagger_1.initSwagger)(api);
        // serve logo.png file
        api.get('/logo.png', (req, res) => {
            res.sendFile('spinalcore.png', { root: process.cwd() + '/uploads' });
        });
        return api;
    }
    return {
        // TODO host should be configurable
        run: async function () {
            const spinalAPIMiddleware = await initSpinalHub();
            const api = initApiServer(spinalAPIMiddleware);
            const port = config_1.default.api.port;
            // Automatic API route call logic. Outside of the work hours the organ can
            // afford the blocking preloading script ; during them it must answer
            // right away, so the node snapshot is loaded progressively instead, in
            // the idle time between requests (see runSnapshotPreloader below).
            const preloadViewInfoEnabled = process.env.PRELOAD_SCRIPT === '1';
            const startedDuringWorkHours = (0, workHours_1.isWithinWorkHours)();
            if (preloadViewInfoEnabled && !startedDuringWorkHours) {
                console.log(`starting outside of the work hours (${(0, workHours_1.formatWorkHours)()}), running the preloading script`);
                try {
                    await (0, preloadingScript_1.preloadingScript)(spinalAPIMiddleware, 'any', preload_config);
                }
                catch (err) {
                    console.error(`Error calling preloadViewInfo:`, err.message);
                }
            }
            const server = api.listen(port, async () => {
                if (!process.env.DISABLE_MONITORING) {
                    console.log('Monitoring service is enabled');
                    spinal_lib_organ_monitoring_1.default.init(spinalAPIMiddleware.conn, process.env.ORGAN_NAME, process.env.ORGAN_TYPE, process.env.SPINALHUB_IP, parseInt(process.env.REQUESTS_PORT));
                }
                console.log(`\nApi server is listening at 0.0.0.0:${port}`);
                console.log(`  openapi :\thttp://localhost:${port}/docs/swagger.json`);
                console.log(`  swagger-ui :\thttp://localhost:${port}/spinalcom-api-docs`);
                console.log(`  redoc :\thttp://localhost:${port}/spinalcom-api-redoc-docs`);
            });
            if (preloadViewInfoEnabled && startedDuringWorkHours) {
                console.log(`starting during the work hours (${(0, workHours_1.formatWorkHours)()}), skipping the preloading script ; the node snapshot will be loaded during idle time`);
                // not awaited on purpose : it runs in the background, in the gaps
                // between the requests the organ is answering
                (0, snapshotPreloader_1.runSnapshotPreloader)(spinalAPIMiddleware).catch((err) => {
                    console.error(`Error running the snapshot preloader:`, err.message);
                });
            }
            return spinalAPIMiddleware_1.default.getInstance().runSocketServer(server);
        },
        getSwaggerDocs: swagger_1.getSwaggerDocs,
    };
}
const r = Requests({});
console.log(r);
r.run();
exports.default = Requests;
//# sourceMappingURL=index.js.map