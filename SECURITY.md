# Keselamatan e-RMT

Aplikasi ini ialah laman statik HTML/CSS/JavaScript di GitHub Pages dengan Firebase Authentication dan Cloud Firestore. Ia tidak menjalankan pelayan Node.js atau PHP.

## Pembaikan 27 Oktober 2026

- Akaun baharu tidak lagi menerima Administrator secara automatik, termasuk apabila pertanyaan pengguna gagal.
- Laluan pemulihan admin automatik pada klien telah dibuang.
- Firestore mengehadkan penciptaan profil sendiri kepada Guru Kelas tanpa kelas; kemas kini sendiri hanya nama dan telefon. Pengguna tidak boleh menukar role, kelasId, aktif atau jawatan sendiri, atau memadam profil sendiri.
- Akaun admin yang aktif=false tidak mendapat kuasa pentadbiran melalui isAdmin(). Ini belum menyekat semua operasi akaun dinyahaktifkan dalam koleksi lain.
- Admin pertama bagi pemasangan baharu mesti disediakan oleh pemilik projek melalui Firebase Console.

Ini pembaikan kawalan akses, bukan pengesahan atau perlindungan DDoS lengkap. Pengguna log masuk masih mempunyai akses luas dalam beberapa koleksi; audit kebenaran mengikut kelas dan kelulusan pendaftaran memerlukan kerja susulan.

## Penyiasatan trafik dan kawalan penyalahgunaan

1. Catat waktu kejadian (Asia/Kuala_Lumpur), mesej ralat dan sama ada laman, Authentication atau Firestore yang gagal. Semak Usage Firestore, metrik Authentication, Cloud Monitoring dan status GitHub Pages untuk tempoh itu. Repo sahaja tidak mempunyai log trafik yang mengesahkan DDoS.
2. Daftarkan aplikasi web dalam Firebase App Check dengan penyedia yang sesuai, pasang SDK dan kunci awam penyedia, kemudian pantau metrik sebelum menguatkuasakan Firestore. Jangan aktifkan enforcement sebelum klien sah menghantar token kerana pengguna akan terhalang. App Check belum dipasang atau diaktifkan oleh perubahan ini.
3. Semak kuota dan amaran bajet Firebase/Google Cloud. Amaran bajet tidak mengehadkan perbelanjaan secara automatik.
4. GitHub Pages mengurus hosting statik; rate limiting dalam JavaScript pelayar boleh dipintas. Jika kawalan trafik tersuai diperlukan, gunakan hosting/proksi yang menyokong WAF dan rate limiting. Proksi laman sahaja tidak melindungi permintaan terus ke Firebase.

Rujukan:
- https://firebase.google.com/docs/app-check
- https://firebase.google.com/docs/app-check/monitor-metrics
- https://firebase.google.com/support/guides/security-checklist
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
