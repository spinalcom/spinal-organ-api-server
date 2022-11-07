import { SpinalNode } from "spinal-model-graph";
import { Relation } from '../routes/nodes/interfacesNodes';
declare function childrensNode(node: SpinalNode<any>): Relation[];
declare function parentsNode(node: SpinalNode<any>): Promise<Relation[]>;
export { childrensNode, parentsNode };
