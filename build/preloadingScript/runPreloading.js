"use strict";
/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
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
exports.runPreloading = runPreloading;
const config_1 = __importDefault(require("../config"));
const workHours_1 = require("../utilities/workHours");
const preloadingScript_1 = require("./preloadingScript");
const snapshotPreloader_1 = require("./snapshotPreloader");
/**
 * Preloads the organ, picking the strategy that fits the moment it starts :
 *
 * - during the work hours, with a node snapshot available, the snapshot is
 *   loaded back in the background, in the idle time between requests, and this
 *   resolves right away so the organ can start answering ;
 * - outside of the work hours, or without a usable snapshot, the preloading
 *   script runs and is awaited, as there is nothing better to load.
 *
 * Call it where the blocking preloading script used to be called, before the
 * server starts listening. Errors of the preloading script are caught and
 * logged : preloading is best effort and must never keep the organ from
 * starting.
 *
 * @export
 * @param {ISpinalAPIMiddleware} spinalAPIMiddleware
 * @param {string} profileId the profile the nodes are loaded as. Hosts that
 * check the rights of a profile on load (bos-config) must pass their admin
 * profile id here, the same one they pass to the preloading script
 * @param {IPreloadingScript} scriptOptions the preload_config of the host
 * @return {*}  {Promise<PreloadStrategy>}
 */
async function runPreloading(spinalAPIMiddleware, profileId, scriptOptions) {
    const preload = spinalAPIMiddleware.config?.preload ?? config_1.default.preload;
    const workHours = (0, workHours_1.formatWorkHours)(preload);
    const startedDuringWorkHours = (0, workHours_1.isWithinWorkHours)(new Date(), preload);
    const snapshot = startedDuringWorkHours ? await (0, snapshotPreloader_1.findNodeSnapshot)() : null;
    if (snapshot) {
        console.log(`starting during the work hours (${workHours}), skipping the preloading script ; the ${snapshot.nodes.length} nodes of the snapshot will be loaded during idle time`);
        // not awaited on purpose : it runs in the background, in the gaps between
        // the requests the organ is answering
        (0, snapshotPreloader_1.runSnapshotPreloader)(spinalAPIMiddleware, profileId, snapshot).catch((err) => {
            console.error(`Error running the snapshot preloader:`, err.message);
        });
        return 'snapshot';
    }
    console.log(startedDuringWorkHours
        ? `starting during the work hours (${workHours}) but without a node snapshot, running the preloading script`
        : `starting outside of the work hours (${workHours}), running the preloading script`);
    try {
        await (0, preloadingScript_1.preloadingScript)(spinalAPIMiddleware, profileId, scriptOptions);
    }
    catch (err) {
        console.error(`Error calling the preloading script:`, err.message);
    }
    return 'script';
}
//# sourceMappingURL=runPreloading.js.map