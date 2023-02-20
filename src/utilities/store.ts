/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
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

import { spinalCore, FileSystem, Model } from 'spinal-core-connectorjs_type';

export function store(fs: FileSystem, model: spinal.Model, path: string, callback_success, callback_error) {
  if (typeof callback_error === "undefined")
    callback_error = () => {
      console.log("Model could not be stored. You can pass a callback to handle this error.")
    };

  let lst = path.split('/');
  let fileName = lst.pop();
  if (lst[0] === "") {
    lst.splice(0, 1);
  }
  path = lst.join("/");
  const home_dir = fs._home_dir;

  // @ts-ignore
  fs.load_or_make_dir(home_dir + path, (dir, err) => {
    if (err)
      callback_error(err);
    else {
      let file = dir.detect((x) => { return x.name.get() === fileName });
      if (file) {
        dir.remove(file);
      }
      dir.add_file(fileName, model, { model_type: "Model" }) // CHANGE HERE
      callback_success();
    }
  })
}
