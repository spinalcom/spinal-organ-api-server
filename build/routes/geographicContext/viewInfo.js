"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const constants_1 = require("spinal-env-viewer-context-geographic-service/build/constants");
const visitNodesWithTypeRelation_1 = require("../../utilities/visitNodesWithTypeRelation");
const all_GeoType = constants_1.GEOGRAPHIC_TYPES_ORDER.concat(constants_1.CONTEXT_TYPE);
var EError;
(function (EError) {
    EError[EError["BAD_REQ_NO_DYN_ID"] = 0] = "BAD_REQ_NO_DYN_ID";
    EError[EError["BAD_REQ_BAD_DYN_ID"] = 1] = "BAD_REQ_BAD_DYN_ID";
    EError[EError["NO_CONTEXT_GEO_FOUND"] = 2] = "NO_CONTEXT_GEO_FOUND";
})(EError || (EError = {}));
function createErrorObj(code, message) {
    return { code, message };
}
const ErrorsRecord = {
    [EError.BAD_REQ_NO_DYN_ID]: createErrorObj(400, 'no dynamicId found in body request'),
    [EError.BAD_REQ_BAD_DYN_ID]: createErrorObj(400, 'bad dynamicIds in body request'),
    [EError.NO_CONTEXT_GEO_FOUND]: createErrorObj(500, 'no Spatial context found'),
};
function errorHandler(res, error) {
    const e = ErrorsRecord[error];
    res.status(e.code).send(e.message);
}
module.exports = function (logger, app, spinalAPIMiddleware) {
    async function getRootNodes(dynIds, res) {
        const ids = Array.isArray(dynIds) ? dynIds : [dynIds];
        const proms = ids.map((dynId) => {
            return { dynId, prom: spinalAPIMiddleware.load(dynId) };
        });
        const result = [];
        for (const prom of proms) {
            try {
                const d = await prom.prom;
                if (d instanceof spinal_env_viewer_graph_service_1.SpinalNode &&
                    all_GeoType.includes(d.info.type.get())) {
                    result.push(d);
                }
            }
            catch (e) {
                console.error(`Error load, dynId = ${prom.dynId}`);
            }
        }
        if (result.length === 0)
            throw errorHandler(res, EError.BAD_REQ_BAD_DYN_ID);
        return result;
    }
    function getRelationListFromOption(options) {
        const baseRelation = [
            constants_1.SITE_RELATION,
            constants_1.BUILDING_RELATION,
            constants_1.FLOOR_RELATION,
            constants_1.ZONE_RELATION,
            constants_1.ROOM_RELATION,
        ];
        const floor = options.floorRef
            ? baseRelation.concat([constants_1.REFERENCE_RELATION])
            : baseRelation;
        const room = baseRelation.concat();
        if (options.roomRef)
            room.push(`${constants_1.REFERENCE_RELATION}.ROOM`);
        if (options.equipements)
            room.push(constants_1.EQUIPMENT_RELATION);
        return {
            [constants_1.CONTEXT_TYPE]: baseRelation,
            [constants_1.SITE_TYPE]: baseRelation,
            [constants_1.BUILDING_TYPE]: baseRelation,
            [constants_1.FLOOR_TYPE]: floor,
            [constants_1.ZONE_TYPE]: baseRelation,
            [constants_1.ROOM_TYPE]: room,
        };
    }
    function pushResBody(resBody, bimFileId, dbId) {
        let found = false;
        for (const item of resBody) {
            if (item.bimFileId === bimFileId) {
                found = true;
                item.dbIds.add(dbId);
                break;
            }
        }
        if (found === false) {
            resBody.push({
                bimFileId,
                dbIds: new Set([dbId]),
            });
        }
    }
    app.post('/api/v1/geographicContext/viewInfo', async (req, res) => {
        const body = req.body;
        const options = {
            dynamicId: body.dynamicId,
            floorRef: body.floorRef || false,
            roomRef: body.roomRef || true,
            equipements: body.equipements || false,
        };
        if (!options.dynamicId) {
            return errorHandler(res, EError.BAD_REQ_NO_DYN_ID);
        }
        // getRootNode
        const nodes = await getRootNodes(options.dynamicId, res);
        // getRelationListFromOption
        const relations = getRelationListFromOption(options);
        // visitChildren
        const resBody = [];
        for (const node of nodes) {
            const item = [];
            for await (const n of (0, visitNodesWithTypeRelation_1.visitNodesWithTypeRelation)(node, relations)) {
                if (n.info.type.get() === constants_1.REFERENCE_TYPE ||
                    n.info.type.get() === constants_1.EQUIPMENT_TYPE) {
                    const bimFileId = n.info.bimFileId.get();
                    const dbId = n.info.dbid.get();
                    if (bimFileId && dbId)
                        pushResBody(item, bimFileId, dbId);
                }
            }
            resBody.push({
                dynamicId: node._server_id,
                data: item.map((it) => {
                    return {
                        bimFileId: it.bimFileId,
                        dbIds: Array.from(it.dbIds),
                    };
                }),
            });
        }
        return res.json(resBody);
    });
};
//# sourceMappingURL=viewInfo.js.map