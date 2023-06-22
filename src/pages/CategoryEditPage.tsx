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
} from "@ionic/react";

import { useHistory, useParams } from "react-router";
import { useMyStore } from "../store/store";
import { createDoc, getDocById, getRef, updateDoc } from "../operations";
import { Category } from "../schema";
import { useFormik } from "formik";

const CategoryEditPage = () => {
  const history = useHistory();
  const { categoryId: categoryIdParam  } = useParams<{ categoryId: string }>();

  const categoryId = categoryIdParam==='create' ? '' : categoryIdParam;

  const [activeInventory] = useMyStore((s) => s.userStore.activeInventory);

  const [category, setCategory] = useState<Category | undefined>(undefined);


  const onSubmit = async (values: { name: string }) => {
    try {
      if (activeInventory) {
        if (categoryId) {
          await updateDoc<Category>("categories", categoryId, {
            inventoryRef: getRef('inventories', activeInventory.id),
            name: values.name,
          });
        } else {
          await createDoc<Category>("categories", {
            inventoryRef:  getRef('inventories', activeInventory.id),
            name: values.name,
          });
        }
      }
      console.log("Category saved successfully.");
      history.goBack();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: category?.name ?? ''
    },
    onSubmit,
    enableReinitialize: true,
  });

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      const category = await getDocById<Category>("categories", categoryId);
      setCategory(category ?? undefined)
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/categories" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <form onSubmit={formik.handleSubmit}>
          <IonItem>
            <IonLabel position="floating">Category Name</IonLabel>
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

          <IonButton expand="block" type="submit">
            Save Category
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default CategoryEditPage;
