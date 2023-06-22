import React, { useState, useEffect } from "react";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import { useHistory, useLocation } from "react-router";
import { useMyStore } from "../store/store";
import { Product, StockIn, Supplier } from "../schema";
import { useFormik } from "formik";
import { Optional } from "utility-types";
import { Timestamp, where } from "firebase/firestore";
import {
  exeTransaction,
  generateRef,
  getDocsByQuery,
  getRef,
} from "../operations";
import ModalSelect from "../components/ModalSelect";
import _ from "lodash";
import DateSelect from "../components/DateSelect";
import dayjs from "dayjs";

const StockInEditPage = () => {
  const history = useHistory();
  const location = useLocation();

  const [productOptions, setProductOptions] = useState<Product[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<Supplier[]>([]);

  const [activeInventory] = useMyStore((s) => s.userStore.activeInventory);

  const fetchSuppliers = async () => {
    try {
      if (activeInventory) {
        const fetchSuppliers = await getDocsByQuery<Supplier>(
          "suppliers",
          where(
            "inventoryRef",
            "==",
            getRef("inventories", activeInventory?.id)
          )
        );
        setSupplierOptions(fetchSuppliers);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const initStockIn = {
    price: 0,
    inventoryRef: "",
    quantity: 1,
    supplierRef: "",
    productRef: "",
    date: dayjs().toISOString(),
  };

  const fetchProducts = async () => {
    try {
      if (activeInventory) {
        const fetchProduct = await getDocsByQuery<Product>(
          "products",
          where(
            "inventoryRef",
            "==",
            getRef("inventories", activeInventory?.id)
          )
        );
        setProductOptions(fetchProduct);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const [stockIn, setStockIn] = useState<Optional<StockIn, "id">>(initStockIn);

  const onSubmit = async (values: Optional<StockIn, "id" | "inventoryRef">) => {
    try {
      if (activeInventory) {
        const stockInId = generateRef("stockIns");
        const stockId = getRef(
          "currentStocks",
          `${values.productRef}-${values.price}`
        );
        const supplierRef = getRef("suppliers", values.supplierRef);
        const productRef = getRef("products", values.productRef);
        const inventoryRef = getRef("inventories", activeInventory.id);
        const stockInDoc = {
          supplierRef,
          productRef,
          date: Timestamp.fromDate(new Date(values.date)),
          inventoryRef: inventoryRef,
          price: values.price,
          quantity: values.quantity,
          currentStockRef: stockId,
        };

        await exeTransaction(async (transaction) => {
          const currentStock = await transaction.get(stockId);

          if (!currentStock.exists()) {
            transaction.set(stockId, {
              productRef,
              price: values.price,
              quantity: values.quantity,
              inventoryRef,
              editableRef: stockInId,
            });
          } else {
            const quantity = currentStock.data().quantity + values.quantity;
            transaction.update(stockId, { quantity, editableRef: stockInId });
          }

          transaction.set(stockInId, stockInDoc);
        });
      }
      setStockIn(initStockIn);
      history.push("/stockIns");
      console.log("StockIn saved successfully.");
      // history.goBack();
    } catch (error) {
      console.error("Error saving StockOut:", error);
    }
  };

  const formik = useFormik({
    initialValues: {
      ...stockIn,
    },
    onSubmit,
    enableReinitialize: true,
  });

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, [activeInventory, location]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/stockIns" />
          </IonButtons>
          <IonTitle> Stock In Entry</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <form onSubmit={formik.handleSubmit}>
          <DateSelect
            label="Date"
            name={"date"}
            onDateClick={(value) => {
              console.log(value);
            }}
            value={formik.values.date}
            onIonChange={formik.handleChange}
            onIonBlur={formik.handleBlur}
          />

          <IonItem>
            <IonSelect
              label="Supplier"
              id="supplierRef"
              name="supplierRef"
              placeholder="Select"
              value={formik.values.supplierRef}
              onIonChange={formik.handleChange}
              onIonBlur={formik.handleBlur}
            >
              {supplierOptions.map((supplier) => (
                <IonSelectOption key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          {formik.touched.supplierRef && formik.errors.supplierRef ? (
            <div>{formik.errors.supplierRef as string}</div>
          ) : null}

          {formik.touched.price && formik.errors.price ? (
            <div>{formik.errors.price}</div>
          ) : null}
          <ModalSelect
            options={_.map(productOptions, (p) => ({
              name: p.name,
              value: p.id,
            }))}
            label="Product"
            name={"productRef"}
            value={formik.values.productRef}
            placeholder="Select one"
            onConfirm={(val) => {
              const product = _.find(productOptions, { id: val });
              formik.setFieldValue("price", product?.defaultBuyingPrice);
              formik.setFieldValue("productRef", val);
            }}
          />
          {formik.touched.productRef && formik.errors.productRef ? (
            <div>{formik.errors.productRef as string}</div>
          ) : null}
          <IonItem>
            <IonInput
              label="Price"
              type="number"
              id="price"
              name="price"
              min={1}
              value={formik.values.price}
              onIonChange={formik.handleChange}
              onIonBlur={formik.handleBlur}
            ></IonInput>
          </IonItem>
          {formik.touched.price && formik.errors.price ? (
            <div>{formik.errors.price}</div>
          ) : null}

          <IonItem>
            <IonInput
              type="number"
              label="Quantity"
              id="quantity"
              name="quantity"
              min={1}
              value={formik.values.quantity}
              onIonChange={formik.handleChange}
              onIonBlur={formik.handleBlur}
            ></IonInput>
          </IonItem>
          {formik.touched.quantity && formik.errors.quantity ? (
            <div>{formik.errors.quantity}</div>
          ) : null}

          <IonButton expand="block" type="submit">
            Save
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default StockInEditPage;
