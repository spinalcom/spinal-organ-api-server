/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
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

import { SpinalGraph } from "spinal-model-graph";
import { IConfig } from "./IConfig";
import { Server } from 'http';

export interface ISpinalAPIMiddleware {
    config: IConfig;
    conn: spinal.FileSystem;
    loadedPtr: Map<number, any>;
    getGraph(): Promise<SpinalGraph>;
    getProfileGraph(profileId?: string): Promise<SpinalGraph>;
    load<T extends spinal.Model>(server_id: number, profileId?: string): Promise<T>
    loadPtr<T extends spinal.Model>(ptr: spinal.File<T> | spinal.Ptr<T> | spinal.Pbr<T>, profileId?: string): Promise<T>;
}