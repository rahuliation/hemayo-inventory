import {
  DocumentData,
  DocumentReference,
  QueryConstraint,
  Transaction,
  TransactionOptions,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import _ from "lodash";
import { CollectionName, getCollection } from "./schema";

export const getRef = (
  collectionName: CollectionName,
  id: string
): DocumentReference<DocumentData> => doc(db, collectionName, id);

export const generateRef = (
  collectionName: CollectionName
): DocumentReference<DocumentData> => {
  const collectionRef = collection(db, collectionName);
  return doc(collectionRef);
};

export const getDocById = async <T>(
  collectionName: CollectionName,
  id: string
): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      return processData(docSnapshot) as T;
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
  const coll = getCollection(collectionName);
  coll.schema.partial().parse(values);

  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, values, { merge: true });
    console.log("Document updated successfully.");
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const removeDoc = async (collectionName: CollectionName, id: string) => {
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
  values: Omit<T, "id">
): Promise<string> => {
  // Validate the provided values against the schema
  const coll = getCollection(collectionName);
  coll.schema.parse(values);

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

    const data = (await Promise.all(
      _.map(querySnapshot.docs, processData)
    )) as T[];
    return data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

const processData = async (doc: DocumentData) => {
  ///loop through object to get loader . but it converted to array.. so we have to make it
  const docData = await Promise.all(
    _.map(doc.data(), async (val, key) => {
      if (/.*Ref(s?)$/.test(key)) {
        const collName = val.parent.id;
        const { batchLoader } = getCollection(collName);
        const keyName = _.replace(key, /Ref(s?)/, "");
        return [
          {
            key: keyName,
            val: await batchLoader.load(val.path),
          },
          {
            key,
            val,
          },
        ];
      }
      return {
        key,
        val,
      };
    })
  ).then((res) => _.chain(res).flatMap().keyBy("key").mapValues("val").value());

  return _.extend(docData, { id: doc.id });
};

export const getDocsByQuery = async <T>(
  collectionName: CollectionName,
  ...queryConstraints: QueryConstraint[]
): Promise<T[]> => {
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    const data = (await Promise.all(
      _.map(querySnapshot.docs, processData)
    )) as T[];

    // await Promise.all(_.map(dispatchers, dispatch => dispatch()))

    return data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

export const exeTransaction = async <T>(
  updateFunction: (transaction: Transaction) => Promise<T>,
  options?: TransactionOptions
): Promise<T> => {
  return runTransaction(db, updateFunction, options);
};
