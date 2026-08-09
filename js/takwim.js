/* =========================================================
   TAKWIM PERSEKOLAHAN KPM — data cuti sekolah
   ---------------------------------------------------------
   CARA TAMBAH TAHUN BARU (sekali setahun):
   1. Salin blok `2026:{...}` di bawah, tukar tahunnya.
   2. Isi tarikh dari Takwim Persekolahan KPM:
        Lampiran A -> Kumpulan A (Kedah, Kelantan, Terengganu)
        Lampiran B -> Kumpulan B (negeri lain)
        Lampiran C -> cuti perayaan (masukkan dalam kumpulan masing-masing)
   3. Format julat: ['mula','akhir','nama'] — kedua-dua hujung TERMASUK.
      Untuk satu hari sahaja, letak tarikh yang sama pada mula & akhir.
   4. Simpan, commit, push. Pilihan tahun baharu terus muncul dalam
      menu "Hari & Cuti" untuk SEMUA sekolah — tiada perubahan lain perlu.

   Nota: cuti kalendar Islam (Awal Muharram, Maulidur Rasul, Aidiladha)
   dan cuti negeri berbeza setiap tahun/negeri — biarkan admin sekolah
   menambahnya secara manual.
   ========================================================= */
window.KPM_KALENDAR = {
  2026:{
    A:[ /* Kedah, Kelantan, Terengganu */
      ['2026-01-01','2026-01-10','Cuti Akhir Persekolahan 2025'],
      ['2026-02-15','2026-02-19','Cuti Tahun Baru Cina'],
      ['2026-03-19','2026-03-19','Cuti Tambahan Hari Raya Aidilfitri'],
      ['2026-03-20','2026-03-28','Cuti Penggal 1'],
      ['2026-05-22','2026-06-06','Cuti Pertengahan Tahun'],
      ['2026-08-28','2026-09-05','Cuti Penggal 2'],
      ['2026-11-08','2026-11-09','Cuti Deepavali'],
      ['2026-12-04','2026-12-31','Cuti Akhir Persekolahan']
    ],
    B:[ /* Johor, Melaka, N9, Pahang, Perak, Perlis, P.Pinang,
           Sabah, Sarawak, Selangor, WP KL/Labuan/Putrajaya */
      ['2026-01-01','2026-01-11','Cuti Akhir Persekolahan 2025'],
      ['2026-02-16','2026-02-20','Cuti Tahun Baru Cina'],
      ['2026-03-19','2026-03-20','Cuti Tambahan Hari Raya Aidilfitri'],
      ['2026-03-21','2026-03-29','Cuti Penggal 1'],
      ['2026-05-23','2026-06-07','Cuti Pertengahan Tahun'],
      ['2026-08-29','2026-09-06','Cuti Penggal 2'],
      ['2026-11-08','2026-11-08','Cuti Deepavali'],
      ['2026-11-10','2026-11-10','Cuti Tambahan Deepavali'],  /* Sarawak: 09-11 */
      ['2026-12-05','2026-12-31','Cuti Akhir Persekolahan']
    ],
    /* Kelepasan am persekutuan bertarikh tetap */
    umum:[
      ['2026-05-01','Hari Pekerja'],
      ['2026-08-31','Hari Kebangsaan'],
      ['2026-09-16','Hari Malaysia'],
      ['2026-12-25','Hari Krismas']
    ]
  }
};
