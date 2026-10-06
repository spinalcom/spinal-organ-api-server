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
exports.parseInfoQuery = parseInfoQuery;
/**
 * Parses the 'info' query string into an object representation.
 * The query string can have the following values:
 * - 'true' or an empty string: returns `true`.
 * - 'false' or `undefined`: returns the default fields array.
 * - A comma-separated list of field names: returns an array of trimmed field names.
 *
 * @param query The value of the 'info' query string to parse.
 * @returns An object representing the parsed info fields.
 */
function parseInfoQuery(query) {
    if (query === undefined || query.trim().toLocaleLowerCase() === 'false')
        return [
            'staticId',
            'name',
            'type',
            'color',
            'icon',
            'virtual',
            'bimFileId',
            'dbid',
        ];
    const trimmedQuery = query.trim();
    if (trimmedQuery.toLocaleLowerCase() === 'true' || trimmedQuery === '')
        return true;
    const fields = trimmedQuery.split(',').reduce((acc, field) => {
        const trimmedField = field.trim();
        if (trimmedField) {
            if (trimmedField.toLowerCase() === 'id')
                acc.push('staticId');
            else
                acc.push(trimmedField);
        }
        return acc;
    }, []);
    return fields;
}
//# sourceMappingURL=parseInfoQuery.js.map