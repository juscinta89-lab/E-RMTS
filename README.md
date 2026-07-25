# RMT Attendance SK Belukar

Sistem Rekod Kehadiran Murid RMT — paparan kehadiran mengikut **Borang C8 KPM**.
PWA (boleh install) · Hosting **GitHub Pages** · Database **Firebase Firestore**.

---

## Apa yang SIAP dalam versi ini (v1)

| Modul | Status |
|---|---|
| Log masuk + peranan (Admin, GB, PK HEM, Guru, PT) | ✅ |
| Papan pemuka + kad statistik + carta bulanan | ✅ |
| **Modul Kehadiran Borang C8** (grid 1–31, auto weekend kelabu, auto-kira, auto-simpan) | ✅ |
| Maklumat Murid (tambah/edit/padam, cari, tapis, import CSV) | ✅ |
| Maklumat Kelas (CRUD, guru kelas) | ✅ |
| Guru & Pengguna (CRUD, role, kelas, aktif/tidak) | ✅ |
| Tetapan Sekolah | ✅ |
| Cetak PDF A4 Landscape (borang C8) | ✅ |
| PWA (manifest, service worker, installable, offline shell, dark mode) | ✅ |
| Firestore Security Rules | ✅ |
| **Mod Demo** (guna terus tanpa Firebase, data dalam pelayar) | ✅ |

**Belum termasuk (peringkat seterusnya):** Export Excel (xlsx), backup/restore JSON,
log aktiviti penuh, QR login, integrasi APDM, penandaan cuti umum automatik,
mod tahun persekolahan berbilang sesi. Semua ni boleh saya sambung bila-bila.

---

## Cara CUBA segera (Mod Demo — tanpa setup apa-apa)

1. Buka `index.html` guna pelayar (atau serve fail secara lokal).
2. Log masuk: **admin / admin123** (admin) atau **cikgu / cikgu123** (guru kelas).
3. Data contoh sudah ada. Pergi ke **Kehadiran (C8)** → klik sel untuk tanda hadir/tidak.

> Mod Demo simpan data dalam `localStorage` pelayar sahaja (untuk uji UI).
> Untuk kegunaan sebenar berbilang pengguna, sambung ke Firebase (langkah bawah).

---

## Langkah 1 — Sediakan Firebase

1. Pergi ke <https://console.firebase.google.com> → **Add project** (cth: `rmt-sk-belukar`).
2. **Build → Authentication → Get started → Sign-in method** → **Add new provider**:
   - **Google** → Enable → pilih "Project support email" → **Save** *(ini untuk log masuk guna Google ID)*.
   - (Pilihan) **Email/Password** → Enable → **Save** *(kalau ada guru tanpa akaun Google)*.
3. **Build → Firestore Database → Create database** → mula dalam *production mode*.
4. **Project settings (⚙️) → General → Your apps → Web (`</>`)** → daftar app →
   salin objek `firebaseConfig`.
5. Buka `js/firebase-config.js` → gantikan semua nilai `GANTIKAN_...` dengan config anda.
6. **Firestore → Rules** → tampal kandungan fail `firestore.rules` → **Publish**.

### Cipta admin pertama (guna Google ID)
Peranan/kredensial dipadan ikut **emel**. ID dokumen dalam koleksi `users` = emel pengguna,
supaya serasi dengan Security Rules. Untuk admin pertama, daftar emel Google anda secara manual:

1. **Firestore → Start collection** → Collection ID: `users`.
2. **Document ID** = emel Google anda sendiri (cth: `guru.besar@gmail.com`).
3. Tambah medan:
   - `nama` (string) = nama anda
   - `role` (string) = `Administrator`
   - `email` (string) = emel yang sama
   - `aktif` (boolean) = `true`
4. Buka aplikasi → **Log masuk dengan Google** → pilih akaun Google tersebut.
   Anda terus masuk sebagai Administrator.
5. Selepas itu, tambah guru lain terus dari aplikasi (**Guru & Pengguna**) —
   cukup isi **emel akaun Google** mereka + peranan + kelas. Bila mereka log masuk
   Google guna emel sama, mereka automatik dapat akses. Tiada kata laluan diperlukan.

> **PENTING (domain dibenarkan):** selepas deploy ke GitHub Pages, pergi ke
> **Authentication → Settings → Authorized domains → Add domain** dan masukkan
> `USERNAME.github.io`. Untuk uji secara lokal, tambah juga `localhost`.
> Tanpa ini, log masuk Google akan gagal walau config betul.

---

## Langkah 2 — Hosting di GitHub Pages

1. Buat repo baru di GitHub (cth: `rmt-skb`).
2. Muat naik SEMUA fail projek ini ke repo (kekalkan struktur folder).
   ```
   git init
   git add .
   git commit -m "RMT Attendance SK Belukar"
   git branch -M main
   git remote add origin https://github.com/USERNAME/rmt-skb.git
   git push -u origin main
   ```
3. Repo → **Settings → Pages → Build and deployment → Source: Deploy from a branch** →
   Branch: `main` / folder `/ (root)` → **Save**.
4. Tunggu 1–2 minit. URL app: `https://USERNAME.github.io/rmt-skb/`.

> Semua path dalam projek ini **relatif** (`./`), jadi ia berfungsi walaupun app
> berada dalam sub-folder repo (`/rmt-skb/`).

---

## Langkah 3 — Install sebagai aplikasi (PWA)

- **Android (Chrome):** buka URL → menu ⋮ → **Add to Home screen / Install app**.
- **Windows (Chrome/Edge):** ikon install di bar alamat → **Install**.
- **iPhone (Safari):** Kongsi → **Add to Home Screen**.

Selepas fail dikemas kini, naikkan `CACHE_VER` dalam `service-worker.js` (cth `rmt-skb-v2`)
supaya pengguna dapat versi terbaru automatik.

---

## Struktur folder

```
rmt-skb/
├── index.html
├── manifest.json
├── service-worker.js
├── firestore.rules
├── README.md
├── css/styles.css
├── js/
│   ├── app.js
│   └── firebase-config.js   ← isi config anda di sini
├── assets/ (icon-192.png, icon-512.png)
└── templates/template_murid.csv
```

## Struktur data Firestore

```
settings/school        → profil sekolah
users/{uid}            → nama, role, kelasId, email, tel, aktif
classes/{id}           → tahun, nama, guruId
students/{id}          → nama, mykid, jantina, tahun, kelasId, statusRMT
attendance/{kelasId_tahun_bulan}
                       → records: { studentId: { "1":"H","2":"X", ... } }
holidays/{id}          → date (YYYY-MM-DD), nama
activity_logs/{id}     → log aktiviti
```

---

Ada apa-apa nak tambah/ubah, bagitau je.
