// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const hacli = require('@antoniogiordano/hacli');

// users
const users = require('./api/users');
const UsersService = require('./services/UsersService');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');

// products
const products = require('./api/products');
const ProductsService = require('./services/ProductsService');

// LLMs
const llms = require('./api/llms');
const LLMsService = require('./services/LLMsService');

const init = async () => {
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();
    const productsService = new ProductsService();
    const llmsService = new LLMsService();

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        debug: {
            request: ['error']
        },
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    /**
          * @TODO 4
          * Register the plugin Jwt and hacli
        */
    await server.register([
        {
            plugin: Jwt
        },
        {
            plugin: hacli,
            options: {
                permissions: ['ADMIN', 'VIEWER']
            }
        }
    ]);


    /**
          * @TODO 5
          * Mendefinisikan strategy autentikasi jwt
        */
    server.auth.strategy('ecommerce_app', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => {
            return {
                isValid: true,
                credentials: {
                    id: artifacts.decoded.payload.id,
                    permissions: artifacts.decoded.payload.role,
                },
            };
        }
    });

    await server.register([
        {
            plugin: users,
            options: {
                service: usersService,
            },
        },
        {
            plugin: authentications,
            options: {
                authenticationsService,
                usersService,
                tokenManager: TokenManager,
            },
        },
        {
            plugin: products,
            options: {
                service: productsService
            }
        },
        {
            plugin: llms,
            options: {
                service: llmsService,
            }
        }
    ]);

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
