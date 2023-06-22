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
  IonTitle,
} from "@ionic/react";

import { useHistory, useLocation, useParams } from "react-router";
import { useMyStore } from "../store/store";
import { createDoc, getDocById, getRef, updateDoc } from "../operations";
import { Category, Expense, expenseType } from "../schema";
import { z } from "zod";
import { useFormik } from "formik";
import { Timestamp, where } from "firebase/firestore";
import { Optional } from "utility-types";
import _ from "lodash";
import DateSelect from "../components/DateSelect";

const ExpenseEditPage = () => {
  const history = useHistory();
  const location = useLocation();

  const { expenseId: expenseIdParam } = useParams<{ expenseId: string }>();
  const expenseId = expenseIdParam === "create" ? null : expenseIdParam;

  const [activeInventory] = useMyStore((s) => s.userStore.activeInventory);
  const initExpense = {
    date: new Date().toISOString(),
    category: "discount",
    amount: 1,
  };
  const [expense, setExpense] = useState<Optional<Expense, "id">>(initExpense);

  const fetchExpense = async () => {
    try {
      if (expenseId) {
        const expense = await getDocById<Expense>("expenses", expenseId);
        if (expense) {
          setExpense(expense);
        }
      }
    } catch (error) {
      console.error("Error fetching expense:", error);
    }
  };

  const onSubmit = async (values: Optional<Expense, "id" | "inventoryRef">) => {

    try {
      if (activeInventory) {
        // Create or update the expense with the selected category
        if (expenseId) {
          await updateDoc<Expense>("expenses", expenseId, {
            ...values,
            date: Timestamp.fromDate(new Date(values.date)),
            inventoryRef: getRef("inventories", activeInventory.id),
          });
        } else {
          await createDoc<Expense>("expenses", {
            ...values,
            date: Timestamp.fromDate(new Date(values.date)),
            inventoryRef: getRef("inventories", activeInventory.id),
          });
        }
      }

      console.log("Expense saved successfully.");
      history.push("/expenses");
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const formik = useFormik({
    initialValues: {
      ...expense,
    },
    onSubmit,
    enableReinitialize: true,
  });

  useEffect(() => {
    if (expenseId) {
      fetchExpense();
    } else {
      setExpense(initExpense);
    }
  }, [expenseId, activeInventory, location]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/expenses" />
          </IonButtons>
          <IonTitle> Expense Entry</IonTitle>
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

          <IonItem>
            <IonInput
              label="Amount"
              type="number"
              id="amount"
              name="amount"
              value={formik.values.amount}
              onIonChange={formik.handleChange}
              onIonBlur={formik.handleBlur}
            ></IonInput>
          </IonItem>

          {formik.touched.amount && formik.errors.amount ? (
            <div>{formik.errors.amount}</div>
          ) : null}

          <IonItem>
            <IonSelect
              label="Category"
              id="category"
              name="category"
              placeholder="Select"
              value={formik.values.category}
              onIonChange={formik.handleChange}
              onIonBlur={formik.handleBlur}
            >
              {_.map(expenseType, (expense, key) => (
                <IonSelectOption key={key} value={key}>
                  {expense}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          {formik.touched.category && formik.errors.category ? (
            <div>{formik.errors.category as string}</div>
          ) : null}

          <IonButton expand="block" type="submit">
            Save Expense
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default ExpenseEditPage;
