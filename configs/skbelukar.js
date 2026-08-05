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
