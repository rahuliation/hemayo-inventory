import DataLoader from "dataloader";
import _ from "lodash";
import { z } from "zod";
import { db } from "./firebase";
import {
  collection,
  doc,
  documentId,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const batchLoader = async (keys: readonly string[]) => {
  const collName = _.first(_.split(_.first(keys), "/")) as string;

  const collectionRef = collection(db, collName);

  const idChanks = _.chunk(
    _.map(keys, (key) => doc(db, key)),
    30
  );

  const data = await Promise.all(
    _.map(idChanks, async (ids) => {
      const q = query(collectionRef, where(documentId(), "in", ids));
      const querySnapshot = await getDocs(q);
      return _.map(querySnapshot.docs, (doc) => ({
        docPath: doc.ref.path,
        id: doc.id,
        ...doc.data(),
      }));
    })
  ).then((res) => _.flatMap(res));
  return _.map(keys, (key) => _.find(data, { docPath: key }));
};

type BaseModel = {
  id: string;
};

export const inventorySchema = z.object({
  storeName: z.string(),
  userId: z.string(),
});
export type Inventory = z.infer<typeof inventorySchema> & BaseModel;

export const categorySchema = z.object({
  name: z.string(),
  inventoryRef: z.any(),
});
export type Category = z.infer<typeof categorySchema> & BaseModel;

export const productSchema = z.object({
  name: z.string(),
  categoryRef: z.any(),
  inventoryRef: z.any(),
  defaultBuyingPrice: z.number(),
  defaultSellingPrice: z.number(),
});
export type Product = z.infer<typeof productSchema> &
  BaseModel & {
    category?: Category;
    inventory?: Inventory;
  };

export const supplierSchema = z.object({
  name: z.string(),
  phoneNumber: z.string(),
  inventoryRef: z.any(),
  address: z.string(),
});
export type Supplier = z.infer<typeof supplierSchema> & BaseModel;

export const stockInSchema = z.object({
  date: z.any(),
  supplierRef: z.any(),
  productRef: z.any(),
  price: z.number().min(1),
  quantity: z.number().min(1),
  inventoryRef: z.any(),
  currentStockRef: z.any(),
});

export type StockIn = z.infer<typeof stockInSchema> &
  BaseModel & {
    product?: Product;
    invenotry?: Inventory;
    supplier?: Supplier;
  };

export const stockOutSchema = z.object({
  date: z.any(),
  productRef: z.any(),
  price: z.number().min(1),
  buyingPrice: z.number().min(1),
  quantity: z.number().min(1),
  inventoryRef: z.any(),
  currentStockRef: z.any(),
});

export type StockOut = z.infer<typeof stockOutSchema> &
  BaseModel & {
    product?: Product;
    invenotry?: Inventory;
  };

export const currentStockSchema = z.object({
  productRef: z.any(),
  price: z.number().min(1),
  quantity: z.number().min(0),
  inventoryRef: z.any(),
  editableRef: z.any(),
});

export type CurrentStock = z.infer<typeof currentStockSchema> &
  BaseModel & {
    product?: Product;
    invenotry?: Inventory;
    supplier?: Supplier;
  };

const collections = {
  inventories: {
    schema: inventorySchema,
    batchLoader: new DataLoader<string, unknown>((keys) => batchLoader(keys)),
  },
  categories: {
    schema: categorySchema,
    batchLoader: new DataLoader<string, unknown>((keys) => batchLoader(keys)),
  },
  products: {
    schema: productSchema,
    batchLoader: new DataLoader<string, unknown>((keys) => batchLoader(keys)),
  },
  suppliers: {
    schema: supplierSchema,
    batchLoader: new DataLoader<string, unknown>((keys) => batchLoader(keys)),
  },
  currentStocks: {
    schema: currentStockSchema,
    batchLoader: new DataLoader<string, unknown>((keys) => batchLoader(keys)),
  },
  stockIns: {
    schema: stockInSchema,
    batchLoader: new DataLoader<string, unknown>((keys) => batchLoader(keys)),
  },
  stockOuts: {
    schema: stockOutSchema,
    batchLoader: new DataLoader<string, unknown>((keys) => batchLoader(keys)),
  },
};

export type CollectionName = keyof typeof collections;

export const getCollection = (collectionName: CollectionName) => {
  if (collectionName in collections) {
    return collections[collectionName];
  }
  throw new Error("Invalid collection name.");
};
