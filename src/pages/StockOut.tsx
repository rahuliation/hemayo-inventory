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
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCard,
  IonDatetimeButton,
  IonModal,
  IonDatetime,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import { Timestamp, deleteDoc, where } from "firebase/firestore";
import {
  exeTransaction,
  getDocsByQuery,
  getRef,
  removeDoc,
} from "../operations";
import { StockOut } from "../schema";
import { useMyStore } from "../store/store";
import dayjs from "../util/dayjs";
import _ from "lodash";

const StockOutListPage = () => {
  const history = useHistory();
  const [stockOuts, setStockOuts] = useState<StockOut[]>([]);
  const [presentAlert] = useIonAlert();
  let location = useLocation();

  const [activeInventory] = useMyStore((s) => s.userStore.activeInventory);

  const [startDate, setStartDate] = useState(dayjs().startOf("month"));
  const [endDate, setEndDate] = useState(dayjs().endOf("month"));

  const fetchStockOuts = async () => {
    const startDateTimestamp = Timestamp.fromDate(startDate.toDate());
    const endDateTimestamp = Timestamp.fromDate(endDate.toDate());
    try {
      if (activeInventory) {
        const fetchedStockOuts = await getDocsByQuery<StockOut>(
          "stockOuts",
          where(
            "inventoryRef",
            "==",
            getRef("inventories", activeInventory?.id)
          ),
          where("date", ">=", startDateTimestamp),
          where("date", "<=", endDateTimestamp)
        );
        setStockOuts(fetchedStockOuts);
      }
    } catch (error) {
      console.error("Error fetching stockOuts:", error);
    }
  };

  useEffect(() => {
    fetchStockOuts();
  }, [activeInventory, location, startDate, endDate]);

  const handleCreate = () => {
    history.push("/stockOuts/create");
  };

  const handleDelete = async (stockOutId: string, stockOut: StockOut) => {
    const stockRef = getRef("currentStocks", stockOut.currentStockRef.id);
    const stockOutRef = getRef("stockOuts", stockOutId);

    exeTransaction(async (transaction) => {
      const currentStock = await transaction.get(stockRef);
      if (!currentStock.exists()) {
        throw "No stock Record";
      } else {
        const quantity = currentStock.data()?.quantity - stockOut.quantity;
        transaction.update(stockRef, { quantity });
        transaction.delete(stockOutRef);
      }
    });
    fetchStockOuts();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Stock Out</IonTitle>
          <IonButton slot="end" onClick={handleCreate}>
            Create
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonItem>
              <IonLabel slot="start">Total Sold</IonLabel>
              <IonLabel slot="end">Total Price</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel slot="start">
                {_.reduce(
                  stockOuts,
                  (state, stockOut) =>
                    state + stockOut.quantity * stockOut.price,
                  0
                )}
              </IonLabel>
              <IonLabel slot="end">
                {_.reduce(
                  stockOuts,
                  (state, stockOut) =>
                    state + stockOut.quantity * stockOut.buyingPrice,
                  0
                )}
              </IonLabel>
            </IonItem>
          </IonCardHeader>

          <IonCardContent>
            <IonItem>
              <IonDatetimeButton slot="start" datetime="startDate" />
              <IonDatetimeButton slot="end" datetime="endDate" />
            </IonItem>
            <IonModal keepContentsMounted={true}>
              <IonDatetime
                value={startDate.format("YYYY-MM-DDTHH:mm")}
                onIonChange={(e) => {
                  setStartDate(dayjs(new Date(e.target.value as string)));
                }}
                presentation="date"
                id="startDate"
              />
            </IonModal>
            <IonModal keepContentsMounted={true}>
              <IonDatetime
                value={endDate.format("YYYY-MM-DDTHH:mm")}
                onIonChange={(e) => {
                  setEndDate(dayjs(new Date(e.target.value as string)));
                }}
                presentation="date"
                id="endDate"
              />
            </IonModal>
          </IonCardContent>
        </IonCard>

        <IonAccordionGroup>
          {stockOuts.map((stockOut) => (
            <IonAccordion key={stockOut.id} value={stockOut.id}>
              <IonItem slot="header" color="light">
                <IonLabel>
                  <h3> {stockOut.product?.name}</h3>
                  <p className="text-xs	">
                    <IonLabel slot="start">
                      {dayjs((stockOut.date as Timestamp).toDate()).format(
                        "DD/MM/YYYY"
                      )}
                    </IonLabel>
                    <IonLabel slot="end">
                      Purchased: {stockOut.price * stockOut.quantity}{" "}
                    </IonLabel>
                  </p>
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
                {stockOut.id === stockOut?.currentStock?.editableRef?.id ? (
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
                ) : undefined}
              </div>
            </IonAccordion>
          ))}
        </IonAccordionGroup>
      </IonContent>
    </IonPage>
  );
};

export default StockOutListPage;
