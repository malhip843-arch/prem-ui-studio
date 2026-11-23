
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZ6PKZRgxc0etf6Xw6MxIIvhWX8B0mtmi0",
  authDomain: "prem-ui-studio.firebaseapp.com",
  projectId: "prem-ui-studio",
  storageBucket: "prem-ui-studio.firebasestorage.app",
  messagingSenderId: "112416764047",
  appId: "1:112416764047:web:5d4d02e56bc50cc8dc40fa",
  measurementId: "G-JYH6L10PJQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence);

export { app, auth };
