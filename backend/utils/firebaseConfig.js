import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

export const firebaseConfig = {
    apiKey: "AIzaSyA5CZglsYN8eUUYX4Bws7eZvIBje87W7p4",
    authDomain: "cinecritique-b94c6.firebaseapp.com",
    projectId: "cinecritique-b94c6",
    storageBucket: "cinecritique-b94c6.appspot.com",
    messagingSenderId: "311328031875",
    appId: "1:311328031875:web:ababed55d8b6d2278587b6",
    measurementId: "G-NZ58EN25TH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);