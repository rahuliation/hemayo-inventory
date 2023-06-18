import { z } from "zod";


export type CollectionName = "inventories" | "categories"| 'products' | 'suppliers';


type  BaseModel  = {
  id: string;
}

export const inventorySchema = z.object({
  storeName: z.string(),
  userId: z.string(),
});

export const categorySchema = z.object({
  name: z.string(),
  inventoryId: z.string()
});

export const productSchema = z.object({
  name: z.string(),
  categoryId: z.string(),
  inventoryId: z.string(),
  defaultBuyingPrice: z.number(),
  defaultSellingPrice: z.number(),
});

export const supplierSchema = z.object({
  name: z.string(),
  phoneNumber: z.number(),
  inventoryId: z.string(),
  address: z.string(),
});



export type Inventory = z.infer<typeof inventorySchema> & BaseModel;
export type Category = z.infer<typeof categorySchema> & BaseModel;
export type Product = z.infer<typeof productSchema> & BaseModel;
export type Supplier = z.infer<typeof supplierSchema> & BaseModel;


export const getSchema = (collectionName: CollectionName) => {
    if (collectionName === "inventories") {
      return inventorySchema;
    } else if (collectionName === "categories") {
      return categorySchema;
    } else if (collectionName === "products") {
      return productSchema;
    } else if (collectionName === "suppliers") {
      return supplierSchema;
    }


    throw new Error("Invalid collection name.");
  };