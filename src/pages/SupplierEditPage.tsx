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
  IonTextarea,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import { useHistory, useParams } from "react-router";
import { useMyStore } from "../store/store";
import { createDoc, getDocById, getRef, updateDoc } from "../operations";
import { Supplier } from "../schema";
import { useFormik } from "formik";
import { Optional } from "utility-types";

const SupplierEditPage = () => {
  const history = useHistory();
  const { supplierId: supplierIdParam } = useParams<{ supplierId: string }>();

  const supplierId = supplierIdParam === "create" ? "" : supplierIdParam;

  const [activeInventory] = useMyStore((s) => s.userStore.activeInventory);

  const [supplier, setSupplier] = useState<Optional<Supplier, "id">>(
    {
      address: "",
      inventoryRef: "",
      name: "",
      phoneNumber: "",
    }
  );

  const onSubmit = async (values: Optional<Supplier, "id" | "inventoryRef">) => {
    try {
      if (activeInventory) {
        if (supplierId) {
          await updateDoc<Supplier>("suppliers", supplierId, {
            inventoryRef: getRef("inventories", activeInventory.id),
            name: values.name,
          });
        } else {
          await createDoc<Supplier>("suppliers", {
            ...values,
            inventoryRef: getRef("inventories", activeInventory.id),
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
      ...supplier,
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
      if(supplier) {
        setSupplier(supplier);
      }
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
          <IonTitle> Supplier Entry</IonTitle>

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

          <IonItem>
            <IonLabel position="floating">Phone Number</IonLabel>
            <IonInput
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formik.values.phoneNumber}
              onIonChange={formik.handleChange}
              onIonBlur={formik.handleBlur}
            ></IonInput>
          </IonItem>
          {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
            <div>{formik.errors.phoneNumber}</div>
          ) : null}

          <IonItem>
            <IonLabel position="floating">Adress</IonLabel>
            <IonTextarea
              id="address"
              name="address"
              onIonChange={formik.handleChange}
              onIonBlur={formik.handleBlur}
            >
              {formik.values.address}
            </IonTextarea>
          </IonItem>
          {formik.touched.address && formik.errors.address ? (
            <div>{formik.errors.phoneNumber}</div>
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
