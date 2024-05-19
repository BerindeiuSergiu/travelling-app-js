// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAuvNjnj3_2rF1hyl8ydYL1OvPxDyiV9Hw",
    authDomain: "travelling-app-564b5.firebaseapp.com",
    projectId: "travelling-app-564b5",
    storageBucket: "travelling-app-564b5.appspot.com",
    messagingSenderId: "79416894228",
    appId: "1:79416894228:web:743b9d0456ff1c7a559801",
    measurementId: "G-FVHWKJMC2W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);