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
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinalTimeSeries_1 = require("../spinalTimeSeries");
// import spinalAPIMiddleware from '../../../spinalAPIMiddleware';
const dateFunctions_1 = require("../../../utilities/dateFunctions");
const requestUtilities_1 = require("../../../utilities/requestUtilities");
module.exports = function (logger, app, spinalAPIMiddleware) {
    app.get("/api/v1/endpoint/:id/timeSeries/read/:begin/:end", async (req, res, next) => {
        try {
            const profileId = (0, requestUtilities_1.getProfileId)(req);
            const node = await spinalAPIMiddleware.load(parseInt(req.params.id, 10), profileId);
            // @ts-ignore
            spinal_env_viewer_graph_service_1.SpinalGraphService._addNode(node);
            if ((0, dateFunctions_1.verifDate)(req.params.begin) === 1 || (0, dateFunctions_1.verifDate)(req.params.end) === 1) {
                throw "Invalid date make sure the date format is DD-MM-YYYY HH:mm:ss";
            }
            else {
                const timeSeriesIntervalDate = {
                    start: (0, dateFunctions_1.verifDate)(req.params.begin),
                    end: (0, dateFunctions_1.verifDate)(req.params.end)
                };
                const includeLastBeforeStart = req.query.valueAtBegin == "true" ? true : false;
                const datas = await (0, spinalTimeSeries_1.default)().getData(node.getId().get(), timeSeriesIntervalDate, includeLastBeforeStart);
                return res.json(datas);
            }
        }
        catch (error) {
            if (error.code && error.message)
                return res.status(error.code).send(error.message);
            else if (error.message)
                return res.status(400).send(error.message);
            else {
                return res.status(400).send(error);
            }
        }
    });
};
//# sourceMappingURL=readTimeSeries.js.map