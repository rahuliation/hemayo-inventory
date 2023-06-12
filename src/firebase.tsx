
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBac4CwVk6lZLEbpBV4nprpwUjwZHBThLw",
  authDomain: "hemayo-inventory.firebaseapp.com",
  projectId: "hemayo-inventory",
  storageBucket: "hemayo-inventory.appspot.com",
  messagingSenderId: "833300826399",
  appId: "1:833300826399:web:187f937ad1338dcbec082a",
  measurementId: "G-TNFM07WQ5Q"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);