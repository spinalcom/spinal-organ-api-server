import { Model } from "spinal-core-connectorjs";
export declare function createModelStaging(): {
    clone: (model: Model, depth?: number) => Model;
    stageRoot: (model: Model, keys: Set<string>) => Model;
    populateRoots: () => void;
    commit: (staged: Model) => Model;
};
