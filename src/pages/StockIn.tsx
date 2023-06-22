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
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
} from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import { Timestamp, deleteDoc, where } from "firebase/firestore";
import {
  exeTransaction,
  getDocById,
  getDocsByQuery,
  getRef,
  removeDoc,
} from "../operations";
import { CurrentStock, StockIn } from "../schema";
import { useMyStore } from "../store/store";
import dayjs from "../util/dayjs";
import _ from "lodash";

const StockInListPage = () => {
  const history = useHistory();
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [presentAlert] = useIonAlert();
  let location = useLocation();

  const [activeInventory] = useMyStore((s) => s.userStore.activeInventory);

  const fetchStockIns = async () => {
    try {
      if (activeInventory) {
        const fetchedStockIns = await getDocsByQuery<StockIn>(
          "stockIns",
          where(
            "inventoryRef",
            "==",
            getRef("inventories", activeInventory?.id)
          )
        );
        setStockIns(fetchedStockIns);
      }
    } catch (error) {
      console.error("Error fetching stockIns:", error);
    }
  };

  useEffect(() => {
    fetchStockIns();
  }, [activeInventory, location]);

  const handleCreate = () => {
    history.push("/stockIns/create");
  };

  const handleDelete = async (stockInId: string, stockInDoc: StockIn) => {
    const stockRef = getRef(
      "currentStocks",
      `${stockInDoc.productRef.id}-${stockInDoc.price}`
    );
    const stockInRef = getRef("stockIns", stockInId);

    exeTransaction(async (transaction) => {
      const currentStock = await transaction.get(stockRef);
      if (!currentStock.exists()) {
        throw "No stock Record";
      } else {
        const stockQuantity = currentStock.data()?.quantity;
        if (stockQuantity >= stockInDoc.quantity) {
          const quantity = stockQuantity - stockInDoc.quantity;
          transaction.update(stockRef, { quantity });
          transaction.delete(stockInRef);
        } else {
          throw "Can Not Remove as quantity already out";
        }
      }
    });
    fetchStockIns();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>StockIn</IonTitle>
          <IonButton slot="end" onClick={handleCreate}>
            Create
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Total Purchased</IonCardTitle>
            <IonCardSubtitle>
              <IonItem color="light">
                <IonLabel>
                  {_.reduce(
                    stockIns,
                    (state, stockOut) =>
                      state + stockOut.quantity * stockOut.price,
                    0
                  )}
                </IonLabel>
              </IonItem>
            </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>Date Filter</IonCardContent>
        </IonCard>
        <IonAccordionGroup>
          {stockIns.map((stockIn) => (
            <IonAccordion key={stockIn.id} value={stockIn.id}>
              <IonItem slot="header" detail={false} button={true} color="light">
                <IonLabel>
                  <h3> {stockIn.product?.name}</h3>
                  <p className="text-xs	">
                    <IonLabel slot="start">
                      {dayjs((stockIn.date as Timestamp).toDate()).format(
                        "DD/MM/YYYY"
                      )}
                    </IonLabel>
                    <IonLabel slot="end">
                      Purchased: {stockIn.price * stockIn.quantity}{" "}
                    </IonLabel>
                  </p>
                </IonLabel>
              </IonItem>
              <div className="ion-padding" slot="content">
                <IonItem>
                  <IonLabel>
                    <h3>Price</h3>
                    <p>{stockIn.price}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Quantity</h3>
                    <p>{stockIn.quantity}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>supplier</h3>
                    <p>{stockIn.supplier?.name}</p>
                  </IonLabel>
                </IonItem>
                {stockIn.id === stockIn?.currentStock?.editableRef?.id ? (
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
                                handleDelete(stockIn.id, stockIn);
                              },
                            },
                          ],
                        });
                      }}
                    >
                      Delete
                    </IonButton>
                  </IonItem>
                ) : undefined}
              </div>
            </IonAccordion>
          ))}
        </IonAccordionGroup>
      </IonContent>
    </IonPage>
  );
};

export default StockInListPage;
