import type { Patch } from './schema';
export declare function selectPatchBranches(patch: Patch): {
    selected: {
        info: Set<string>;
        element: Set<string>;
    };
    fullElement: boolean;
    selectedAttrs: Map<string, Set<string>>;
};
