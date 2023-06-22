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
} from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import { getFirestore, collection, getDocs, where } from "firebase/firestore";
import { getDocsByQuery, getRef, removeDoc } from "../operations";
import { Product } from "../schema";
import { useMyStore } from "../store/store";

const ProductListPage = () => {
  const history = useHistory();
  const [products, setProducts] = useState<Product[]>([]);
  const [presentAlert] = useIonAlert();
  const location = useLocation();

  const [activeInventory] = useMyStore((s) => s.userStore.activeInventory);

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
        setProducts(fetchProduct);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    if (activeInventory?.id) {
      fetchProducts();
    }
    fetchProducts();
  }, [activeInventory, location]);

  const handleCreate = () => {
    history.push("/products/create");
  };

  const handleEdit = (productId: string) => {
    history.push(`/products/${productId}`);
  };

  const handleDelete = (productId: string) => {
    removeDoc("products", productId);
    fetchProducts();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Product</IonTitle>
          <IonButton slot="end" onClick={handleCreate}>
            Create
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonAccordionGroup>
          {products.map((product) => (
            <IonAccordion key={product.id} value={product.id}>
              <IonItem slot="header" color="light">
                <IonLabel>{product.name}</IonLabel>
              </IonItem>
              <div className="ion-padding" slot="content">
                <IonItem>
                  <IonLabel>
                    <h3>Default Buying Price</h3>
                    <p>{product.defaultBuyingPrice}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Default Selling Price</h3>
                    <p>{product.defaultSellingPrice}</p>
                  </IonLabel>
                </IonItem>

                <IonItem>
                  <IonLabel>
                    <h3>Default category</h3>
                    <p>{product.category?.name as any}</p>
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
                              handleDelete(product.id);
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
                      handleEdit(product.id);
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

export default ProductListPage;
