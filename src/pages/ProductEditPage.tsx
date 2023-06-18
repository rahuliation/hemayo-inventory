import React, { useState, useEffect } from "react";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonToolbar,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";

import { useHistory, useParams } from "react-router";
import { useMyStore } from "../store/store";
import {
  createDoc,
  getDocById,
  getDocsByQuery,
  updateDoc,
} from "../operations";
import { Category, Product } from "../schema";
import { z } from "zod";
import { useFormik } from "formik";
import { where } from "firebase/firestore";
import { Optional } from "utility-types";

const ProductEditPage = () => {
  const history = useHistory();
  const { productId: productIdParam } = useParams<{ productId: string }>();
  const productId = productIdParam === "create" ? null : productIdParam;

  const [activeInventory] = useMyStore((s) => s.userStore.activeInventory);
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [product, setProduct] = useState< Optional<Product, 'id'>>({
    name: "",
    defaultBuyingPrice: 0,
    defaultSellingPrice: 0,
    categoryId: "",
    inventoryId: activeInventory?.id ?? ""
  });

  const fetchCategoryOptions = async () => {
    try {
      const fetchedCategories = await getDocsByQuery<Category>(
        "categories",
        where("inventoryId", "==", activeInventory?.id)
      );
      setCategoryOptions(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      if(productId) {
        const product = await getDocById<Product>("products", productId);
        if (product) {
          setProduct(product);
        }
      }

    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };


  const onSubmit = async (values: Omit<Product, "id" | 'inventoryId'>) => {
    try {
      if (activeInventory) {
        // Create or update the product with the selected category
        if (productId) {
          await updateDoc("products", productId, {
            ...values,
            inventoryId: activeInventory.id,
          });
        } else {
          await createDoc("products",  {
            ...values,
            inventoryId: activeInventory.id,
          });
        }
      }

      console.log("Product saved successfully.");
      history.push("/products");
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const formik = useFormik({
    initialValues: {
        ...product
    },
    onSubmit,
    enableReinitialize: true,
  });

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
    if(activeInventory) {
      fetchCategoryOptions();
    }
  }, [productId, activeInventory]);


  console.log(categoryOptions)

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/products" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <form onSubmit={formik.handleSubmit}>
          <IonItem>
            <IonLabel position="floating">Product Name</IonLabel>
            <IonInput
              type="text"
              id="name"
              name="name"
              value={formik.values.name}
              onIonChange={formik.handleChange}
              onIonBlur={formik.handleBlur}
            ></IonInput>
          </IonItem>
          {formik.touched.name && formik.errors.name ? (
            <div>{formik.errors.name}</div>
          ) : null}

          <IonItem>
            <IonLabel>Default Buying Price</IonLabel>
            <IonInput
              type="number"
              id="defaultBuyingPrice"
              name="defaultBuyingPrice"
              value={formik.values.defaultBuyingPrice}
              onIonChange={formik.handleChange}
              onIonBlur={formik.handleBlur}
            ></IonInput>
          </IonItem>

          {formik.touched.defaultBuyingPrice &&
          formik.errors.defaultBuyingPrice ? (
            <div>{formik.errors.defaultBuyingPrice}</div>
          ) : null}

          <IonItem>
            <IonLabel>Default Selling Price</IonLabel>
            <IonInput
              type="number"
              id="defaultSellingPrice"
              name="defaultSellingPrice"
              value={formik.values.defaultSellingPrice}
              onIonChange={formik.handleChange}
              onIonBlur={formik.handleBlur}
            ></IonInput>
          </IonItem>
          {formik.touched.defaultSellingPrice &&
          formik.errors.defaultSellingPrice ? (
            <div>{formik.errors.defaultSellingPrice}</div>
          ) : null}

          <IonItem>
            <IonLabel>Category</IonLabel>
            <IonSelect
              id="categoryId"
              name="categoryId"
              value={formik.values.categoryId}
              onIonChange={formik.handleChange}
              onIonBlur={formik.handleBlur}
            >
              <IonSelectOption value="">Select Category</IonSelectOption>
              {categoryOptions.map((category) => (
                <IonSelectOption key={category.id} value={category.id}>
                  {category.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          {formik.touched.categoryId && formik.errors.categoryId ? (
            <div>{formik.errors.categoryId}</div>
          ) : null}

          <IonButton expand="block" type="submit">
            Save Product
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default ProductEditPage;
