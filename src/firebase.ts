import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json";

// Detect if we are running in local fallback / model preview mode:
export const isMockFirebase = 
  !firebaseConfig || 
  firebaseConfig.apiKey === "mock_api_key_placeholder" || 
  firebaseConfig.apiKey.includes("YOUR") ||
  firebaseConfig.apiKey === "";

// Conditionally initialize Firebase App
let firebaseApp;
let firestoreDb: any = null;
let firebaseAuth: any = null;

if (!isMockFirebase) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    firebaseAuth = getAuth(firebaseApp);

    // Validate connection to Firestore as requested by skill
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(firestoreDb, "test", "connection"));
      } catch (error: any) {
        if (error instanceof Error && error.message.includes("offline")) {
          console.warn("Firebase client is offline. Falling back to local replication safely.");
        }
      }
    };
    testConnection();
  } catch (err) {
    console.warn("Failed to initialize Firebase SDK safely. Initializing local database emulation.", err);
  }
}

export const db = firestoreDb;
export const auth = firebaseAuth;

// Conforming to rule 3: strict FirestoreErrorInfo interface and error handler
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || "anonymous_local",
      email: auth?.currentUser?.email || "anonymous_local",
      emailVerified: auth?.currentUser?.emailVerified || false,
      isAnonymous: auth?.currentUser?.isAnonymous || true,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Permission/Access Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
