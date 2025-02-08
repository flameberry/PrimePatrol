// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9BurXANJgCS5oQ9-aJj1KdOXG5xIsrJk",
  authDomain: "smartwater-949ac.firebaseapp.com",
  projectId: "smartwater-949ac",
  storageBucket: "smartwater-949ac.appspot.com",
  messagingSenderId: "115880284665",
  appId: "1:115880284665:web:ce4a57776eedd8af2eed28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, auth, provider };