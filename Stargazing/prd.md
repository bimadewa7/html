# PRD: Web Bulan dan Bintang

## 1. Problem statement

Orang yang ingin menikmati suasana bulan dan bintang sering harus mencari gambar atau aplikasi terpisah. Produk ini menyediakan pengalaman singkat yang mudah diakses lewat web, dengan suasana romantis yang tidak berlebihan.

Halaman menampilkan langit bergaya kartun atau animasi, bukan simulasi astronomi realistis. Bentuk visual bulan mengikuti fase pada tanggal lokal pengguna. Produk ditujukan untuk hiburan dan suasana, bukan informasi ilmiah.

## 2. Target user + 2 persona

**Target user:** Pengunjung kasual yang ingin menikmati suasana langit romantis melalui web, terutama di ponsel.

### Persona 1 — Pengunjung kasual

- Membuka halaman untuk menikmati visual langit dengan cepat.
- Umumnya menggunakan ponsel dan tidak ingin mengatur banyak hal.
- Mengharapkan halaman langsung tampil dan nyaman dilihat.

### Persona 2 — Pengunjung yang ingin berbagi suasana

- Membuka atau membagikan halaman untuk menciptakan suasana romantis, misalnya kepada seseorang yang disukai.
- Menginginkan gaya yang manis tetapi tidak klise atau berlebihan.
- Mengharapkan visual yang menarik di ponsel maupun desktop.

## 3. Goals dan non-goals

### Goals

- Menampilkan bulan dan bintang dalam gaya kartun atau animasi, bukan realistis.
- Membuat visual bulan mengikuti fase pada tanggal lokal pengguna.
- Memberikan suasana romantis yang sederhana dan tidak berlebihan.
- Mendukung Chrome dan Safari pada mobile dan desktop dengan tampilan responsif.
- Menganimasikan elemen langit, sambil menghormati preferensi sistem untuk mengurangi gerakan.
- Menyediakan fallback statis jika JavaScript tidak berjalan.
- Dapat di-host sebagai situs statis melalui GitHub Pages.

### Non-goals

- Menampilkan posisi atau kondisi benda langit yang akurat.
- Menjadi alat observasi atau edukasi astronomi.
- Menggunakan lokasi pengguna atau API cuaca.
- Memerlukan akun, backend, atau penyimpanan data pengguna.
- Memungkinkan pengguna memilih tanggal lain untuk melihat fase bulan pada MVP.

## 4. User stories

- Sebagai pengunjung kasual, saya ingin melihat pemandangan bulan dan bintang supaya saya bisa menikmati suasana langit melalui web.
- Sebagai pengunjung yang ingin suasana romantis, saya ingin desain yang tidak berlebihan supaya pengalaman terasa manis tanpa terkesan klise.
- Sebagai pengguna ponsel, saya ingin tata letak menyesuaikan ukuran layar supaya visual nyaman dinikmati.
- Sebagai pengunjung, saya ingin bentuk visual bulan mengikuti fase pada tanggal lokal saya supaya tampilannya berubah sesuai hari ini.
- Sebagai pengunjung yang mengurangi gerakan di perangkat, saya ingin animasi dibatasi supaya halaman tetap nyaman digunakan.
- Sebagai pemilik situs, saya ingin situs dapat di-host secara statis di GitHub Pages supaya tidak perlu mengelola server.

## 5. Daftar fitur

### MVP

- Adegan langit dekoratif bergaya kartun atau animasi.
- Bentuk visual bulan mengikuti fase pada tanggal lokal pengguna.
- Animasi bintang atau elemen langit.
- Dukungan preferensi sistem untuk mengurangi gerakan.
- Tampilan responsif untuk Chrome dan Safari di mobile dan desktop.
- Fallback visual statis jika JavaScript tidak berjalan.
- Hosting statis melalui GitHub Pages.
- Tanpa emoji.

### V2

- Pilihan variasi tema atau suasana langit.
- Label nama fase bulan.
- Kontrol untuk memilih tanggal.

### Nanti

- Pengaturan visual yang dapat dibagikan melalui tautan.
- Efek ambient tambahan jika sesuai dengan arah desain.

## 6. Functional requirement detail per fitur MVP

### 6.1 Adegan langit

- Halaman menampilkan latar langit, bulan, dan bintang dengan gaya kartun atau animasi.
- Visual bulan tidak boleh mencoba meniru foto atau ilustrasi astronomi realistis.
- Suasana romantis harus terasa sederhana; hindari dekorasi, teks, atau animasi yang berlebihan.
- Pengunjung dapat menikmati adegan tanpa akun atau input data pribadi.
- Produk tidak menggunakan emoji.
- Konten teks tambahan tidak diwajibkan.

### 6.2 Fase bulan

- Bentuk visual bulan berubah mengikuti fase yang dihitung berdasarkan tanggal lokal pengguna.
- Perhitungan berjalan di browser, tanpa backend atau API eksternal.
- Jika perhitungan gagal, tampilkan visual bulan default.
- Jika JavaScript tidak tersedia, tampilkan adegan statis dengan bulan default.
- Bentuk bulan bersifat dekoratif; produk tidak mengklaim akurasi astronomis.

### 6.3 Pembaruan tanggal

- Jika halaman tetap terbuka melewati pergantian tanggal lokal, visual fase bulan diperbarui tanpa perlu memuat ulang halaman.
- Tanggal lokal perangkat menjadi acuan perhitungan.
- Jika perangkat memiliki tanggal atau waktu yang salah, hasil akan mengikuti tanggal atau waktu perangkat tersebut.

### 6.4 Animasi dan preferensi gerakan

- Bintang atau elemen langit dapat dianimasikan dengan gerakan halus yang tidak mengalihkan perhatian dari bulan.
- Jika sistem pengguna mengaktifkan preferensi pengurangan gerakan, animasi bergerak dinonaktifkan atau diganti dengan transisi statis.
- Ketika animasi dinonaktifkan, seluruh konten utama tetap terlihat dan berfungsi.
- Animasi tidak boleh menyebabkan gulir horizontal atau menghalangi interaksi.

### 6.5 Responsivitas dan kompatibilitas

- Halaman harus responsif pada mobile dan desktop.
- Chrome dan Safari menjadi browser yang wajib didukung.
- Konten utama tidak boleh terpotong atau menyebabkan gulir horizontal.
- Pengujian harus mencakup ukuran layar ponsel dan desktop; angka ukuran minimum belum ditentukan.
- Orientasi layar yang berubah tidak boleh merusak tata letak.

### 6.6 Hosting statis

- Situs dapat dipublikasikan melalui GitHub Pages.
- Fitur MVP berjalan tanpa server atau backend.
- Aset dan rute harus tetap dapat dimuat saat situs diakses melalui path proyek GitHub Pages.

## 7. Sketsa data model

MVP tidak memerlukan database. Fase bulan dihitung di browser.

### MoonPhase

- `localDate`: tanggal lokal yang menjadi acuan.
- `phaseValue`: nilai fase hasil perhitungan.
- `visualState`: nilai atau kelas yang menentukan bentuk visual bulan.

### SkyScene (opsional)

- `theme`: tema visual yang digunakan.
- `animationEnabled`: status animasi berdasarkan preferensi sistem.
- `starConfiguration`: konfigurasi tampilan bintang.

`SkyScene` tidak diperlukan jika MVP hanya memiliki satu tema dan preferensi animasi diterapkan langsung lewat CSS.

## 8. Edge case dan failure state

- **JavaScript tidak tersedia:** tampilkan adegan statis dengan bulan default.
- **Perhitungan fase gagal:** tetap render halaman dan gunakan bulan default.
- **Tanggal lokal berganti saat halaman terbuka:** hitung ulang fase berdasarkan tanggal lokal baru.
- **Waktu atau tanggal perangkat salah:** visual mengikuti waktu perangkat; aplikasi tidak memperbaiki atau memvalidasi waktu secara eksternal.
- **Preferensi pengurangan gerakan aktif:** matikan atau kurangi animasi, tetapi pertahankan seluruh visual utama.
- **Aset gagal dimuat:** tampilkan elemen visual dasar yang tersedia, bukan layar kosong.
- **Path GitHub Pages bukan root domain:** aset dan halaman tetap dapat dimuat.
- **Ukuran layar atau orientasi berubah:** tata letak menyesuaikan tanpa konten terpotong atau gulir horizontal.
- **Perbedaan implementasi Chrome dan Safari:** visual dan fungsi inti harus tetap berjalan pada kedua browser; efek dekoratif boleh memiliki fallback bila tidak didukung.

## 9. Success metrics

- **Render halaman:** adegan langit tampil di Chrome dan Safari pada mobile dan desktop yang diuji.
- **Kesesuaian fase:** visual bulan berubah berdasarkan tanggal lokal dan diperbarui setelah pergantian hari saat halaman tetap terbuka.
- **Fallback:** adegan statis tampil ketika JavaScript tidak tersedia atau perhitungan fase gagal.
- **Preferensi gerakan:** animasi bergerak tidak tampil saat sistem meminta pengurangan gerakan.
- **Responsivitas:** tidak ada gulir horizontal atau elemen utama yang terpotong pada ukuran layar yang diuji.
- **Hosting:** situs dapat diakses melalui GitHub Pages tanpa backend.
- **Kesesuaian gaya:** visual terasa kartun atau animatif dan tidak tampak realistis; penerimaan akhirnya ditentukan melalui evaluasi desain.

## 10. Open questions

- Tidak ada pertanyaan terbuka yang memblokir perumusan MVP.
- Metode perhitungan fase dan batas toleransi visual belum ditetapkan. Karena produk bersifat dekoratif, MVP tidak menjanjikan akurasi astronomis.
- Ukuran layar minimum belum ditentukan; kriteria penerimaan adalah responsif dan berfungsi pada Chrome dan Safari di mobile serta desktop.
