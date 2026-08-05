// firebase-init.js
// Firebase V9 Compat Configuration

const firebaseConfig = {
  apiKey: "AIzaSyBDwd_eWbUAOf34ttXik5sw909ZEgrCD6o",
  authDomain: "farah-store-6bf78.firebaseapp.com",
  projectId: "farah-store-6bf78",
  storageBucket: "farah-store-6bf78.firebasestorage.app",
  messagingSenderId: "721985469015",
  appId: "1:721985469015:web:83c6b463fc230e4f458112",
  measurementId: "G-7FC38DKGCY"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

window.db = db; // Make available globally
