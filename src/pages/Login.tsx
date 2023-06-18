import React, { useState } from "react";
import {
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonLabel,
  IonRouterLink,
} from "@ionic/react";
import { auth } from "../firebase"; // Import your Firebase configuration
import { signInWithEmailAndPassword } from "firebase/auth";
import { useHistory } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory();

  const handleLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      history.push("/dashboard");
      // Handle successful login, such as redirecting to another page
    } catch (error: any) {
      console.log(error.message);
      // Handle error, such as displaying an error message to the user
    }
  };

  return (
    <IonPage>
    <IonContent>
      <div style={{ margin: '2rem', padding: '2rem' }}>
        <IonItem>
          <IonLabel position="floating">Email</IonLabel>
          <IonInput type="email" value={email} onIonChange={(e) => setEmail(e.detail.value!)} />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Password</IonLabel>
          <IonInput type="password" value={password} onIonChange={(e) => setPassword(e.detail.value!)} />
        </IonItem>
        <IonButton expand="full" onClick={handleLogin}>
          Login
        </IonButton>
        <IonRouterLink className="my-2" routerLink="/register">Create an account</IonRouterLink>
      </div>
    </IonContent>
  </IonPage>
  );
};

export default LoginPage;
