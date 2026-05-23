import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
 getAuth
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
 getFirestore
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDfhRzAT7Fb0kiK58UWopQhsq7evI7I6A8",
  authDomain: "vinz-app-bdc30.firebaseapp.com",
  projectId: "vinz-app-bdc30",
  storageBucket: "vinz-app-bdc30.firebasestorage.app",
  messagingSenderId: "857468378879",
  appId: "1:857468378879:web:bcbae846e8a032fd25f6ca",
  measurementId: "G-5ETBGPC4ED"
};

const app =
initializeApp(firebaseConfig);

export const auth =
getAuth(app);

export const db =
getFirestore(app);