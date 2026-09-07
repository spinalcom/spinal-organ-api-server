export type ConsumedFunction<T> = () => Promise<T>;
export declare function consumeBatch<T>(promises: ConsumedFunction<T>[], batchSize?: number): Promise<T[]>;
