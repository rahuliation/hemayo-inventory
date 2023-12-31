import React from "react";
import {
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import {
  cashOutline,
  cubeOutline,
  logIn,
  logOut,
  logOutOutline,
  personOutline,
  pricetagOutline,
} from "ionicons/icons";

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
            <IonTitle size="large">Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          <IonItem button detail={true} onClick={() => navigateTo("/expenses")}>
            <IonIcon aria-hidden="true" icon={cashOutline} />
            <IonLabel className="px-3">Expense</IonLabel>
          </IonItem>
          <IonItem button detail={true} onClick={() => navigateTo("/products")}>
            <IonIcon aria-hidden="true" icon={cubeOutline} />
            <IonLabel className="px-3">Product</IonLabel>
          </IonItem>
          <IonItem button detail={true} onClick={() => navigateTo("/categories")}>
            <IonIcon aria-hidden="true" icon={pricetagOutline} />
            <IonLabel className="px-3">Category</IonLabel>
          </IonItem>
          <IonItem button detail={true} onClick={() => navigateTo("/suppliers")}>
            <IonIcon aria-hidden="true" icon={personOutline} />
            <IonLabel className="px-3">Supplier</IonLabel>
          </IonItem>
          <IonItem button onClick={() => signOut(auth)}>
            <IonIcon aria-hidden="true" icon={logOutOutline} />
            <IonLabel className="px-3">Log out</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
