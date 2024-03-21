"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getListRequest = void 0;
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
const path = require("path");
// import arrayOfRequests from "./absfiles"
const arrayOfRequests = require("../finalList");
// List all files in a directory in Node.js recursively in a synchronous fashion
const walkSync = function (dir, filelist) {
    var path = path || require('path');
    var fs = fs || require('fs'), files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
        }
        else {
            filelist.push(path.relative(__dirname, path.join(dir, file)));
        }
    });
    return filelist;
};
const routeDir = path.join(__dirname, "..", "src", 'routes');
const absfiles = walkSync(routeDir);
const orderCat = [
    "contexts",
    "nodes",
    "categoriesAttributs",
    "attributs",
    "geographicContext",
    "IoTNetwork",
    "tickets",
    "notes",
    "calendar",
    "groupContext",
    "roomGroup",
    "equipementGroup",
    "endpointGroup",
    "Nomenclature Group",
    "Analytics",
    "Command",
    "BIM"
];
function getCat(filePath) {
    const dir = filePath.split(path.sep);
    for (let idx = 0; idx < dir.length; idx++) {
        if (dir[idx] === 'routes')
            return dir[idx + 1];
    }
}
function getIndexCat(filePath) {
    const dir = getCat(filePath);
    if (!dir)
        return 9999;
    return orderCat.indexOf(dir);
}
absfiles.sort((a, b) => {
    return getIndexCat(a) - getIndexCat(b);
});
const doNotMatch = [];
let MatchList = [];
for (let i = 0; i < absfiles.length; i++) {
    if (arrayOfRequests.indexOf(absfiles[i]) == -1) {
        doNotMatch.push(absfiles[i]);
    }
}
MatchList = arrayOfRequests.concat(doNotMatch);
function getListRequest() {
    require('fs').writeFile('../finalList.js', 'module.exports = ' +
        JSON.stringify(MatchList, null, 2), function (err) {
        if (err) {
            console.error('Crap happens');
        }
    });
    const mapList = MatchList.map((el) => {
        return path.resolve(__dirname, el);
    });
    return mapList;
}
exports.getListRequest = getListRequest;
//# sourceMappingURL=listRequest.js.map