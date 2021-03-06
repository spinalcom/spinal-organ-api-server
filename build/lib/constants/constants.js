"use strict";
/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
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
exports.EXCLUDES_TYPES = exports.EVENT_NAMES = exports.ERROR_EVENT = exports.PUBLISH_EVENT = exports.SUBSCRIBED = exports.SUBSCRIBE_EVENT = exports.NOK_STATUS = exports.OK_STATUS = void 0;
const constants_1 = require("spinal-env-viewer-plugin-documentation-service/dist/Models/constants");
const spinal_model_timeseries_1 = require("spinal-model-timeseries");
exports.OK_STATUS = "success";
exports.NOK_STATUS = "error";
exports.SUBSCRIBE_EVENT = "subscribe";
exports.SUBSCRIBED = "subscribed";
exports.PUBLISH_EVENT = "publish";
exports.ERROR_EVENT = "exception";
var EVENT_NAMES;
(function (EVENT_NAMES) {
    EVENT_NAMES["updated"] = "updated";
    EVENT_NAMES["addChild"] = "addChild";
    EVENT_NAMES["childRemoved"] = "childRemoved";
    EVENT_NAMES["childrenRemoved"] = "childrenRemoved";
    EVENT_NAMES["addChildInContext"] = "addChildInContext";
})(EVENT_NAMES = exports.EVENT_NAMES || (exports.EVENT_NAMES = {}));
exports.EXCLUDES_TYPES = [constants_1.URL_TYPE, constants_1.NOTE_TYPE, constants_1.CATEGORY_TYPE, constants_1.ATTRIBUTE_TYPE, spinal_model_timeseries_1.SpinalTimeSeries.nodeTypeName];
//# sourceMappingURL=constants.js.map