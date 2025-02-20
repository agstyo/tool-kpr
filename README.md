# tool-kpr
KPR Website for public

[Demo Page](https://tool-kpr.vercel.app/)


## HTML
- Mengganti input tunggal untuk pelunasan sebagian dengan elemen dinamis:
  - `<div id="partialPayments">` berisi daftar pelunasan sebagian.
  - Tombol **"Tambah Pelunasan Sebagian"** untuk menambah entri baru.
- Setiap entri pelunasan memiliki:
  - **Bulan Pelunasan Sebagian** (input number).
  - **Jumlah Pelunasan Sebagian** (input number).
  - **Setelah Pelunasan Sebagian** (dropdown: Tetap Tenor atau Kurangi Tenor).
  - Tombol **"Hapus"** untuk menghapus entri tertentu.

## CSS
- Menambahkan gaya untuk `.partial-payment` (kotak berbatas untuk setiap entri pelunasan).
- Menambahkan gaya untuk `.remove-btn` (tombol hapus berwarna merah).

## JavaScript
- **Fungsi `addPartialPayment()`**: 
  - Menambahkan elemen input baru untuk pelunasan sebagian ke dalam `#partialList`.
- **Fungsi `getPartialPayments()`**: 
  - Mengambil semua data pelunasan dari elemen `.partial-payment` dan mengembalikan array berisi objek `{ month, amount, option }`.
  - Array diurutkan berdasarkan bulan.
- **Fungsi `generateAmortizationTable()`**:
  - Diperbarui untuk menerima array `partialPayments`.
  - Memeriksa setiap bulan apakah ada pelunasan sebagian menggunakan `partialPayments.find()`.
  - Menyesuaikan `remainingPrincipal`, `newMonthlyPayment`, dan `remainingMonths` untuk setiap pelunasan.
  - Mengembalikan `{ table, totalPaid }` untuk menghitung total pembayaran dan bunga.
- **Fungsi `calculate()`**:
  - Mengambil array `partialPayments` dan menggunakannya untuk menghitung tabel dan hasil.
  - Menampilkan daftar pelunasan sebagian di ringkasan hasil.
- **Fungsi `resetForm()`**:
  - Mengosongkan `#partialList` agar daftar pelunasan kembali kosong.

## Cara Menggunakan
1. Masukkan data pinjaman seperti biasa (jumlah pinjaman, tenor, suku bunga).
2. Klik **"Tambah Pelunasan Sebagian"** untuk menambah entri pelunasan:
   - Misal: Bulan 12, Jumlah 30 juta, Opsi "Tetap Tenor".
   - Klik lagi untuk menambah: Bulan 24, Jumlah 30 juta, Opsi "Tetap Tenor".
   - Klik lagi untuk menambah: Bulan 60, Jumlah 20 juta, Opsi "Kurangi Tenor".
3. Klik **"Hitung"** untuk melihat hasil dan tabel amortisasi.
4. Klik **"Lihat Tabel Amortization"** untuk melihat detail per bulan, termasuk efek pelunasan sebagian.
5. Klik **"Hapus"** pada entri pelunasan tertentu jika ingin menghapusnya.

## Contoh
- **Pinjaman**: Rp 500.000.000
- **Tenor**: 10 tahun (120 bulan)
- **Suku Bunga Fixed**: 10%
- **Pelunasan Sebagian**:
  - Bulan 12: Rp 30.000.000 (Tetap Tenor)
  - Bulan 24: Rp 30.000.000 (Tetap Tenor)
  - Bulan 60: Rp 20.000.000 (Kurangi Tenor)
- **Hasil**: 
  - Tabel akan menunjukkan pengurangan pokok di bulan 12, 24, dan 60, dengan angsuran menurun setelah bulan 12 dan 24, serta tenor berkurang setelah bulan 60.

## Catatan
- Input pelunasan bersifat **opsional**; jika tidak diisi, kalkulator akan berjalan seperti biasa tanpa pelunasan.
- Total bunga dan pembayaran dihitung berdasarkan akumulasi angsuran aktual setelah semua pelunasan.