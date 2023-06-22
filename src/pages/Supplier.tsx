import React, { useEffect, useState } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonAlert,
  useIonAlert,
  IonAccordion,
  IonAccordionGroup,
} from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import { deleteDoc, where } from "firebase/firestore";
import { getDocsByQuery, getRef, removeDoc } from "../operations";
import { Supplier } from "../schema";
import { useMyStore } from "../store/store";

const SupplierListPage = () => {
  const history = useHistory();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [presentAlert] = useIonAlert();
  let location = useLocation();

  const [activeInventory] = useMyStore((s) => s.userStore.activeInventory);

  const fetchSuppliers = async () => {
    try {
      if (activeInventory) {
        const fetchedSuppliers = await getDocsByQuery<Supplier>(
          "suppliers",
          where(
            "inventoryRef",
            "==",
            getRef("inventories", activeInventory?.id)
          )
        );
        setSuppliers(fetchedSuppliers);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [activeInventory, location]);

  const handleCreate = () => {
    history.push("/suppliers/create");
  };

  const handleEdit = (supplierId: string) => {
    history.push(`/suppliers/${supplierId}`);
  };

  const handleDelete = (supplierId: string) => {
    removeDoc("suppliers", supplierId);
    fetchSuppliers();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Supplier</IonTitle>
          <IonButton slot="end" onClick={handleCreate}>
            Create
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonAccordionGroup>
          {suppliers.map((supplier) => (
            <IonAccordion value={supplier.id}>
              <IonItem slot="header" color="light">
                <IonLabel>{supplier.name}</IonLabel>
                <div slot="end" />
              </IonItem>
              <div className="ion-padding" slot="content">
                <IonItem>
                  <IonLabel>
                    <h3>PhoneNumber</h3>
                    <p>{supplier.phoneNumber}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Address</h3>
                    <p>{supplier.address}</p>
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
                              handleDelete(supplier.id);
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
                      handleEdit(supplier.id);
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

export default SupplierListPage;
