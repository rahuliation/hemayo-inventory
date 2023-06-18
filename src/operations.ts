import {
  QueryConstraint,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import _ from "lodash";
import { CollectionName, getSchema } from "./schema";



export const getDocById = async <T>(
  collectionName: CollectionName,
  id: string
): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      return { id: docSnapshot.id, ...docSnapshot.data() } as T;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
};

export const updateDoc = async <T>(
  collectionName: CollectionName,
  id: string,
  values: Partial<T>
) => {
  // Validate the provided values against the schema
  const schema = getSchema(collectionName);
  schema.parse(values);

  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, values, { merge: true });
    console.log("Document updated successfully.");
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const removeDoc = async (
  collectionName: CollectionName,
  id: string
) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    console.log("Document deleted successfully.");
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

export const createDoc = async <T>(
  collectionName: CollectionName,
  values: Omit<T, 'id'>
): Promise<string> => {
  // Validate the provided values against the schema
  const schema = getSchema(collectionName);
  schema.parse(values);

  try {
    const collectionRef = collection(db, collectionName);
    const newDocRef = await addDoc(collectionRef, values);
    console.log("Document created successfully with ID:", newDocRef.id);
    return newDocRef.id;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};

export const getDocsAll = async <T>(
  collectionName: CollectionName
): Promise<T[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
    return data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

export const getDocsByQuery = async <T>(
  collectionName: CollectionName,
  ...queryConstraints: QueryConstraint[]
): Promise<T[]> => {
  try {
    const q = query(collection(db, collectionName), ...queryConstraints);
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
    return data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

// Helper function to get the schema based on the collection name
