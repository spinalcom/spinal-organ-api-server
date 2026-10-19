import { z } from 'zod';
export declare const createBuildingSchema: z.ZodObject<{
    info: z.ZodObject<{
        name: z.ZodString;
        color: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodOptional<z.ZodType<import("../node/element/schema").ElementValue, unknown, z.core.$ZodTypeInternals<import("../node/element/schema").ElementValue, unknown>>>>>;
    attributes: z.ZodOptional<z.ZodObject<{
        'Spinal Building Information': z.ZodOptional<z.ZodObject<{
            Adresse: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
                $modelRef: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"self">]>;
                path: z.ZodString;
            }, z.core.$strict>]>>;
        }, z.core.$catchall<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
            $modelRef: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"self">]>;
            path: z.ZodString;
        }, z.core.$strict>]>>>>;
        Spatial: z.ZodOptional<z.ZodObject<{
            area: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
                $modelRef: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"self">]>;
                path: z.ZodString;
            }, z.core.$strict>]>>;
        }, z.core.$catchall<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
            $modelRef: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"self">]>;
            path: z.ZodString;
        }, z.core.$strict>]>>>>;
    }, z.core.$catchall<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
        $modelRef: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"self">]>;
        path: z.ZodString;
    }, z.core.$strict>]>>>>>;
}, z.core.$strip>;
export declare const createFloorSchema: z.ZodObject<{
    info: z.ZodObject<{
        virtual: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        name: z.ZodString;
        color: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodOptional<z.ZodType<import("../node/element/schema").ElementValue, unknown, z.core.$ZodTypeInternals<import("../node/element/schema").ElementValue, unknown>>>>>;
    linkToGroups: z.ZodOptional<z.ZodArray<z.ZodObject<{
        contextDynamicId: z.ZodNumber;
        groupDynamicId: z.ZodNumber;
    }, z.core.$strict>>>;
    attributes: z.ZodOptional<z.ZodObject<{
        Spatial: z.ZodOptional<z.ZodObject<{
            area: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
                $modelRef: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"self">]>;
                path: z.ZodString;
            }, z.core.$strict>]>>;
        }, z.core.$catchall<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
            $modelRef: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"self">]>;
            path: z.ZodString;
        }, z.core.$strict>]>>>>;
    }, z.core.$catchall<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
        $modelRef: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"self">]>;
        path: z.ZodString;
    }, z.core.$strict>]>>>>>;
}, z.core.$strip>;
export declare const createRoomSchema: z.ZodObject<{
    dynamicFloorId: z.ZodNumber;
    info: z.ZodObject<{
        virtual: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        name: z.ZodString;
        color: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodOptional<z.ZodType<import("../node/element/schema").ElementValue, unknown, z.core.$ZodTypeInternals<import("../node/element/schema").ElementValue, unknown>>>>>;
    linkToGroups: z.ZodOptional<z.ZodArray<z.ZodObject<{
        contextDynamicId: z.ZodNumber;
        groupDynamicId: z.ZodNumber;
    }, z.core.$strict>>>;
    attributes: z.ZodOptional<z.ZodObject<{
        Spatial: z.ZodOptional<z.ZodObject<{
            area: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
                $modelRef: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"self">]>;
                path: z.ZodString;
            }, z.core.$strict>]>>;
        }, z.core.$catchall<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
            $modelRef: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"self">]>;
            path: z.ZodString;
        }, z.core.$strict>]>>>>;
    }, z.core.$catchall<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
        $modelRef: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"self">]>;
        path: z.ZodString;
    }, z.core.$strict>]>>>>>;
}, z.core.$strip>;
export declare const createEquipmentSchema: z.ZodObject<{
    parentDynamicId: z.ZodNumber;
    isRefObject: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    info: z.ZodObject<{
        virtual: z.ZodOptional<z.ZodBoolean>;
        dbid: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        externalId: z.ZodOptional<z.ZodString>;
        bimFileId: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        color: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
    }, z.core.$catchall<z.ZodOptional<z.ZodType<import("../node/element/schema").ElementValue, unknown, z.core.$ZodTypeInternals<import("../node/element/schema").ElementValue, unknown>>>>>;
    linkToGroups: z.ZodOptional<z.ZodArray<z.ZodObject<{
        contextDynamicId: z.ZodNumber;
        groupDynamicId: z.ZodNumber;
    }, z.core.$strict>>>;
    attributes: z.ZodOptional<z.ZodObject<{
        Spatial: z.ZodOptional<z.ZodObject<{
            area: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
                $modelRef: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"self">]>;
                path: z.ZodString;
            }, z.core.$strict>]>>;
        }, z.core.$catchall<z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
            $modelRef: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"self">]>;
            path: z.ZodString;
        }, z.core.$strict>]>>>>;
    }, z.core.$catchall<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodObject<{
        $modelRef: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"self">]>;
        path: z.ZodString;
    }, z.core.$strict>]>>>>>;
}, z.core.$strip>;
