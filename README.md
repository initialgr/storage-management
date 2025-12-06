# 📂 Storage Management

Sebuah aplikasi manajemen penyimpanan file berbasis web (seperti layanan cloud storage) yang dikembangkan menggunakan **Next.js** dan **Appwrite**. Aplikasi ini memungkinkan pengguna untuk mengunggah, mengelola, dan membagikan file sambil memvisualisasikan penggunaan ruang penyimpanan secara real-time.

## 🌐 Live Demo

Aplikasi ini telah di-*deploy* dan dapat diakses publik melalui tautan berikut:

[**Kunjungi Aplikasi Live**](https://storage-management-orcin.vercel.app/)

## ✨ Fitur Utama

* **File Upload & Management:** Unggah, lihat, dan kelola berbagai tipe file (gambar, dokumen, video, dll.).
* **Storage Visualization:** Tampilan dashboard visual (menggunakan Radial Chart) yang menunjukkan persentase ruang penyimpanan yang digunakan (misalnya, 0.11% dari 2GB).
* **File Sharing:** Fungsionalitas untuk membagikan file dengan pengguna lain melalui email.
* **User Authentication:** Otentikasi dan manajemen sesi pengguna yang aman melalui Appwrite.
* **Recent Files:** Daftar file yang baru saja diunggah.

---

## 🛠️ Tech Stack

* **Frontend:** [Next.js](https://nextjs.org/) (React Framework)
* **Backend & Database:** [Appwrite](https://appwrite.io/) (Open-Source Backend Server)
* **Styling:** Tailwind CSS
* **Language:** TypeScript
* **Charting:** Recharts

---

## 🚀 Instalasi dan Menjalankan Proyek

Ikuti langkah-langkah berikut untuk menginstal dan menjalankan proyek ini di lingkungan lokal Anda.

### Prasyarat

Pastikan Anda telah menginstal yang berikut:

* Node.js (v18+)
* npm atau yarn
* Instalasi Appwrite lokal atau akses ke instance Appwrite Cloud.

### Langkah 1: Clone Repositori

```bash
git clone [https://github.com/initialgr/storage-management.git](https://github.com/initialgr/storage-management.git)
cd storage-management
