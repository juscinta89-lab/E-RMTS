/* =========================================================
   KONFIGURASI FIREBASE
   ---------------------------------------------------------
   1. Pergi ke https://console.firebase.google.com
   2. Buat projek baru (cth: rmt-sk-belukar)
   3. Add app > Web (</>) > salin nilai firebaseConfig di bawah
   4. Aktifkan: Authentication (Email/Password) + Firestore Database
   ========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyDBftDntxCYeeAUmCsfEsVbn1YxRRjHKbg",
  authDomain: "rmt-sk-belukar.firebaseapp.com",
  projectId: "rmt-sk-belukar",
  storageBucket: "rmt-sk-belukar.firebasestorage.app",
  messagingSenderId: "659453051327",
  appId: "1:659453051327:web:1bcf73b28cc58f0ff8210a",
  measurementId: "G-VRHJH7X958"
};


/* Jangan ubah di bawah ini */
window.__FIREBASE_CONFIG__ = firebaseConfig;
window.__FIREBASE_READY__  = !firebaseConfig.apiKey.startsWith("GANTIKAN");
