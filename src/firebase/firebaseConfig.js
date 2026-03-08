// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTHDOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGE_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);