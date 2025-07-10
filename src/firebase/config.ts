import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: "brayan-tellez-web.firebaseapp.com",
    projectId: "brayan-tellez-web",
    storageBucket: "brayan-tellez-web.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_ID,
    appId: process.env.FIREBASE_API_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

export default app;