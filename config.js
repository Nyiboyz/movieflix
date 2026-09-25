// Paste your unique Firebase config here
const firebaseConfig = {
   apiKey: "AIzaSyA3el9LwR5CH2NJxwhYfuHbX0WqGuNmBdo",
  authDomain: "movieflix-2b245.firebaseapp.com",
  databaseURL: "https://movieflix-2b245-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "movieflix-2b245",
  storageBucket: "movieflix-2b245.firebasestorage.app",
  messagingSenderId: "340751379577",
  appId: "1:340751379577:web:5fe945cd8f123a21bcb8a8",
  measurementId: "G-B0ZJTX3HPE"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const CONFIG = {
    BOT_USERNAME: 'MovieFlix_Delivery_Bot' // e.g., MovieFlix_Delivery_Bot
};
