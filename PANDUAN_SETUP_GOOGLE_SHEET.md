# Panduan Pemasangan Backend Google Apps Script (kode.gs)
## Sistem Laporan Keuangan & Tabungan Harian Kantin
**Pondok Pesantren Miftahul Ulum Kebun Baru**

Panduan ini menjelaskan langkah demi langkah cara menghubungkan sistem web kas dan tabungan harian kantin dengan Google Spreadsheet secara gratis dan real-time menggunakan **Google Apps Script** (`kode.gs`).

---

### Struktur Sheet Google Spreadsheet:
1. **`Kas_Operasional_Kantin`**: Mencatat perputaran kas operasional kantin (Tanggal, Kategori, Keterangan, Uang Masuk, Uang Keluar, Saldo Kas).
2. **`Tabungan_Harian_Kantin`**: Mencatat penyisihan laba/dana cadangan tabungan harian kantin (Tanggal, Jenis Tabungan, Keterangan/Keperluan, Setor Tabungan +, Tarik Tabungan -, Saldo Akumulasi Tabungan).

---

### Langkah 1: Buat Google Spreadsheet Baru
1. Buka browser dan kunjungi [https://sheets.new](https://sheets.new) (pastikan sudah login akun Google).
2. Beri nama file Spreadsheet di pojok kiri atas, contohnya:  
   `Laporan Keuangan & Tabungan Kantin PP Miftahul Ulum Kebun Baru`.

---

### Langkah 2: Buka Apps Script Editor
1. Pada menu navigasi atas Google Sheets, klik menu **Ekstensi (Extensions)** > **Apps Script**.
2. Jendela editor Google Apps Script akan terbuka.

---

### Langkah 3: Tempel Kode `kode.gs`
1. Hapus seluruh baris kode bawaan di editor.
2. Buka berkas [`kode.gs`](file:///home/moh-lutfi/project-html/kode.gs) di proyek ini, salin seluruh isinya, dan tempelkan ke editor.
3. Klik ikon disket **Simpan (Save Project)** atau tekan `Ctrl + S`.

---

### Langkah 4: Jalankan Inisialisasi Otomatis (Setup Spreadsheet)
1. Di bilah menu atas editor, pilih fungsi **`setupSpreadsheet`**.
2. Klik tombol **Jalankan (Run)**.
3. Berikan otorisasi akses (klik *Review permissions* > pilih akun Google > *Advanced / Lanjutan* > *Go to ... (unsafe)* > *Allow*).
4. Sheet `Kas_Operasional_Kantin` dan `Tabungan_Harian_Kantin` akan otomatis terbentuk dengan header yang rapi.

---

### Langkah 5: Deploy Sebagai Web App
1. Di pojok kanan atas editor Apps Script, klik tombol biru **Deploy (Terapkan)** > **New deployment (Penerapan baru)**.
2. Klik ikon gerigi ⚙️ di samping *Select type*, pilih **Web app**.
3. Isi konfigurasi:
   - **Description**: `Versi 2.0 Tabungan Harian Kantin`
   - **Execute as**: `Me (email_anda@gmail.com)` *(Wajib)*
   - **Who has access**: `Anyone` *(Wajib agar form web bisa menyimpan data)*
4. Klik tombol **Deploy**.
5. Salin URL Web App yang berakhiran `/exec`.

---

### Langkah 6: Hubungkan ke Aplikasi Web
1. Buka berkas [**`kantin_pesantren.html`**](file:///home/moh-lutfi/project-html/kantin_pesantren.html) di browser.
2. Masuk ke tab **⚙️ Pengaturan & Sheets**.
3. Tempel URL Web App ke kolom yang tersedia, lalu klik **💾 Simpan URL**.
4. Klik **🔌 Tes Koneksi** dan klik **☁️ Sinkronkan Data Lokal ke Google Sheet**.
