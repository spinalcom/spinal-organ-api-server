import { SpinalRelationLstPtr, SpinalRelationPtrLst, SpinalRelationRef, SpinalNode } from "spinal-model-graph";
export declare type BaseSpinalRelation = SpinalRelationLstPtr | SpinalRelationPtrLst | SpinalRelationRef;
export declare type SpinalAnyNode = SpinalNode<any> | BaseSpinalRelation;
