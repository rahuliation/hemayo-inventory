import React, { useState } from "react";
import {
  IonContent,
  IonInput,
  IonPage,
  IonButton,
  IonItem,
  IonLabel,
  IonRouterLink,
} from "@ionic/react";
import { auth } from "../firebase"; // Import your Firebase configuration
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useHistory } from "react-router";
import { addDoc } from "firebase/firestore"; 
import { v4 as uuidv4 } from 'uuid';
import { createDoc } from "../operations";
import { Inventory } from "../schema";



const RegistrationPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [storeName, setStoreName] = useState('');

  const history = useHistory();

  const handleRegistration = async () => {
    try {
      if (password !== confirmPassword) {
        console.error("Passwords don't match");
        return;
      }
      const user = await createUserWithEmailAndPassword(auth, email, password);

      const docRef = await createDoc<Inventory>("inventories", {
        userId: user.user.uid,
        storeName,
      });

      history.push("/");

      // Handle successful registration, such as redirecting to another page
    } catch (error: any) {
      console.log(error);
      // Handle error, such as displaying an error message to the user
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div style={{ margin: "2rem", padding: "2rem" }}>
          <IonItem>
            <IonLabel position="floating">Store Name</IonLabel>
            <IonInput
              type="text"
              value={storeName}
              onIonChange={(e) => setStoreName(e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Email</IonLabel>
            <IonInput
              type="email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Password</IonLabel>
            <IonInput
              type="password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Confirm Password</IonLabel>
            <IonInput
              type="password"
              value={confirmPassword}
              onIonChange={(e) => setConfirmPassword(e.detail.value!)}
            />
          </IonItem>
          <IonButton expand="full" onClick={handleRegistration}>
            Register
          </IonButton>
          <IonRouterLink className="my-2" routerLink="/login">login</IonRouterLink>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default RegistrationPage;
