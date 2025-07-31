import { SpinalNode } from 'spinal-env-viewer-graph-service';
/**
    * @param  {SpinalNode} node
    * @param  {any} valueToPush
    * @param  {any} dataType
    * @param  {any} type
    * @returns Promise
    */
export declare function updateControlEndpointWithAnalytic(node: any, valueToPush: any, dataType: any, type: any): Promise<void>;
/**
 * Update the endpoint with given value. More resilient and can handle string values.
 * This function was coded but not used yet as it was mentionned that the models changing would break all the  bindings on said models.
 */
export declare function updateControlEndpointWithValue(node: SpinalNode<any>, valueToPush: string | number | boolean, shouldReplaceDataType?: boolean): Promise<void>;
