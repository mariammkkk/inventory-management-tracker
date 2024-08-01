//summary: initialize Firebase & begin using the SDKs for the products

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsUDp7U1NWa3Ax2Xuzqrj2JTH3hVMH3B0",
  authDomain: "pantry-tracker-abc08.firebaseapp.com",
  projectId: "pantry-tracker-abc08",
  storageBucket: "pantry-tracker-abc08.appspot.com",
  messagingSenderId: "662251235277",
  appId: "1:662251235277:web:385226ff9856a471438684",
  measurementId: "G-96TKMYFM6C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };