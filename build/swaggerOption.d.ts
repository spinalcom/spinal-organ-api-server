export declare const swaggerOption: {
    swaggerDefinition: {
        openapi: string;
        info: {
            title: string;
            version: string;
            description: string;
            termsOfService: string;
            contact: {
                email: string;
            };
            "x-logo": {
                url: string;
            };
            "x-preferred": boolean;
            "x-providerName": string;
            "x-unofficialSpec": boolean;
        };
        components: {
            securitySchemes: {
                OauthSecurity: {
                    type: string;
                    description: string;
                    flows: {
                        clientCredentials: {
                            tokenUrl: string;
                            scopes: {
                                readOnly: string;
                            };
                        };
                    };
                };
            };
        };
        tags: {
            name: string;
            description: string;
        }[];
    };
    apis: string[];
};
