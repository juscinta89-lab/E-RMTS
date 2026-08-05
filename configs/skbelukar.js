/* =========================================================
   TEMPLATE CONFIG SEKOLAH — salin fail ini untuk sekolah baru
   ---------------------------------------------------------
   1. Salin fail ini, namakan ikut ID sekolah (huruf kecil,
      tanpa ruang), cth:  skbelukar.js , skseberang.js
   2. Isi nilai firebaseConfig dari projek Firebase SEKOLAH ITU
      (setiap sekolah = projek Firebase berasingan!)
   3. Commit & push ke GitHub.
   4. Link sekolah: https://USERNAME.github.io/REPO/?s=skbelukar
   ========================================================= */

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
