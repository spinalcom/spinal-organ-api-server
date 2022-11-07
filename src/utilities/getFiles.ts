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

async function getFiles(nodeorigin) {
  const FileDirs = await nodeorigin.getChildren('hasFiles')
  const dirProm = FileDirs.map((nodeDir) => {
    return nodeDir.getElement().then((dir) => {
      return {
        directory: dir,
        node: nodeDir
      }
    })
  })
  const dirs = await Promise.all(dirProm)
  const files = []
  // @ts-ignore
  for (const { directory } of dirs) {
    for (let idx = 0; idx < directory.length; idx++) {
      const file = directory[idx];
      files.push({
        fileName: file.name.get(),
        targetServerId: file._ptr.data.value // for the get to download
      })
    }
  }
  return files
}
export default getFiles;
