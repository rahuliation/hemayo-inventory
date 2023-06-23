import React, { useEffect, useState } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonPage,
  IonItem,
  useIonAlert,
  IonAccordion,
  IonAccordionGroup,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import { where } from "firebase/firestore";
import {
  exeTransaction,
  getDocsByQuery,
  getRef
} from "../operations";
import { CurrentStock } from "../schema";
import { useMyStore } from "../store/store";
import _ from "lodash";

const Dashboard = () => {
  const history = useHistory();
  const [currentStocks, setCurrentStocks] = useState<CurrentStock[]>([]);
  const [presentAlert] = useIonAlert();
  let location = useLocation();

  const [activeInventory] = useMyStore((s) => s.userStore.activeInventory);

  const fetchCurrentStocks = async () => {

    try {
      if (activeInventory) {
        const fetchedCurrentStocks = await getDocsByQuery<CurrentStock>(
          "currentStocks",
          where(
            "inventoryRef",
            "==",
            getRef("inventories", activeInventory?.id)
          )
        );
        setCurrentStocks(fetchedCurrentStocks);
      }
    } catch (error) {
      console.error("Error fetching currentStocks:", error);
    }
  };

  useEffect(() => {
    fetchCurrentStocks();
  }, [activeInventory, location]);

  const handleCreate = () => {
    history.push("/currentStocks/create");
  };

  const handleDelete = async (
    currentStockId: string,
    currentStockDoc: CurrentStock
  ) => {
    const stockRef = getRef(
      "currentStocks",
      `${currentStockDoc.productRef.id}-${currentStockDoc.price}`
    );
    const currentStockRef = getRef("currentStocks", currentStockId);

    exeTransaction(async (transaction) => {
      const currentStock = await transaction.get(stockRef);
      if (!currentStock.exists()) {
        throw "No stock Record";
      } else {
        const stockQuantity = currentStock.data()?.quantity;
        if (stockQuantity >= currentStockDoc.quantity) {
          const quantity = stockQuantity - currentStockDoc.quantity;
          transaction.update(stockRef, { quantity });
          transaction.delete(currentStockRef);
        } else {
          throw "Can Not Remove as quantity already out";
        }
      }
    });
    fetchCurrentStocks();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Current Stock</IonTitle>
          {/* <IonButton slot="end" onClick={handleCreate}>
            Create
          </IonButton> */}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
      <IonCard>
          <IonCardHeader>
            <IonCardTitle>Total Stock Amount</IonCardTitle>
            <IonCardSubtitle>
              <IonItem color="light">
                <IonLabel>
                  {_.reduce(
                    currentStocks,
                    (state, stockOut) =>
                      state + stockOut.quantity * stockOut.price,
                    0
                  )}
                </IonLabel>
              </IonItem>
            </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
          </IonCardContent>
        </IonCard>
        <IonItem>
          <IonLabel slot="end">
            <p>Total {_.size(currentStocks)} entries</p>
          </IonLabel>
        </IonItem>
        <IonAccordionGroup>
          {currentStocks.map((currentStock) => (
            <IonAccordion key={currentStock.id} value={currentStock.id}>
              <IonItem slot="header" button={true} color="light">
                <IonLabel slot="start">
                  {currentStock.product?.name} - {currentStock.price}
                </IonLabel>
                <IonLabel slot="end">Stock: {currentStock.quantity}</IonLabel>
              </IonItem>
              <div className="ion-padding" slot="content">
                <IonItem>
                  <IonLabel>
                    <h3>Price</h3>
                    <p>{currentStock.price}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Quantity</h3>
                    <p>{currentStock.quantity}</p>
                  </IonLabel>
                </IonItem>
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
                              handleDelete(currentStock.id, currentStock);
                            },
                          },
                        ],
                      });
                    }}
                  >
                    Delete
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

export default Dashboard;
