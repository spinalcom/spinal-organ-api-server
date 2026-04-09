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

import * as origList from '../finalList';
import { relative, join, sep, resolve } from 'path';
import { readdirSync, statSync, writeFile } from 'fs';

export function getListRequest() {
  const routeDir = join(__dirname, '..', 'src', 'routes');
  const absfiles = walkSync(routeDir);
  const orderCat = [
    'contexts',
    'nodes',
    'categoriesAttributs',
    'attributs',
    'geographicContext',
    'IoTNetwork',
    'tickets',
    'notes',
    'calendar',
    'groupContext',
    'roomGroup',
    'equipementGroup',
    'endpointGroup',
    'Nomenclature Group',
    'Analytics',
    'Command',
    'BIM',
  ];

  absfiles.sort((a, b) => {
    return getIndexCat(a, orderCat) - getIndexCat(b, orderCat);
  });

  const arrayOfRequests = Array.isArray(origList) ? origList : [];

  const doNotMatch: string[] = [];
  for (let i = 0; i < absfiles.length; i++) {
    if (arrayOfRequests.indexOf(absfiles[i]) == -1) {
      doNotMatch.push(absfiles[i]);
    }
  }
  const MatchList: string[] = arrayOfRequests.concat(doNotMatch);

  // check if arrayOfRequests is exactly the same as MatchList
  if (!isSameArray(arrayOfRequests, MatchList)) {
    writeFile(
      'finalList.js',
      'module.exports = ' + JSON.stringify(MatchList, null, 2),

      function (err) {
        if (err) {
          console.error('Error writing finalList.js:', err);
        }
      }
    );
  }
  const mapList = MatchList.map((el) => {
    return resolve(__dirname, el);
  });
  return mapList;
}

function isSameArray(arr1: string[], arr2: string[]): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

// List all files in a directory in Node.js recursively in a synchronous fashion
function walkSync(dir: string, filelist: string[] = []): string[] {
  const files = readdirSync(dir);
  files.forEach(function (file) {
    if (statSync(join(dir, file)).isDirectory()) {
      filelist = walkSync(join(dir, file), filelist);
    } else {
      const relativePath = relative(__dirname, join(dir, file));
      filelist.push(relativePath);
    }
  });
  return filelist;
}
function getCategoryInFilePath(filePath: string): string | undefined {
  const dir = filePath.split(sep);
  for (let idx = 0; idx < dir.length; idx++) {
    if (dir[idx] === 'routes') return dir[idx + 1];
  }
}
function getIndexCat(filePath: string, orderCat: string[]): number {
  const dir = getCategoryInFilePath(filePath);
  if (!dir) return 9999;
  return orderCat.indexOf(dir);
}
