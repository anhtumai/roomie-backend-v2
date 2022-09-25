import * as admin from "firebase-admin";

import config from "@config";

const firebaseServiceAccount: admin.ServiceAccount = {
  projectId: config.FIREBASE.PROJECT_ID,
  clientEmail: config.FIREBASE.CLIENT_EMAIL,
  privateKey: config.FIREBASE.PRIVATE_KEY,
};

const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount),
});
const firebaseAuth = firebaseApp.auth();

export async function validateFirebaseIdToken(idToken: string) {
  const decodedToken = await firebaseAuth.verifyIdToken(idToken);
  return decodedToken;
}
