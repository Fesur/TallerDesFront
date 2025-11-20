// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCbWnZcF0POs6GbLfHkUxLJn45gagUV_cM",
  authDomain: "sisiii.firebaseapp.com",
  projectId: "sisiii",
  storageBucket: "sisiii.firebasestorage.app",
  messagingSenderId: "1069858724869",
  appId: "1:1069858724869:web:e89353689ad10ea88b106c",
  measurementId: "G-S4PCERSHGS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);