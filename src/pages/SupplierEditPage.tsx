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
import { createDoc, getDocById, updateDoc } from "../operations";
import { Supplier } from "../schema";
import { useFormik } from "formik";

const SupplierEditPage = () => {
  const history = useHistory();
  const { supplierId: supplierIdParam  } = useParams<{ supplierId: string }>();

  const supplierId = supplierIdParam==='create' ? '' : supplierIdParam;

  const [activeInventory] = useMyStore((s) => s.userStore.activeInventory);

  const [supplier, setSupplier] = useState<Supplier | undefined>(undefined);


  const onSubmit = async (values: { name: string }) => {
    try {
      if (activeInventory) {
        if (supplierId) {
          await updateDoc<Supplier>("suppliers", supplierId, {
            inventoryId: activeInventory.id,
            name: values.name,
          });
        } else {
          await createDoc<Supplier>("suppliers", {
            inventoryId: activeInventory.id,
            name: values.name,
          });
        }
      }
      console.log("Supplier saved successfully.");
      history.goBack();
    } catch (error) {
      console.error("Error saving supplier:", error);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: supplier?.name ?? ''
    },
    onSubmit,
    enableReinitialize: true,
  });

  useEffect(() => {
    if (supplierId) {
      fetchSupplier();
    }
  }, [supplierId]);

  const fetchSupplier = async () => {
    try {
      const supplier = await getDocById<Supplier>("suppliers", supplierId);
      setSupplier(supplier ?? undefined)
    } catch (error) {
      console.error("Error fetching supplier:", error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/suppliers" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <form onSubmit={formik.handleSubmit}>
          <IonItem>
            <IonLabel position="floating">Supplier Name</IonLabel>
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
            Save Supplier
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default SupplierEditPage;
