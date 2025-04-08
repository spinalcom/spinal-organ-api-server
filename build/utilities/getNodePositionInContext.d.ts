export declare function getNodePositionInContext(context: any, node: any): Promise<{
    name: any;
    dynamicId: any;
    type: any;
    parentsInContext: any[];
    id?: undefined;
} | {
    name: any;
    id: any;
    parentsInContext: any[];
    dynamicId?: undefined;
    type?: undefined;
}>;
