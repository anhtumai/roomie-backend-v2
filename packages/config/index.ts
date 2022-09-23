import "dotenv/config";

export default {
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN || "auth0_domain_undefined",
  API_IDENTIFIER: process.env.API_IDENTIFIER || "api_identifier_undefined",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb_uri_undefined",
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || "auth0_client_id_undefined",

  AUTH0_CLIENT_SECRET:
    process.env.AUTH0_CLIENT_SECRET || "auth0_client_secret_undefined",
};
