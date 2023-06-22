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
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import { useHistory, useLocation } from "react-router";
import { useMyStore } from "../store/store";
import { CurrentStock, Product, StockOut, Supplier } from "../schema";
import { useFormik } from "formik";
import { Optional } from "utility-types";
import { Timestamp, limit, where } from "firebase/firestore";
import {
  createDoc,
  exeTransaction,
  generateRef,
  getDocById,
  getDocsByQuery,
  getRef,
  updateDoc,
} from "../operations";
import ModalSelect from "../components/ModalSelect";
import _ from "lodash";
import DateSelect from "../components/DateSelect";
import dayjs from "dayjs";

const StockOutEditPage = () => {
  const history = useHistory();
  const location = useLocation();

  const [stockedProducts, setStockedProducts] = useState<CurrentStock[]>([]);

  const [max, setMax] = useState<number>(1);

  const [activeInventory] = useMyStore((s) => s.userStore.activeInventory);

  const init = {
    price: 0,
    inventoryRef: "",
    quantity: 1,
    productRef: "",
    date: dayjs().toISOString(),
    currentStockId: "",
    buyingPrice: 1,
  };

  const fetchStockedProduct = async () => {
    try {
      if (activeInventory) {
        const fetchStockedProduct = await getDocsByQuery<CurrentStock>(
          "currentStocks",
          where(
            "inventoryRef",
            "==",
            getRef("inventories", activeInventory?.id)
          ),
          where("quantity", ">", 0)
        );
        setStockedProducts(fetchStockedProduct);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const [stockOut, setStockOut] = useState<
    Optional<StockOut, "id"> & { currentStockId: string }
  >(init);

  const onSubmit = async (
    values: Optional<StockOut, "id" | "inventoryRef"> & {
      currentStockId: string;
    }
  ) => {
    try {
      if (activeInventory) {
        const stockOutId = generateRef("stockOuts");
        const stockId = getRef("currentStocks", values.currentStockId);
        const productRef = getRef("products", values.productRef);
        const inventoryRef = getRef("inventories", activeInventory.id);

        const stockOutDoc = {
          productRef,
          date: Timestamp.fromDate(new Date(values.date)),
          inventoryRef,
          price: values.price,
          currentStockRef: stockId,
          quantity: values.quantity,
          buyingPrice: values.buyingPrice,
        };

        await exeTransaction(async (transaction) => {
          const currentStock = await transaction.get(stockId);
          if (!currentStock.exists()) {
            throw "No stock Record";
          } else {
            const stockQuantity = currentStock.data()?.quantity;
            if (stockQuantity >= values.quantity) {
              const quantity = stockQuantity - values.quantity;
              transaction.update(stockId, { quantity, editableRef: stockOutId });
              transaction.set(stockOutId, stockOutDoc);
            } else {
              throw "Quantity is more than stock quanity";
            }
          }
        });
      }
      console.log("StockOut saved successfully.");
      setStockOut(init);
      history.push("/stockOuts");
    } catch (error) {
      console.error("Error saving StockOut:", error);
    }
  };

  const formik = useFormik({
    initialValues: {
      ...stockOut,
    },
    onSubmit,
    enableReinitialize: true,
  });

  useEffect(() => {
    fetchStockedProduct();
  }, [activeInventory, location]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/stockOuts" />
          </IonButtons>
          <IonTitle> Stock Out Entry</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <form onSubmit={formik.handleSubmit}>
          <DateSelect
            label="Date"
            name={"date"}
            value={formik.values.date}
            onIonChange={formik.handleChange}
            onIonBlur={formik.handleBlur}
          />

          {formik.touched.price && formik.errors.price ? (
            <div>{formik.errors.price}</div>
          ) : null}
          <ModalSelect
            options={_.map(stockedProducts, (p) => ({
              name: `${p.product?.name}`,
              value: p.id,
              extra: ` Price: ${p.price} Quantity: ${p.quantity}`,
            }))}
            label="Stocked Product"
            name={"currentStockId"}
            value={formik.values.currentStockId}
            placeholder="Select one"
            onConfirm={(val) => {
              const stocked = _.find(stockedProducts, { id: val });
              if (stocked) {
                formik.setFieldValue(
                  "price",
                  stocked.product?.defaultSellingPrice
                );
                setMax(stocked.quantity);
                formik.setFieldValue("productRef", stocked.productRef.id);
                formik.setFieldValue("byingPrice", stocked.price);
              }
              formik.setFieldValue("currentStockId", val);
            }}
          />
          {/* {formik.touched.currentStockId && formik.errors.currentStockId ? (
            <div>{formik.errors.currentStockId as string}</div>
          ) : null} */}
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
              max={max}
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

export default StockOutEditPage;
