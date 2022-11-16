import { SpinalGraph } from "spinal-model-graph";
import { IConfig } from "./IConfig";
export interface ISpinalAPIMiddleware {
    config: IConfig;
    conn: spinal.FileSystem;
    loadedPtr: Map<number, any>;
    getGraph(): Promise<SpinalGraph>;
    getProfileGraph(profileId?: string): Promise<SpinalGraph>;
    load<T extends spinal.Model>(server_id: number, profileId?: string): Promise<T>;
    loadPtr<T extends spinal.Model>(ptr: spinal.File<T> | spinal.Ptr<T> | spinal.Pbr<T>, profileId?: string): Promise<T>;
}
