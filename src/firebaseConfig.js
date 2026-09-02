// 1. Go to https://console.firebase.google.com, create a free project
//    (the free "Spark" plan is enough for this app).
// 2. In the project, click the </> (web app) icon to register a web app —
//    you don't need Hosting, just the config object it gives you.
// 3. Paste that config object below, replacing the placeholder values.
// 4. In the Firebase console, go to Build > Firestore Database > Create
//    database, start in "production mode", pick any region.
// 5. Go to Firestore > Rules and paste the rules from firestore.rules in
//    this folder, then click Publish.
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";

import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5uqFuliAnOnTmKVkp3ElTOZkVOqpv4CM",
  authDomain: "wa-14-calendar.firebaseapp.com",
  projectId: "wa-14-calendar",
  storageBucket: "wa-14-calendar.firebasestorage.app",
  messagingSenderId: "539952547508",
  appId: "1:539952547508:web:7494354ee6c653868d79e1",
  measurementId: "G-12R5F39M93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Ensure 'export const db' is present:
export const db = getFirestore(app);
