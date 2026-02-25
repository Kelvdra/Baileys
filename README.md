# WhatsApp API dengan @kelvdra/baileys

Repositori ini berisi contoh implementasi dasar untuk terhubung ke WhatsApp menggunakan pustaka `@kelvdra/baileys`, sebuah *wrapper* canggih yang dibangun di atas Baileys. [1] Pustaka ini memungkinkan otomasi, pembuatan chatbot, dan integrasi dengan proyek Node.js apa pun. [1]

## Fitur Utama

*   **Koneksi Multi-Device**: Berjalan sebagai klien WhatsApp Web sekunder, memungkinkan Anda tetap menggunakan WhatsApp di ponsel Anda. [1]
*   **Manajemen Sesi**: Menyimpan dan memulihkan sesi untuk menghindari pemindaian QR Code berulang kali. [1]
*   **Penanganan Event**: Dilengkapi dengan sistem event untuk memantau berbagai aktivitas seperti pembaruan koneksi, kredensial, dan riwayat pesan. [1]
*   **Stabil dan Ringan**: Berinteraksi langsung menggunakan WebSocket tanpa memerlukan Selenium atau peramban lainnya, sehingga menghemat sumber daya. [4]

## 1. Instalasi

Untuk memulai, instal paket `@kelvdra/baileys` menggunakan npm atau yarn.

**Versi Stabil (Direkomendasikan)**
```bash
npm install @kelvdra/baileys
```

**Versi Edge (Fitur Terbaru)**
```bash
npm install @kelvdra/baileys@latest
```

## 2. Penggunaan Dasar

Berikut adalah contoh kode untuk membuat koneksi dasar, menangani sesi, dan memproses event penting seperti riwayat obrolan.

### a. Inisialisasi dan Konfigurasi Koneksi

Kode ini akan menginisialisasi koneksi, menangani penyimpanan sesi, dan mencetak QR Code di terminal jika diperlukan.

```javascript
import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestWaWebVersion
} from '@kelvdra/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';

// Fungsi utama untuk menjalankan bot
async function connectToWhatsApp() {
    // Menggunakan MultiFileAuthState untuk menyimpan sesi di folder 'auth_info_baileys'
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    // Mengambil versi WhatsApp Web terbaru
    const { version, isLatest } = await fetchLatestWaWebVersion();
    console.log(`Menggunakan WA v${version.join('.')}, Versi Terbaru: ${isLatest}`);

    // Membuat socket dengan konfigurasi
    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }), // Gunakan 'debug' untuk melihat log lengkap
        printQRInTerminal: true,
        auth: state,
        browser: ['Ubuntu', 'Chrome', '20.0.0'], // Contoh browser
    });

    // Menangani event pada koneksi
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Koneksi terputus karena:', lastDisconnect.error, ', menyambungkan kembali:', shouldReconnect);
            // Menyambungkan kembali jika bukan karena logout
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('Koneksi berhasil tersambung!');
        }
    });

    // Menyimpan kredensial setiap kali ada pembaruan
    sock.ev.on('creds.update', saveCreds);

    // Menangani event riwayat pesan dan grup
    sock.ev.on('messaging-history.set', (history) => {
        const { chats, messages, contacts } = history;
        console.log(`Menerima ${chats.length} chat, ${messages.length} pesan, ${contacts.length} kontak.`);
        // Di sini Anda bisa memproses riwayat chat, misalnya menyimpannya ke database
    });

    // Menangani event pembaruan grup
    sock.ev.on('groups.update', (updates) => {
        console.log('Menerima pembaruan grup:', JSON.stringify(updates, null, 2));
        // Contoh: Anda bisa melacak anggota baru, perubahan judul grup, dll.
    });
}

// Menjalankan fungsi koneksi
connectToWhatsApp();
```

### b. Penjelasan Kode

*   **`useMultiFileAuthState`**: Fungsi ini sangat penting untuk menyimpan kredensial (session). [1] Dengan menyimpannya, Anda tidak perlu memindai QR code setiap kali aplikasi dijalankan. Kredensial akan disimpan dalam folder `auth_info_baileys`.
*   **`makeWASocket`**: Ini adalah fungsi utama untuk membuat instance klien WhatsApp. [1]
    *   `version`: Menggunakan versi WhatsApp Web terbaru untuk kompatibilitas maksimal. [7]
    *   `logger`: Menggunakan `pino` untuk logging. Diatur ke `'silent'` agar tidak menampilkan banyak log di konsol. [7]
    *   `printQRInTerminal`: Akan menampilkan QR code langsung di terminal Anda. [1]
    *   `auth`: Menyertakan status otentikasi yang dimuat dari `useMultiFileAuthState`. [7]
*   **`sock.ev.on('connection.update', ...)`**: Event listener ini memantau status koneksi. [5] Jika koneksi terputus (`'close'`) karena alasan selain logout (misalnya, masalah jaringan), ia akan mencoba menyambung kembali. [5]
*   **`sock.ev.on('creds.update', saveCreds)`**: Setiap kali sesi diperbarui (misalnya setelah koneksi berhasil), event ini akan terpicu untuk menyimpan kredensial baru. [5]
*   **`sock.ev.on('messaging-history.set', ...)`**: Event ini terpicu saat menerima riwayat pesan saat pertama kali terhubung. Ini berguna untuk sinkronisasi awal.
*   **`sock.ev.on('groups.update', ...)`**: Berguna untuk melacak perubahan dalam grup yang Anda ikuti, seperti pembaruan metadata atau keanggotaan.

## 3. Kontak & Dukungan

Untuk pertanyaan lebih lanjut, diskusi, atau jika Anda menemukan bug, silakan bergabung dengan channel Telegram kami.

- **Telegram**: [MASUKKAN LINK CHANNEL TELEGRAM ANDA DI SINI]

---
**Penafian**: Proyek ini tidak berafiliasi, berasosiasi, atau didukung secara resmi oleh WhatsApp atau anak perusahaannya. Gunakan dengan risiko Anda sendiri dan patuhi Ketentuan Layanan WhatsApp. [4]
