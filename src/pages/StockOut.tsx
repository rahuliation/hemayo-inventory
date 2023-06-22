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
} from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import { Timestamp, deleteDoc, where } from "firebase/firestore";
import { exeTransaction, getDocsByQuery, getRef, removeDoc } from "../operations";
import { StockOut } from "../schema";
import { useMyStore } from "../store/store";
import dayjs from "../util/dayjs";

const StockOutListPage = () => {
  const history = useHistory();
  const [stockOuts, setStockOuts] = useState<StockOut[]>([]);
  const [presentAlert] = useIonAlert();
  let location = useLocation();

  const [activeInventory] = useMyStore((s) => s.userStore.activeInventory);

  const fetchStockOuts = async () => {
    try {
      if (activeInventory) {
        const fetchedStockOuts = await getDocsByQuery<StockOut>(
          "stockOuts",
          where(
            "inventoryRef",
            "==",
            getRef("inventories", activeInventory?.id)
          )
        );
        setStockOuts(fetchedStockOuts);
      }
    } catch (error) {
      console.error("Error fetching stockOuts:", error);
    }
  };

  useEffect(() => {
    fetchStockOuts();
  }, [activeInventory, location]);

  const handleCreate = () => {
    history.push("/stockOuts/create");
  };


  const handleDelete = async (stockOutId: string, stockOut: StockOut) => {
    const stockRef = getRef('currentStocks', stockOut.currentStockRef.id);
    const stockOutRef = getRef('stockOuts', stockOutId);

    exeTransaction(async (transaction ) => {
      const currentStock = await transaction.get(stockRef);
      if (!currentStock.exists()) {
        throw "No stock Record";
      } else {
        const quantity = currentStock.data()?.quantity - stockOut.quantity;
        transaction.update(stockRef, { quantity });
        transaction.delete(stockOutRef)
      }
    })
    fetchStockOuts();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>StockOut</IonTitle>
          <IonButton slot="end" onClick={handleCreate}>
            Create
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonAccordionGroup>
          {stockOuts.map((stockOut) => (
            <IonAccordion  key={stockOut.id}  value={stockOut.id}>
              <IonItem slot="header" color="light">
                <IonLabel>{stockOut.product?.name}</IonLabel>
                <IonLabel>
                  {dayjs((stockOut.date as Timestamp).toDate()).format(
                    "DD/MM/YYYY"
                  )}
                </IonLabel>
              </IonItem>
              <div className="ion-padding" slot="content">
                <IonItem>
                  <IonLabel>
                    <h3>Price</h3>
                    <p>{stockOut.price}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Quantity</h3>
                    <p>{stockOut.quantity}</p>
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
                              handleDelete(stockOut.id, stockOut);
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

export default StockOutListPage;
