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
  useIonAlert,
  IonAccordion,
  IonAccordionGroup,
} from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import { deleteDoc, where } from "firebase/firestore";
import { getDocsByQuery, getRef, removeDoc } from "../operations";
import { Category } from "../schema";
import { useMyStore } from "../store/store";

const CategoryListPage = () => {
  const history = useHistory();
  const [categories, setCategories] = useState<Category[]>([]);
  const [presentAlert] = useIonAlert();
  let location = useLocation();

  const [activeInventory] = useMyStore((s) => s.userStore.activeInventory);

  const fetchCategories = async () => {
    try {
      if (activeInventory) {
        const inventoryRef = getRef("inventories", activeInventory.id);
        const fetchedCategories = await getDocsByQuery<Category>(
          "categories",
          where("inventoryRef", "==", inventoryRef )
        );
        setCategories(fetchedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
      fetchCategories();
  }, [activeInventory, location]);

  const handleCreate = () => {
    history.push("/categories/create");
  };

  const handleEdit = (categoryId: string) => {
    history.push(`/categories/${categoryId}`);
  };

  const handleDelete = (categoryId: string) => {
    removeDoc("categories", categoryId);
    fetchCategories();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Category</IonTitle>
          <IonButton slot="end" onClick={handleCreate}>
            Create
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonAccordionGroup>
          {categories.map((category) => (
            <IonAccordion key={category.id} value={category.id}>
              <IonItem slot="header" color="light">
                <IonLabel>{category.name}</IonLabel>
                <div slot="end" />
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
                              handleDelete(category.id);
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
                      handleEdit(category.id);
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

export default CategoryListPage;
