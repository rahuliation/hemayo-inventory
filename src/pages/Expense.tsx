import React, { useEffect, useState } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonPage,
  IonItem,
  IonLabel,
  IonAccordionGroup,
  IonAccordion,
  useIonAlert,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import { where } from "firebase/firestore";
import { getDocsByQuery, getRef, removeDoc } from "../operations";
import { Expense, expenseType } from "../schema";
import { useMyStore } from "../store/store";
import _ from "lodash";

const ExpenseListPage = () => {
  const history = useHistory();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [presentAlert] = useIonAlert();
  const location = useLocation();

  const [activeInventory] = useMyStore((s) => s.userStore.activeInventory);

  const fetchExpenses = async () => {
    try {
      if (activeInventory) {
        const fetchExpense = await getDocsByQuery<Expense>(
          "expenses",
          where(
            "inventoryRef",
            "==",
            getRef("inventories", activeInventory?.id)
          )
        );
        setExpenses(fetchExpense);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    if (activeInventory?.id) {
      fetchExpenses();
    }
    fetchExpenses();
  }, [activeInventory, location]);

  const handleCreate = () => {
    history.push("/expenses/create");
  };

  const handleEdit = (expenseId: string) => {
    history.push(`/expenses/${expenseId}`);
  };

  const handleDelete = (expenseId: string) => {
    removeDoc("expenses", expenseId);
    fetchExpenses();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Expense</IonTitle>
          <IonButton slot="end" onClick={handleCreate}>
            Create
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Total Sold</IonCardTitle>
            <IonCardSubtitle>
              <IonItem color="light">
                <IonLabel>
                  {_.reduce(
                    expenses,
                    (state, stockOut) =>
                      state + stockOut.amount,
                    0
                  )}
                </IonLabel>
              </IonItem>
            </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>Date Filter</IonCardContent>
        </IonCard>
        <IonAccordionGroup>
          {expenses.map((expense) => (
            <IonAccordion key={expense.id} value={expense.id}>
              <IonItem slot="header" color="light">
                <IonLabel>{_.get(expenseType, expense.category, "")}</IonLabel>

                <IonLabel>{expense.amount}</IonLabel>
              </IonItem>
              <div className="ion-padding" slot="content">
                <IonItem
                  slot="end"
                  color="light"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IonButton
                    onClick={(e) => {
                      e.stopPropagation();
                      presentAlert({
                        header: "Confirm Delete?",
                        buttons: [
                          {
                            text: "Cancel",
                            role: "cancel",
                            handler: () => {},
                          },
                          {
                            text: "OK",
                            role: "confirm",
                            handler: () => {
                              handleDelete(expense.id);
                            },
                          },
                        ],
                      });
                    }}
                  >
                    Delete
                  </IonButton>
                  <IonButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(expense.id);
                    }}
                  >
                    Edit
                  </IonButton>
                </IonItem>
              </div>
            </IonAccordion>
          ))}
        </IonAccordionGroup>
      </IonContent>
    </IonPage>
  );
};

export default ExpenseListPage;
