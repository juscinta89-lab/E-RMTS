# Panduan Menjual Sistem RMT kepada Sekolah Lain

Seni bina: **SATU repo & deployment** (selenggara sekali, semua sekolah dapat update),
tetapi **SETIAP sekolah ada projek Firebase SENDIRI** (data terasing 100%).

```
GitHub Pages (satu sahaja)
   │
   ├── ?s=skbelukar   ──▶  Firebase projek "rmt-skbelukar"    (data SK Belukar)
   ├── ?s=skseberang  ──▶  Firebase projek "rmt-skseberang"   (data SK Seberang)
   └── ?s=skcontoh    ──▶  Firebase projek "rmt-skcontoh"     (data SK Contoh)
```

---

## Onboard sekolah baru (± 20 minit, buat SEKALI setiap pembeli)

### A. Buat projek Firebase untuk sekolah itu
1. <https://console.firebase.google.com> → **Add project** → nama cth `rmt-skseberang`
   *(Guna akaun Google anda sendiri, ATAU lebih elok: minta sekolah sediakan akaun
   Google sekolah dan buat projek di situ — sekolah "memiliki" data mereka, bagus utk PDPA).*
2. **Authentication → Get started → Sign-in method** → Enable **Email/Password**
   (dan **Google** jika mahu).
3. **Firestore Database → Create database** → lokasi `asia-southeast1` → production mode.
4. **Firestore → Rules** → tampal kandungan fail `firestore.rules` repo ini → **Publish**.
5. **Authentication → Settings → Authorized domains → Add domain** →
   `USERNAME.github.io`.
6. **Project settings ⚙️ → Your apps → Web `</>`** → daftar app → salin `firebaseConfig`.

### B. Tambah config sekolah ke repo (2 minit)
1. Salin `configs/contoh-sekolah.js` → namakan `configs/skseberang.js`
   (ID: huruf kecil, tanpa ruang — ini akan jadi `?s=skseberang`).
2. Tampal nilai `firebaseConfig` dari langkah A6.
   **Jangan lupa isi juga nama sekolah** di bahagian atas fail:
   ```js
   window.__SCHOOL_NAME__  = "SEKOLAH KEBANGSAAN SEBERANG";  // skrin login & laporan
   window.__SCHOOL_SHORT__ = "SK Seberang";                  // topbar & nama ikon app
   ```
   Nama inilah yang muncul pada skrin log masuk, topbar, tajuk tab, dan nama
   aplikasi semasa guru install PWA. Kalau dibiarkan kosong, app papar
   "RMT Attendance" sehingga admin sekolah mengisi Tetapan Sekolah.
3. Commit & push. Tunggu GitHub Pages siap (±1 minit).

### C. Serahkan kepada sekolah
1. Link sekolah: `https://USERNAME.github.io/REPO/?s=skseberang`
2. Buka link → **Daftar Akaun Baharu** → pendaftar pertama = **Administrator**
   (biasanya anda buat bersama Guru Besar / penyelaras semasa serahan).
3. Admin sekolah isi **Tetapan Sekolah** (nama, logo, warna tema), tambah kelas,
   import murid (CSV), tambah guru. Siap.
4. Ajar guru **install PWA** dari link tersebut (selepas install, app sentiasa
   ingat sekolahnya sendiri — tak perlu taip `?s=` lagi).

---

## Kemas kini takwim persekolahan (sekali setahun)

Bila Takwim Persekolahan KPM tahun baharu keluar:

1. Buka `js/takwim.js` — semua data cuti ada dalam SATU fail ini sahaja.
2. Salin blok `2026:{...}`, tukar tahunnya, dan isi tarikh dari:
   - **Lampiran A** → `A:` (Kedah, Kelantan, Terengganu)
   - **Lampiran B** → `B:` (negeri lain)
   - **Lampiran C** → cuti perayaan, masukkan dalam kumpulan masing-masing
3. Commit & push **sekali** — pilihan tahun baharu terus muncul di menu
   **Hari & Cuti** untuk **semua sekolah pelanggan**. Tiada kerja lain diperlukan.
4. Beritahu sekolah: Hari & Cuti → Muat Kalendar KPM → pilih tahun & kumpulan.

> Takwim adalah sama untuk seluruh negara (cuma Kumpulan A/B berbeza),
> jadi satu kemas kini melayani semua pelanggan. Cuti kalendar Islam dan
> cuti negeri masih perlu ditambah manual oleh admin sekolah.

## Selenggaraan
- **Update sistem**: edit kod → naikkan `CACHE_VER` dalam `service-worker.js` →
  push SEKALI → semua sekolah dapat versi baru automatik.
- **Update rules**: jika `firestore.rules` berubah, publish semula di SETIAP
  projek Firebase sekolah (senaraikan pelanggan anda dalam satu nota).
- Setiap sekolah patut muat turun **Backup JSON** sendiri secara berkala
  (Tetapan → Backup) — ini juga jualan point: "data anda, anda pegang".

## Nota penting
- Data setiap sekolah TIDAK mungkin bercampur — projek Firebase berasingan sepenuhnya.
- Satu peranti boleh guna 2 sekolah berbeza (sesi & tema diasingkan automatik).
- Kuota percuma Firebase (Spark) cukup besar untuk satu sekolah — kos server RM0.
- Model harga lazim: **yuran setup sekali** + **yuran sokongan/penyelenggaraan tahunan**.
- PDPA: kerana data murid terlibat, elok projek Firebase dibuat atas akaun sekolah
  sendiri, dan nyatakan dalam surat tawaran siapa pemilik & pemproses data.
