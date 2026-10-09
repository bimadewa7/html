# Design Brief UI/UX: Web Bulan dan Bintang

## Arah desain utama

Produk ini harus terasa seperti melihat langit malam yang tenang, personal, dan sedikit romantis. Romantisnya berasal dari warna, ruang kosong, dan gerakan halus—bukan dari copy atau dekorasi yang manis berlebihan.

Desain dibuat sebagai satu pengalaman visual utama, bukan dashboard atau aplikasi utilitas.

## 1. Design principles

### 1. Tenang, bukan ramai

Langit malam menjadi fokus utama. Bulan adalah pusat perhatian, sementara bintang hanya mendukung komposisi.

Wajib:
- Gunakan jumlah elemen visual yang terbatas.
- Sisakan ruang kosong yang cukup.
- Batasi warna aksen.
- Hindari panel, card, badge, atau kontrol yang tidak diperlukan.

Alasan: target user datang untuk menikmati suasana, bukan menyelesaikan banyak tugas.

### 2. Romantis secara implisit

Suasana romantis harus muncul dari nuansa visual, bukan dari simbol romantis yang eksplisit.

Wajib:
- Gunakan palet navy, lavender, rose yang redup, dan warna bulan yang hangat.
- Gunakan animasi yang lambat dan lembut.
- Hindari hati, emoji, kata-kata gombal, glitter berlebihan, dan ornamen dekoratif klise.
- Jangan menggunakan copy romantis generik.

Alasan: produk ditujukan untuk suasana romantis yang tidak cringe atau corny.

### 3. Visual dulu, fungsi tetap jelas

Bulan dan langit menjadi pengalaman utama, tetapi informasi dan interaksi tetap harus mudah dipahami.

Wajib:
- Bulan harus langsung terlihat saat halaman dibuka.
- Kontrol tambahan tidak boleh menutupi bulan.
- Status fase bulan, jika ditampilkan, harus sekunder.
- Responsivitas dan aksesibilitas tidak boleh dikorbankan demi efek visual.

Alasan: pengguna harus mendapatkan pengalaman utama tanpa perlu memahami cara kerja produk.

## 2. Visual direction

### Mood

- Tenang
- Malam hari
- Intim
- Hangat
- Sedikit dreamy
- Minimal
- Kartun editorial, bukan kartun anak-anak
- Romantis secara subtle

### Referensi suasana

- Langit malam dengan gradasi lembut.
- Ilustrasi buku cerita modern.
- Poster animasi dengan bentuk sederhana.
- Scenic illustration dengan siluet dan negative space.
- Motion design lambat seperti drifting atau floating.

### Gaya ilustrasi

**Bulan**
- Bentuk bulat sederhana.
- Tekstur permukaan minimal atau tidak ada.
- Tidak menggunakan crater realistis.
- Tidak dibuat seperti foto NASA.
- Gunakan shadow berbentuk kurva untuk mewakili fase.
- Gunakan highlight organik kecil bila diperlukan.

**Bintang**
- Titik kecil dengan ukuran bervariasi.
- Sebagian bintang dapat berupa bentuk empat titik yang sederhana.
- Tidak semua bintang berkelap-kelip.
- Animasi cukup berupa opacity atau pergeseran sangat kecil.

**Latar**
- Gradasi vertikal dari biru gelap ke ungu gelap.
- Horizon dapat memiliki glow tipis.
- Awan atau bukit hanya digunakan jika tidak mengurangi fokus pada bulan.
- Hindari lanskap kota detail.

### Yang dihindari

- Foto bulan realistis atau tekstur crater detail.
- Warna neon.
- Background hitam polos tanpa kedalaman.
- Gradien terlalu terang atau terlalu banyak.
- Hati, cupid, bunga, glitter, dan emoji.
- Tipografi handwritten atau script.
- Copy romantis yang eksplisit.
- Parallax kuat atau bintang bergerak cepat.
- Splash screen, onboarding, dan modal pembuka.

## 3. Design tokens

### 3.1 Warna

| Token | Hex | Penggunaan |
|---|---|---|
| `night-950` | `#080B1D` | Latar paling gelap, fallback background |
| `night-900` | `#0E1330` | Latar utama atas |
| `night-800` | `#191A45` | Latar tengah dan elemen kedalaman |
| `violet-700` | `#4E477D` | Gradasi bawah atau elemen sekunder |
| `violet-500` | `#8378BE` | Glow dan aksen visual |
| `lavender-300` | `#B9B1E3` | Detail dekoratif dan state aktif |
| `moon-100` | `#FFF3D2` | Permukaan bulan |
| `moon-200` | `#F4DFAF` | Highlight atau variasi permukaan bulan |
| `rose-300` | `#D49AA9` | Aksen romantis terbatas |
| `white` | `#FFFFFF` | Teks pada latar gelap |
| `text-muted` | `#B8B9CB` | Teks sekunder |
| `focus` | `#F4DFAF` | Focus ring pada elemen interaktif |

Background utama menggunakan gradasi dari `night-900` di atas, `night-800` di tengah, dan `violet-700` di bawah. Glow bulan menggunakan `violet-500` dengan opacity rendah. `rose-300` hanya untuk aksen kecil agar tampilan tidak terasa terlalu manis.

### 3.2 Tipografi

**Font utama: Manrope**

Alasan: Manrope modern dan sedikit rounded tanpa terasa kekanak-kanakan, terbaca baik di mobile, dan mendukung ilustrasi kartun yang bersih. Hindari font script atau display dekoratif karena terlalu romantis.

Fallback:

```text
Manrope, ui-sans-serif, system-ui, sans-serif
```

| Token | Ukuran | Line height | Penggunaan |
|---|---:|---:|---|
| `display-xl` | 48px | 1.05 | Judul utama desktop jika diperlukan |
| `display-lg` | 40px | 1.1 | Judul utama mobile |
| `heading-md` | 24px | 1.2 | Label atau heading sekunder |
| `body-lg` | 18px | 1.5 | Deskripsi utama |
| `body-md` | 16px | 1.5 | Body text standar |
| `body-sm` | 14px | 1.4 | Informasi sekunder |
| `label` | 12px | 1.3 | Label kecil dan status |

Aturan:
- Judul utama maksimal dua baris.
- Teks utama tidak lebih dari 60 karakter bila tidak diperlukan.
- Jangan menambahkan heading hanya untuk mengisi ruang.

### 3.3 Spacing

Gunakan basis 4px:

| Token | Nilai |
|---|---:|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-20` | 80px |

Aturan:
- Padding horizontal mobile: 20px.
- Padding horizontal desktop: maksimal 48px.
- Jarak antara bulan dan informasi: 24–32px.
- Jangan memadatkan visual utama dengan spacing kecil.

### 3.4 Radius

| Token | Nilai | Penggunaan |
|---|---:|---|
| `radius-sm` | 8px | Kontrol kecil |
| `radius-md` | 12px | Tombol dan panel |
| `radius-lg` | 20px | Panel utama |
| `radius-pill` | 999px | Toggle atau status |
| `radius-circle` | 50% | Bulan dan elemen bundar |

Bulan harus benar-benar bundar. Tombol tidak perlu selalu berbentuk pill.

### 3.5 Shadow dan glow

| Token | Nilai | Penggunaan |
|---|---|---|
| `shadow-soft` | `0 8px 32px rgba(5, 7, 25, 0.24)` | Panel dan elemen floating |
| `shadow-deep` | `0 16px 64px rgba(5, 7, 25, 0.36)` | Komponen foreground |
| `glow-moon` | `0 0 48px rgba(255, 243, 210, 0.20)` | Halo bulan |
| `glow-violet` | `0 0 80px rgba(131, 120, 190, 0.18)` | Ambient background |

Glow harus menggunakan opacity rendah; bulan tidak boleh terlihat seperti lampu neon.

### 3.6 Motion tokens

| Token | Nilai | Penggunaan |
|---|---:|---|
| `motion-fast` | 160ms | Hover dan focus |
| `motion-standard` | 280ms | Transisi UI |
| `motion-slow` | 8–16s | Gerakan ambient |
| `ease-soft` | `cubic-bezier(0.22, 1, 0.36, 1)` | Perpindahan halus |

Aturan:
- Tidak ada animasi yang berubah cepat dan terus-menerus.
- Pergerakan bintang menggunakan durasi panjang.
- Pada `prefers-reduced-motion: reduce`, animasi kontinu dihentikan.

## 4. Screen inventory

MVP hanya memiliki satu screen utama.

### Screen 1 — Night Scene

**Tujuan:** Memberikan pengalaman visual langit malam yang langsung dapat dinikmati.

Isi:
- Latar langit.
- Bintang.
- Bulan dengan fase sesuai tanggal lokal.
- Informasi singkat atau label fase hanya jika diperlukan.
- Kontrol aksesibilitas atau pengaturan gerakan hanya jika diperlukan.

Tidak ada login, dashboard, halaman pengaturan terpisah, onboarding, atau modal pembuka.

### State turunan untuk Night Scene

- Initial render.
- Moon phase loaded.
- Fallback phase.
- Reduced motion.
- JavaScript fallback.
- Asset failure.
- Offline atau tanpa koneksi.

## 5. User flow

### Journey utama: menikmati pemandangan langit

1. Pengguna membuka URL.
2. Latar langit langsung tampil.
3. Bintang dan bulan muncul tanpa menunggu interaksi.
4. Sistem membaca tanggal lokal perangkat.
5. Sistem menghitung nilai fase bulan.
6. Bentuk bulan disesuaikan dengan fase tersebut.
7. Animasi bintang berjalan secara halus.
8. Pengguna menikmati halaman tanpa perlu melakukan tindakan.
9. Jika tanggal lokal berganti saat halaman terbuka, fase dihitung ulang otomatis.

### Journey: perangkat menggunakan reduced motion

1. Pengguna membuka URL.
2. Sistem membaca preferensi `prefers-reduced-motion`.
3. Langit dan bulan tetap ditampilkan.
4. Animasi kontinu dinonaktifkan.
5. Bintang menggunakan posisi statis atau transisi sangat minimal.
6. Pengguna tetap mendapatkan pengalaman visual penuh tanpa gerakan berlebihan.

### Journey: perhitungan fase gagal

1. Pengguna membuka URL.
2. Latar, bintang, dan bulan default langsung tampil.
3. Sistem mencoba menghitung fase bulan.
4. Perhitungan gagal.
5. Sistem mempertahankan bulan default.
6. Tidak ada error teknis yang ditampilkan.
7. Pengalaman visual tetap lengkap.

### Journey: JavaScript tidak tersedia

1. Pengguna membuka URL.
2. HTML dan CSS menampilkan fallback adegan statis.
3. Bulan default ditampilkan.
4. Tidak ada informasi fase dinamis.
5. Tidak ada layar error atau pesan teknis.

### Journey: pengguna membuka secara offline

1. Pengguna membuka situs yang asetnya sudah tersimpan di browser.
2. Adegan langit tampil dari aset lokal atau cache.
3. Fase bulan dihitung dari tanggal lokal.
4. Fungsi utama tidak memerlukan permintaan jaringan.
5. Jika aset belum tersimpan dan gagal dimuat, fallback CSS tetap digunakan.

## 6. Layout per screen

### Screen 1 — Night Scene

#### 1. Viewport background

- Mengisi minimal seluruh tinggi viewport.
- Menggunakan gradasi vertikal.
- Tidak menggunakan scroll untuk screen utama pada mobile normal.
- Elemen dekoratif ditempatkan pada layer terpisah dari konten.

#### 2. Decorative star layer

- Berada di belakang bulan dan teks.
- Menempati seluruh viewport.
- Menggunakan bintang dengan variasi ukuran dan opacity.
- Tidak interaktif dan tidak menangkap pointer event.

#### 3. Top utility area

Posisi:
- Mobile: kanan atas dengan padding 16–20px.
- Desktop: kanan atas dengan padding 32–48px.

Kontrol animasi manual tidak ditampilkan secara default. Sistem tetap wajib menghormati reduced motion. Jika kontrol ditambahkan nanti, gunakan satu tombol icon-only dengan accessible name dan jangan sampai mengganggu fokus pada bulan.

#### 4. Main visual area

- Mobile: di tengah secara vertikal, dengan ruang aman dari browser UI.
- Desktop: di tengah viewport.
- Bulan menjadi primary visual.
- Halo lembut ditempatkan di belakang bulan.
- Aksen awan atau glow hanya digunakan bila diperlukan.

Ukuran bulan:
- Mobile: 180–240px, responsif.
- Tablet: 260–340px.
- Desktop: 320–440px.
- Batasi ukuran maksimum agar ruang kosong tetap cukup.

#### 5. Information area

- Berada di bawah bulan, berjarak 24–32px.
- Lebar maksimal 320px di mobile dan 420px di desktop.
- Rata tengah.
- Informasi bersifat sekunder dan tidak memuat data astronomi detail.
- Nama fase tidak ditampilkan pada MVP karena belum menjadi kebutuhan wajib.

#### 6. Optional atmospheric foreground

- Glow tipis di area bawah.
- Siluet bukit atau awan maksimal satu layer.
- Tidak menutup bulan atau mengalihkan perhatian.
- Boleh dihilangkan pada layar pendek.

### Hirarki

1. Bulan.
2. Komposisi langit dan bintang.
3. Informasi sekunder.
4. Kontrol aksesibilitas atau utilitas.

### Primary action

Tidak ada primary action pada MVP. Produk adalah pengalaman visual pasif. Tombol utama akan mengubah ekspektasi menjadi aplikasi utilitas, bukan adegan yang dinikmati.

Jika kontrol animasi manual ditambahkan, posisinya sebagai secondary utility.

### Komponen yang dipakai

- `SkyCanvas`
- `StarField`
- `MoonVisual`
- `MoonGlow`
- `SceneInfo`
- `MotionControl` — opsional
- `FallbackScene`
- `LiveStatus` — status aksesibilitas, tidak terlihat secara visual

## 7. Component library

### 7.1 `SkyCanvas`

Container utama adegan.

Variants: `default`, `fallback`, `reduced-motion`.

States: `rendering`, `ready`, `fallback`, `asset-degraded`.

Perilaku:
- Mengatur layer background, stars, moon, dan foreground.
- Tidak mengubah ukuran layout saat state berpindah.

### 7.2 `StarField`

Kumpulan bintang dekoratif.

Variants: `animated`, `static`, `reduced-motion`.

States: `visible`, `hidden`, `degraded`.

Perilaku:
- `animated` digunakan bila motion preference mengizinkan.
- `static` digunakan untuk fallback dan reduced motion.
- Tidak interaktif dan menggunakan `aria-hidden="true"`.

### 7.3 `MoonVisual`

Representasi visual bulan berdasarkan `visualState`.

Variants:
- `new`
- `waxing-crescent`
- `first-quarter`
- `waxing-gibbous`
- `full`
- `waning-gibbous`
- `last-quarter`
- `waning-crescent`
- `default`

States: `loading`, `resolved`, `fallback`, `error`.

Perilaku:
- Menggunakan bentuk dekoratif sederhana tanpa tekstur realistis.
- Perubahan bentuk menggunakan transisi lembut kecuali reduced motion aktif.
- Memiliki accessible label jika fase disampaikan sebagai informasi.

### 7.4 `MoonGlow`

Halo dekoratif bulan.

Variants: `soft`, `reduced`, `none`.

States: `visible`, `hidden`.

Perilaku:
- Tidak menyampaikan informasi.
- Menggunakan `aria-hidden="true"`.
- Dapat dihilangkan jika performa atau dukungan visual terbatas.

### 7.5 `SceneInfo`

Informasi sekunder di bawah bulan.

Variants: `date`, `phase-label`, `fallback-message`.

States: `hidden`, `visible`, `fallback`.

Aturan:
- Tidak menjadi fokus utama.
- Pesan fallback harus singkat dan tidak teknis.
- Jangan menampilkan pesan seperti “Moon phase calculation failed”.

### 7.6 `MotionControl`

Kontrol untuk mengaktifkan atau menonaktifkan animasi secara manual.

Status MVP: tidak ditampilkan kecuali diputuskan kemudian. Preferensi sistem tetap wajib dihormati.

Variants: `icon-button`, `text-button`.

States: `motion-on`, `motion-off`, `focused`, `disabled`.

Aksesibilitas:
- Menggunakan elemen `button`.
- Memiliki accessible name yang jelas dan menyesuaikan aksi.
- Tidak hanya mengandalkan bentuk icon.

### 7.7 `FallbackScene`

Adegan statis saat JavaScript atau perhitungan dinamis gagal.

Variants: `no-script`, `calculation-failure`, `asset-failure`.

States: `visible`, `hidden`.

Perilaku:
- Menampilkan latar, bintang statis, dan bulan default.
- Tidak menampilkan error teknis.
- Mempertahankan komposisi visual utama.

### 7.8 `LiveStatus`

Status untuk screen reader.

Variants: `silent`, `polite`.

States: `idle`, `updated`, `fallback`.

Perilaku:
- Tidak terlihat secara visual.
- Digunakan ketika fase berubah setelah pergantian tanggal.
- Update memakai `aria-live="polite"`, bukan `assertive`.

## 8. State per screen kunci

### Night Scene — Initial/loading

- Background langsung tersedia.
- Bulan default atau placeholder bulan ditampilkan.
- Bintang statis atau belum dianimasikan.
- Hindari spinner karena tidak diperlukan.
- Perubahan state tidak boleh menggeser posisi bulan secara drastis.

### Night Scene — Success

- Fase bulan sudah dihitung.
- Bulan memakai visual state yang sesuai.
- Bintang bergerak sesuai motion preference.
- Tidak ada pesan status teknis.

### Night Scene — Empty

Tidak ada empty state tradisional. Jika tanggal tidak tersedia, gunakan bulan default dan pertahankan adegan; jangan tampilkan screen kosong.

### Night Scene — Error

- Tetap tampilkan adegan.
- Ganti bulan dengan visual default.
- Jangan menyalahkan pengguna atau menampilkan error teknis.
- Copy fallback opsional, bukan keharusan.

### Night Scene — Reduced motion

- Bintang statis atau memiliki variasi opacity sangat minimal.
- Tidak ada floating, parallax, zoom, atau twinkle berulang.
- Bulan tetap terlihat dengan halo statis.
- Perubahan fase menggunakan pergantian langsung atau transisi singkat.

### Night Scene — Offline

- Tidak ada offline banner karena fungsi utama tidak membutuhkan koneksi.
- Fase bulan tetap dapat dihitung dari tanggal lokal.
- Jika font eksternal gagal dimuat, gunakan fallback system font.
- Jika aset eksternal gagal dimuat, gunakan CSS fallback.

## 9. Responsive behaviour

### Mobile

Breakpoints:
- Small mobile: sampai 374px.
- Standard mobile: 375–767px.

Aturan:
- Layout satu kolom.
- Padding horizontal 20px.
- Bulan responsif sekitar 180–240px.
- Informasi berada di bawah bulan.
- Hindari elemen penting tertutup browser UI atau safe area.
- Gunakan `min-height: 100svh` sebagai dasar viewport modern.
- Tambahkan safe-area padding untuk perangkat dengan notch.
- Tidak ada horizontal scrolling.
- Pada layar pendek, kurangi jarak vertikal sebelum mengecilkan bulan secara ekstrem.

Prioritas pada tinggi terbatas:
1. Bulan tetap terlihat penuh.
2. Langit tetap terlihat.
3. Informasi sekunder boleh dipindah lebih dekat atau disembunyikan.
4. Foreground dekoratif boleh dihilangkan.

### Tablet

- Bulan diperbesar secara proporsional.
- Komposisi tetap terpusat.
- Spacing diperluas menjadi 32–40px.
- Bintang dapat memiliki distribusi lebih luas.
- Jangan mengubah layout menjadi dua kolom.

### Desktop

- Gunakan centered composition dengan lebar konten terbatas.
- Bulan berukuran 320–440px.
- Pertahankan ruang kosong di sisi kiri dan kanan.
- Bintang dapat mengisi viewport lebih luas.
- Foreground dekoratif tetap sekunder.
- Tidak perlu navigation bar atau panel samping.
- Pada viewport sangat tinggi, pusat visual tetap sekitar tengah.

### Orientation

**Portrait:** komposisi vertikal, bulan di tengah, informasi di bawah.

**Landscape:** bulan tetap fokus. Pada viewport pendek, padatkan layout, dekatkan informasi ke bulan, dan sembunyikan foreground dekoratif bila perlu.

### Browser

Wajib diuji pada Chrome mobile, Safari mobile, Chrome desktop, dan Safari desktop.

Jika fitur dekoratif tidak didukung, gunakan background solid atau gradient sederhana. Fitur inti tidak boleh bergantung pada filter visual atau API browser eksperimental.

## 10. Accessibility

### 10.1 Kontras warna

Target minimum:
- Teks normal: 4.5:1.
- Teks besar: 3:1.
- Komponen non-teks dan focus indicator: 3:1 terhadap background sekitar.

Jangan menggunakan lavender atau rose untuk teks kecil di atas background gelap tanpa pengujian kontras. Teks utama menggunakan `#FFFFFF`; warna sekunder harus diverifikasi pada background aktual. Focus ring menggunakan warna moon terang.

### 10.2 Struktur semantik

- Gunakan satu elemen `main`.
- Gunakan satu heading utama jika ada judul.
- Elemen dekoratif diberi `aria-hidden="true"` jika tidak menyampaikan informasi.
- Informasi fase atau tanggal menggunakan teks semantik.
- Jangan menggunakan heading hanya untuk styling.

### 10.3 Focus order

Jika tidak ada kontrol, tidak ada elemen interaktif yang perlu difokuskan.

Jika `MotionControl` tersedia:
1. Motion control.
2. Kontrol utility lain jika ditambahkan.

Bulan tidak boleh menjadi focusable karena bukan tombol atau link.

### 10.4 Keyboard navigation

- Semua tombol dapat dicapai dengan `Tab`.
- `Enter` dan `Space` mengaktifkan tombol.
- Elemen dekoratif tidak masuk keyboard focus.
- Focus ring selalu terlihat.
- Jangan menghapus outline browser tanpa pengganti yang jelas.

### 10.5 ARIA

**`StarField`:** `aria-hidden="true"`.

**`MoonVisual`:** jika hanya dekorasi, gunakan `aria-hidden="true"`. Jika fase disampaikan sebagai informasi, berikan accessible label yang ringkas. Jangan mengumumkan setiap bintang atau perubahan animasi.

**`MotionControl`:** gunakan `button` dengan accessible name yang menjelaskan aksi, misalnya “Matikan animasi” atau “Nyalakan animasi”.

**`LiveStatus`:** gunakan `aria-live="polite"` hanya ketika fase berubah setelah pergantian tanggal. Jangan mengumumkan perubahan opacity atau gerakan bintang.

### 10.6 Reduced motion

Wajib menghormati `prefers-reduced-motion: reduce`:
- Hilangkan animasi looping.
- Hilangkan parallax.
- Kurangi transisi.
- Pertahankan bentuk visual dan hirarki.
- Jangan mengganti visual dengan spinner.

### 10.7 Non-color information

Fase bulan tidak boleh dibedakan hanya dengan warna. Perbedaan berasal dari bentuk visual bulan.

### 10.8 Touch target

Jika terdapat kontrol:
- Ukuran minimal 44 × 44px.
- Jarak antar kontrol minimal 8px.
- Perhatikan safe area di tepi layar.

### 10.9 Screen reader experience

Pengguna screen reader harus mendapatkan nama atau tujuan halaman dan status visual utama secara singkat bila relevan. Screen reader tidak boleh mendapatkan daftar bintang, pengumuman animasi berulang, atau fokus pada elemen dekoratif.

### 10.10 Fallback tanpa JavaScript

Fallback statis harus memiliki background dengan kontras memadai, menampilkan bulan default, tidak bergantung pada animasi untuk menjelaskan konten, dan tetap nyaman dilihat pada mobile.

## Keputusan desain yang mengikat

1. Produk menggunakan satu screen utama tanpa navigasi.
2. Tidak ada primary CTA pada MVP karena produk adalah pengalaman visual pasif.
3. Font utama menggunakan Manrope karena modern, mudah dibaca, dan tidak terlalu romantis.
4. Palet utama menggunakan navy, violet, lavender, moon cream, dan rose redup.
5. Ilustrasi bulan dibuat kartun dan sederhana, bukan realistis.
6. Animasi bintang lambat dan tidak dominan.
7. Reduced motion wajib dihormati tanpa menghilangkan visual utama.
8. Offline tidak menampilkan banner karena fungsi inti tidak memerlukan koneksi.
9. Error menggunakan visual fallback, bukan pesan teknis.
10. Mobile menjadi prioritas untuk layout, ukuran bulan, spacing, dan pengujian.
