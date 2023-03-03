"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
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
    function getRootNodes(dynIds, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ids = Array.isArray(dynIds) ? dynIds : [dynIds];
            const proms = ids.map((dynId) => {
                return { dynId, prom: spinalAPIMiddleware.load(dynId) };
            });
            const result = [];
            for (const prom of proms) {
                try {
                    const d = yield prom.prom;
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
        });
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
    app.post('/api/v1/geographicContext/viewInfo', (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
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
        const nodes = yield getRootNodes(options.dynamicId, res);
        // getRelationListFromOption
        const relations = getRelationListFromOption(options);
        // visitChildren
        const resBody = [];
        for (const node of nodes) {
            const item = [];
            try {
                for (var _d = true, _e = (e_1 = void 0, __asyncValues((0, visitNodesWithTypeRelation_1.visitNodesWithTypeRelation)(node, relations))), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                    _c = _f.value;
                    _d = false;
                    try {
                        const n = _c;
                        if (n.info.type.get() === constants_1.REFERENCE_TYPE ||
                            n.info.type.get() === constants_1.EQUIPMENT_TYPE) {
                            const bimFileId = n.info.bimFileId.get();
                            const dbId = n.info.dbid.get();
                            if (bimFileId && dbId)
                                pushResBody(item, bimFileId, dbId);
                        }
                    }
                    finally {
                        _d = true;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
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
    }));
};
//# sourceMappingURL=viewInfo.js.map