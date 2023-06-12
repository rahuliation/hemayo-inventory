import React from "react";
import { IonList, IonItem, IonLabel, IonIcon, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { useHistory } from "react-router-dom";

const Settings: React.FC = () => {
  const history = useHistory();

  // Function to navigate to the specified route
  const navigateTo = (route: string) => {
    history.push(route);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 3</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          <IonItem button onClick={() => navigateTo("/products")}>
            <IonIcon slot="start" name="cube" />
            <IonLabel>Product</IonLabel>
          </IonItem>
          <IonItem button onClick={() => navigateTo("/categories")}>
            <IonIcon slot="start" name="list" />
            <IonLabel>Category</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
