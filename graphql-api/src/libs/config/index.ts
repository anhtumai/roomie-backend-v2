import "dotenv/config";

export default {
  MONGODB_URI: process.env.MONGODB_URI || "mongodb_uri_undefined",

  FIREBASE: {
    PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "roomie-app-v2",
    CLIENT_EMAIL:
      process.env.FIREBASE_CLIENT_EMAIL || "firebase_client_email_undefined",
    PRIVATE_KEY:
      process.env.FIREBASE_PRIVATE_KEY || "firebase_private_key_undefined",
  },
};
