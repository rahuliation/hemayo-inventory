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

import { useHistory, useLocation, useParams } from "react-router";
import { useMyStore } from "../store/store";
import {
  createDoc,
  getDocById,
  getDocsByQuery,
  getRef,
  updateDoc,
} from "../operations";
import { Category, Product } from "../schema";
import { z } from "zod";
import { useFormik } from "formik";
import { where } from "firebase/firestore";
import { Optional } from "utility-types";




const ProductEditPage = () => {
  const history = useHistory();
  const location = useLocation();

  const { productId: productIdParam } = useParams<{ productId: string }>();
  const productId = productIdParam === "create" ? null : productIdParam;

  const [activeInventory] = useMyStore((s) => s.userStore.activeInventory);
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const initProduct = {
    name: "",
    defaultBuyingPrice: 0,
    defaultSellingPrice: 0,
    categoryRef: "",
    inventoryRef: activeInventory?.id,
  };
  const [product, setProduct] = useState<Optional<Product, "id">>(initProduct);

  const fetchCategoryOptions = async () => {
    try {
      if (activeInventory) {
        const fetchedCategories = await getDocsByQuery<Category>(
          "categories",
          where(
            "inventoryRef",
            "==",
            getRef("inventories", activeInventory?.id)
          )
        );
        setCategoryOptions(fetchedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      if (productId) {
        const product = await getDocById<Product>("products", productId);
        if (product) {
          setProduct(product);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const onSubmit = async (values: Optional<Product, "id" | "inventoryRef">) => {
    try {
      if (activeInventory) {
        // Create or update the product with the selected category
        if (productId) {
          await updateDoc<Product>("products", productId, {
            ...values,
            categoryRef: getRef("categories", values.categoryRef),
            inventoryRef: getRef("inventories", activeInventory.id),
          });
        } else {
          await createDoc<Product>("products", {
            ...values,
            categoryRef: getRef("categories", values.categoryRef),
            inventoryRef: getRef("inventories", activeInventory.id),
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
      ...product,
      categoryRef: product.categoryRef.id,
    },
    onSubmit,
    enableReinitialize: true,
  });

  useEffect(() => {
    if (productId) {
      fetchProduct();
    } else {
      setProduct(initProduct)
    }
    fetchCategoryOptions();
  }, [productId, activeInventory, location]);

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
            <IonInput
              label="Product Name"
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
            <IonInput
              label="Buying Price"
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
            <IonInput
              label="Selling Price"
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
            <IonSelect
              label="Category"
              id="categoryRef"
              name="categoryRef"
              placeholder="Select"
              value={formik.values.categoryRef}
              onIonChange={formik.handleChange}
              onIonBlur={formik.handleBlur}
            >
              {categoryOptions.map((category) => (
                <IonSelectOption key={category.id} value={category.id}>
                  {category.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          {formik.touched.categoryRef && formik.errors.categoryRef ? (
            <div>{formik.errors.categoryRef as string}</div>
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
