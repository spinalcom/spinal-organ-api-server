"use strict";
/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewInfo_func = void 0;
const constants_1 = require("spinal-env-viewer-context-geographic-service/build/constants");
const visitNodesWithTypeRelation_1 = require("../../utilities/visitNodesWithTypeRelation");
const spinal_model_graph_1 = require("spinal-model-graph");
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
async function viewInfo_func(spinalAPIMiddleware, profilId, options = {}) {
    if (!options.dynamicId) {
        //get dynamicId of building
        const graph = await spinalAPIMiddleware.getProfileGraph(profilId);
        const contexts = await graph.getChildren('hasContext');
        const geographicContexts = contexts.filter((el) => el.getType().get() === 'geographicContext');
        const buildings = await geographicContexts[0].getChildren('hasGeographicBuilding');
        const building = buildings[0];
        options.dynamicId = building._server_id;
        options.floorRef = true;
        options.roomRef = true;
        options.equipements = true;
    }
    try {
        const opts = options;
        // getRootNode
        const nodes = await getRootNodes(opts.dynamicId, profilId, spinalAPIMiddleware);
        if (nodes.length === 0)
            return errorHandler(EError.BAD_REQ_BAD_DYN_ID);
        // getRelationListFromOption
        const relations = getRelationListFromOption(opts);
        // visitChildren
        const resBody = [];
        let totalVisited = 0;
        const intervalId = setInterval(() => {
            console.log(`[viewInfo] Processed nodes so far: ${totalVisited}`);
        }, 5000);
        try {
            for (const node of nodes) {
                const item = [];
                for await (const n of (0, visitNodesWithTypeRelation_1.visitNodesWithTypeRelation)(node, relations)) {
                    totalVisited++;
                    if (n.info.type.get() === constants_1.REFERENCE_TYPE ||
                        n.info.type.get() === constants_1.EQUIPMENT_TYPE) {
                        const bimFileId = n.info.bimFileId.get();
                        const dbId = n.info.dbid.get();
                        const dynamicId = n._server_id;
                        if (bimFileId && dbId)
                            pushResBody(item, bimFileId, dbId, dynamicId);
                    }
                }
                resBody.push({
                    dynamicId: node._server_id,
                    data: item.map((it) => {
                        return {
                            bimFileId: it.bimFileId,
                            dbIds: Array.from(it.dbIds),
                            dynamicIds: Array.from(it.dynamicIds),
                        };
                    }),
                });
            }
        }
        finally {
            console.log(`[viewInfo] Processed nodes: ${totalVisited}, finished`);
            clearInterval(intervalId);
        }
        const sizeRes = Array.isArray(opts.dynamicId) ? opts.dynamicId.length : 1;
        return {
            code: resBody.length === sizeRes ? 200 : 206,
            dataType: 'json',
            data: resBody,
        };
    }
    catch (e) {
        return { code: 500, dataType: 'text', data: e.message };
    }
}
exports.viewInfo_func = viewInfo_func;
function errorHandler(error) {
    const e = ErrorsRecord[error];
    // res.status(e.code).send(e.message);
    return { code: e.code, dataType: 'text', data: e.message };
}
async function getRootNodes(dynIds, profileId, spinalAPIMiddleware) {
    const ids = Array.isArray(dynIds) ? dynIds : [dynIds];
    const proms = ids.map((dynId) => {
        return { dynId, prom: spinalAPIMiddleware.load(dynId, profileId) };
    });
    const result = [];
    for (const prom of proms) {
        try {
            const d = await prom.prom;
            if (d instanceof spinal_model_graph_1.SpinalNode && all_GeoType.includes(d.info.type.get())) {
                result.push(d);
            }
        }
        catch (e) {
            console.error(`Error load, dynId = ${prom.dynId}`);
        }
    }
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
function pushResBody(resBody, bimFileId, dbId, dynamicId) {
    let found = false;
    if (dbId === -1)
        return;
    for (const item of resBody) {
        if (item.bimFileId === bimFileId) {
            found = true;
            item.dbIds.push(dbId);
            item.dynamicIds.push(dynamicId);
            break;
        }
    }
    if (found === false) {
        resBody.push({
            bimFileId,
            dbIds: [dbId],
            dynamicIds: [dynamicId],
        });
    }
}
//# sourceMappingURL=viewInfo_func.js.map