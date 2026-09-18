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

import config from './config';
import APIServer from './api-server';
import SpinalAPIMiddleware from './spinalAPIMiddleware';
import { getSwaggerDocs, initSwagger } from './swagger';
import ConfigFile from 'spinal-lib-organ-monitoring';
import { preloadingScript } from './preloadingScript/preloadingScript';
import { runSnapshotPreloader } from './preloadingScript/snapshotPreloader';
import { formatWorkHours, isWithinWorkHours } from './utilities/workHours';
const preload_config = require('../preload_config');

function Requests(logger) {
  async function initSpinalHub() {
    const spinalAPIMiddleware = SpinalAPIMiddleware.getInstance();
    await spinalAPIMiddleware.getGraph();
    console.log('graph loaded successfully.');
    return spinalAPIMiddleware;
  }

  function initApiServer(spinalAPIMiddleware: SpinalAPIMiddleware) {
    const api = APIServer(logger, spinalAPIMiddleware);

    // TODO add swagger specs here for external documentation and for the organ to ask for it
    initSwagger(api);

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
      const port = config.api.port;

      // Automatic API route call logic. Outside of the work hours the organ can
      // afford the blocking preloading script ; during them it must answer
      // right away, so the node snapshot is loaded progressively instead, in
      // the idle time between requests (see runSnapshotPreloader below).
      const preloadViewInfoEnabled = process.env.PRELOAD_SCRIPT === '1';
      const startedDuringWorkHours = isWithinWorkHours();
      if (preloadViewInfoEnabled && !startedDuringWorkHours) {
        console.log(
          `starting outside of the work hours (${formatWorkHours()}), running the preloading script`
        );
        try {
          await preloadingScript(spinalAPIMiddleware, 'any', preload_config);
        } catch (err) {
          console.error(`Error calling preloadViewInfo:`, err.message);
        }
      }

      const server = api.listen(port, async () => {
        if (!process.env.DISABLE_MONITORING) {
          console.log('Monitoring service is enabled');
          ConfigFile.init(
            spinalAPIMiddleware.conn,
            process.env.ORGAN_NAME!,
            process.env.ORGAN_TYPE!,
            process.env.SPINALHUB_IP!,
            parseInt(process.env.REQUESTS_PORT!)
          );
        }
        console.log(`\nApi server is listening at 0.0.0.0:${port}`);
        console.log(`  openapi :\thttp://localhost:${port}/docs/swagger.json`);
        console.log(
          `  swagger-ui :\thttp://localhost:${port}/spinalcom-api-docs`
        );
        console.log(
          `  redoc :\thttp://localhost:${port}/spinalcom-api-redoc-docs`
        );
      });

      if (preloadViewInfoEnabled && startedDuringWorkHours) {
        console.log(
          `starting during the work hours (${formatWorkHours()}), skipping the preloading script ; the node snapshot will be loaded during idle time`
        );
        // not awaited on purpose : it runs in the background, in the gaps
        // between the requests the organ is answering
        runSnapshotPreloader(spinalAPIMiddleware).catch((err) => {
          console.error(`Error running the snapshot preloader:`, err.message);
        });
      }

      return SpinalAPIMiddleware.getInstance().runSocketServer(server);
    },

    getSwaggerDocs,
  };
}

const r = Requests({});
console.log(r);

r.run();

export default Requests;
