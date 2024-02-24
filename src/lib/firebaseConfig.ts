// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCmxgTMcSPlGHevLQik-LDtZjUmLNbdlxw",
  authDomain: "convo-ea70a.firebaseapp.com",
  databaseURL: "https://convo-ea70a-default-rtdb.firebaseio.com",
  projectId: "convo-ea70a",
  storageBucket: "convo-ea70a.appspot.com",
  messagingSenderId: "651687475411",
  appId: "1:651687475411:web:1b5f42b81b99138abf7c26",
  measurementId: "G-TMVN7WM5JX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default database