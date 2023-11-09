import { SpinalRelationLstPtr, SpinalRelationPtrLst, SpinalRelationRef, SpinalNode } from "spinal-model-graph";
export type BaseSpinalRelation = SpinalRelationLstPtr | SpinalRelationPtrLst | SpinalRelationRef;
export type SpinalAnyNode = SpinalNode<any> | BaseSpinalRelation;
