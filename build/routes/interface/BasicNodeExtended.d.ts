import type { BasicNode } from './BasicNode';
export type BasicNodeExtended<Attr extends readonly string[] | undefined> = BasicNode & (Attr extends readonly string[] ? {
    [K in Attr[number]]?: string | number | boolean | undefined;
} : {});
