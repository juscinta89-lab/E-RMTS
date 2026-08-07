/* =========================================================
   KONFIGURASI FIREBASE
   ---------------------------------------------------------
   1. Pergi ke https://console.firebase.google.com
   2. Buat projek baru (cth: rmt-sk-belukar)
   3. Add app > Web (</>) > salin nilai firebaseConfig di bawah
   4. Aktifkan: Authentication (Email/Password) + Firestore Database
   ========================================================= */

/* Nama sekolah untuk pemasangan tunggal ini */
window.__SCHOOL_NAME__  = "SEKOLAH KEBANGSAAN BELUKAR";
window.__SCHOOL_SHORT__ = "SK Belukar";

const firebaseConfig = {
  apiKey:            "GANTIKAN_API_KEY",
  authDomain:        "GANTIKAN.firebaseapp.com",
  projectId:         "GANTIKAN_PROJECT_ID",
  storageBucket:     "GANTIKAN.appspot.com",
  messagingSenderId: "GANTIKAN_SENDER_ID",
  appId:             "GANTIKAN_APP_ID"
};

/* Jangan ubah di bawah ini */
window.__FIREBASE_CONFIG__ = firebaseConfig;
window.__FIREBASE_READY__  = !firebaseConfig.apiKey.startsWith("GANTIKAN");
