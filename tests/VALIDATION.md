# Pengesahan sekolah ganti — 27 Oktober 2026

- `node --test tests/calendar.test.cjs`: hujung minggu Kumpulan A/B, pertindihan cuti dengan sekolah ganti, kiraan tanpa pendua, pemadaman pengecualian, tiada cuti mingguan dan tarikh tahun lompat.
- Semakan sintaks `js/app.js` dan `service-worker.js`; `git diff --check`.
- Automasi Chrome headless melalui Playwright, viewport 390×844, zon Asia/Kuala_Lumpur, masa ujian 27 Oktober 2026; konfigurasi Firebase diganti dengan mod demo dalam pelayar ujian sahaja. Tiada data produksi diubah.
- Tambah/edit sekolah ganti 24 Oktober, muat semula dan semak kegigihan data; paparan tidak melimpah lebar telefon.
- Tanda hadir dalam C8 pada Sabtu gantian; semak jumlah baris, teks kecil pada nama, jumlah hadir dan jumlah kehadiran sepatutnya; semak rumusan dan HTML cetakan pukal.
- Padam tetapan gantian dan pastikan rekod hadir kekal serta tarikh kembali cuti mingguan.
- Cuba URL admin menggunakan peranan guru; semak pengalihan ke dashboard.
- Simpan tiada hari cuti mingguan dan muat semula; tambah cuti pendua dan semak hanya satu rekod disimpan.
- Tiada ralat JavaScript pelayar dikesan dalam aliran ujian ini.

Had pengesahan: aliran UI diuji dengan storan demo, bukan penulisan Firestore produksi. Rules settings sedia ada mengehadkan penulisan kepada admin; tiada perubahan rules diperlukan. Kamera fizikal iPhone dan dialog cetak sistem tidak diuji.
