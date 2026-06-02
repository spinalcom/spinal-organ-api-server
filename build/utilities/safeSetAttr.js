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
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeSetAttr = safeSetAttr;
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
function safeSetAttr(model, attrName, value) {
    if (value === undefined || value === null)
        return; // Do not set undefined or null values
    if (model[attrName] !== undefined) {
        // test type of existing attribute to prevent type errors
        const existingAttr = model[attrName];
        if ((existingAttr instanceof spinal_core_connectorjs_1.Str && typeof value === 'string') ||
            (existingAttr instanceof spinal_core_connectorjs_1.Val && typeof value === 'number') ||
            (existingAttr instanceof spinal_core_connectorjs_1.Bool && typeof value === 'boolean')) {
            existingAttr.set(value);
        }
        else {
            model.mod_attr(attrName, value);
        }
    }
    else if (typeof attrName === 'string') {
        model.add_attr(attrName, value);
    }
    else
        throw new Error(`Attribute name must be a string, got ${typeof attrName}`);
}
//# sourceMappingURL=safeSetAttr.js.map