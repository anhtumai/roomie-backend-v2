import { firebaseAuth } from "../firebase";

export async function validateFirebaseIdToken(idToken: string) {
  const decodedToken = await firebaseAuth.verifyIdToken(idToken);
  return decodedToken;
}
