"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerOption = void 0;
/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
const listRequest_1 = require("./listRequest");
exports.swaggerOption = {
    swaggerDefinition: {
        openapi: "3.0.1",
        info: {
            // API informations (required)
            title: 'SpinalCore Graph API',
            version: '1.0.0',
            description: "Welcome to the reference documentation for the Spinalcore Digital Twin REST API! </br></br>To learn about the common use cases and concept of Spinalcore REST APIs, check out our resource center  (https://resourcecenter.fr.spinalcom.com/ressources-d%C3%A9veloppeur).</br></br>In addition to Spinalcore API Reference, we also provide complete documentation for integrator that need to install and implement Spinalcore Digital Twin Operating System on their built environment (https://resourcecenter.fr.spinalcom.com/ressources-int%C3%A9grateur)",
            termsOfService: "",
            contact: {
                email: "developers@spinalcom.com"
            },
            "x-logo": {
                "url": "/logo.png"
            },
            "x-preferred": true,
            "x-providerName": "spinalcom.com",
            "x-unofficialSpec": true
        },
        components: {
            securitySchemes: {
                OauthSecurity: {
                    type: "oauth2",
                    description: "This API uses OAuth 2 with the implicit grant flow. [More info](https://api.example.com/docs/auth)",
                    flows: {
                        clientCredentials: {
                            tokenUrl: "http://localhost:8080/oauth2/token",
                            scopes: {
                                readOnly: "readOnly request"
                            }
                        }
                    }
                }
            }
        },
        tags: [{
                name: "Pub/Sub",
                description: "pubsub api documentation is available at "
            }],
    },
    apis: (0, listRequest_1.getListRequest)()
};
//# sourceMappingURL=swaggerOption.js.map