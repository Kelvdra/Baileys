# AIRich — `@kelvdra/baileys`

`AIRich` adalah *message builder* untuk mengirim **AI Rich Response** (pesan kaya ala jawaban Meta AI) lewat Baileys: teks markdown, blok kode, tabel, gambar, video, peta, sumber referensi, kartu produk, post/reels, widget, sampai tombol saran, semuanya dalam **satu pesan**.

> Panduan ini disusun dari source `@kelvdra/baileys` (`lib/MessageBuilder/index.js`, `lib/Socket/hydra.js`, `lib/Socket/messages-send.js`). Semua method dan opsi di bawah memang ada di kode.

## Daftar Isi

- [Persiapan](#persiapan)
- [Tiga cara mengirim](#tiga-cara-mengirim)
- [Versi lengkap pengiriman](#versi-lengkap-pengiriman)
- [Referensi method](#referensi-method)
- [Format teks: link, sitasi, LaTeX](#format-teks-link-sitasi-latex)
- [Media: URL, Buffer, dan path file](#media-url-buffer-dan-path-file)
- [Bentuk data tiap item](#bentuk-data-tiap-item)
- [Mengatur urutan dengan `id`, `replace`, `insertAt`](#mengatur-urutan-dengan-id-replace-insertat)
- [Mengedit pesan yang sudah terkirim](#mengedit-pesan-yang-sudah-terkirim)
- [Opsi `send()` / `build()`](#opsi-send--build)
- [Contoh lengkap](#contoh-lengkap)
- [Error yang mungkin muncul](#error-yang-mungkin-muncul)
- [Catatan & troubleshooting](#catatan--troubleshooting)

---

## Persiapan

Persyaratan: Node.js 20+ dan project **ESM** (`"type": "module"`).

```bash
npm install @kelvdra/baileys pino qrcode-terminal

# opsional, dipakai fitur media AIRich
npm install sharp           # resize gambar (thumbnail video, dll.)
npm install fluent-ffmpeg   # thumbnail video otomatis (butuh ffmpeg terpasang di sistem)
```

Import:

```js
import makeWASocket, { AIRich, MB } from '@kelvdra/baileys'

// MB.AIRich === AIRich, jadi dua-duanya boleh dipakai
```

Semua contoh di bawah mengasumsikan `sock` adalah socket yang sudah tersambung (lihat Quick Start di README utama) dan `jid` adalah chat tujuan.

---

## Tiga cara mengirim

### 1) Shorthand lewat `sendMessage` (paling cepat)

Cukup isi key `aiRich` (atau `AIRich`) di konten pesan.

```js
await sock.sendMessage(jid, {
  aiRich: {
    text: 'Halo! Ini **AIRich** dari Kelvdra Baileys.',
    code: { language: 'javascript', content: 'console.log("halo")' },
    table: [
      ['Fitur', 'Status'],
      ['Teks', 'Siap'],
      ['Tabel', 'Siap']
    ],
    suggest: ['Tampilkan contoh lain', 'Terima kasih']
  }
}, { quoted: m })
```

Key shorthand yang dikenali (urutan di bawah = urutan tampil di pesan, bukan urutan penulisan objekmu):

| Key | Dipetakan ke | Isi |
|---|---|---|
| `text` | `addText` | string |
| `code` | `addCode` | `{ language, content }` atau array-nya (boleh juga `code` sebagai ganti `content`) |
| `table` | `addTable` | `string[][]` |
| `image` / `images` | `addImage` | string URL, `Buffer`, atau array-nya |
| `video` | `addVideo` | string/`Buffer`, objek `{ url, ... }`, tuple `[url, opsi]`, atau array |
| `map` | `addMap` | array tempat `{ latitude, longitude, ... }` |
| `source` / `sources` | `addSource` | array sumber |
| `product` | `addProduct` | objek atau array objek |
| `post` | `addPost` | objek atau array objek |
| `reels` | `addReels` | objek atau array objek |
| `metadata` | `addMetadata` | string |
| `tip` | `addTip` | string |
| `suggest` | `addSuggest` | string atau array string |
| `footerAction` | `addFooterAction` | objek atau array objek |
| `widget` | `addWidget` | objek atau array objek |

Key lain di dalam `aiRich` diteruskan sebagai **opsi kirim** (lihat [Opsi send()](#opsi-send--build)), misalnya `aiRich: { text: '...', notification: true }`.

Keterbatasan shorthand: tiap key hanya muncul **sekali** dan urutannya tetap. Kalau perlu dua teks yang diselingi gambar, atau butuh `id`/`replace`/`insertAt`, pakai builder (cara 2 atau 3).

Kamu juga boleh memberi instance builder langsung:

```js
await sock.sendMessage(jid, { aiRich: ai, options: { notification: true } }, { quoted: m })
```

### 2) `sock.sendAIRich`

```js
// a) dengan callback, builder dibuatkan otomatis
await sock.sendAIRich(jid, (ai) => {
  ai.addText('Halo dari **callback**')
    .addTip('Ini tips kecil')
}, { quoted: m })

// b) dengan instance yang sudah kamu siapkan
const ai = new AIRich(sock)
ai.addText('Halo')
await sock.sendAIRich(jid, ai, { quoted: m })
```

> Argumen objek polos (`sendAIRich(jid, { ... })`) **bukan** shorthand. Objek itu dianggap pesan yang sudah ada dan dibaca lewat `loadFrom()` (butuh `richResponseMessage` di dalamnya). Untuk shorthand pakai `sendMessage(jid, { aiRich: {...} })`.

### 3) Builder manual (paling fleksibel)

```js
const ai = new AIRich(sock)

ai.setTitle('Laporan Singkat')
  .addText('Ringkasan hari ini dengan **teks tebal** dan [link](https://example.com).')
  .addTable([
    ['Hari', 'Pesan'],
    ['Senin', '120'],
    ['Selasa', '98']
  ])
  .addCode('js', 'const total = 120 + 98')
  .addSuggest(['Minggu lalu?', 'Export data'])

const msg = await ai.send(jid, { quoted: m })
console.log(msg.key.id)
```

Semua method `add*` mengembalikan `this`, jadi bisa dirantai. `send()` mengembalikan pesan yang dikirim (ada `msg.key`).

---

## Versi lengkap pengiriman

Bagian ini berisi contoh siap pakai untuk tiap cara kirim, dengan semua key dan opsi yang didukung.

### A) `sendMessage` shorthand: semua key sekaligus

Isi konten pesan **hanya** dengan key `aiRich` supaya tidak bentrok dengan jenis pesan lain.

```js
import { readFile } from 'node:fs/promises'

const hasil = await sock.sendMessage(jid, {
  aiRich: {
    // ===== Konten (urutan tampil mengikuti tabel shorthand, bukan urutan tulis) =====
    text: '## Judul\nTeks dengan **tebal**, [link](https://example.com), dan sitasi[](https://example.com/ref).',

    code: [
      { language: 'javascript', content: 'console.log("halo")' },
      { language: 'python', code: 'print("halo")' }          // `code` juga diterima sebagai ganti `content`
    ],

    table: [
      ['Nama', 'Nilai'],
      ['A', '10'],
      ['B', '20']
    ],

    image: await readFile('./foto.jpg'),                       // string URL, Buffer, atau array
    // images: ['https://example.com/1.png', 'https://example.com/2.png'],

    video: { url: 'https://example.com/klip.mp4', autoFill: true },
    // video: 'https://example.com/klip.mp4'
    // video: ['https://example.com/klip.mp4', { autoFill: false, duration: 10 }]   // tuple [url, opsi]

    map: [
      { latitude: -6.5944, longitude: 106.7892, title: 'Bogor', body: 'Kota Hujan' }
    ],

    source: [
      ['https://example.com/fav.png', 'https://example.com', 'Example', 'example.com']
    ],

    product: {
      title: 'Kopi Arabika 250g', brand: 'Kebun Kita',
      price: 'Rp95.000', sale_price: 'Rp79.000',
      url: 'https://example.com/produk/kopi',
      image: 'https://example.com/kopi.jpg'
    },

    post: {
      username: 'kelvdra', title: 'Judul post', caption: 'Caption',
      thumbnail: 'https://example.com/thumb.jpg', url: 'https://instagram.com/p/xxxx',
      like: 1200, comment: 30, share: 5, verified: true
    },

    reels: [{
      username: 'kelvdra', title: 'Judul reels',
      videoUrl: 'https://instagram.com/reel/xxxx',
      thumbnail: 'https://example.com/thumb.jpg',
      like: 1000, share: 20, view: 50000
    }],

    metadata: 'Teks kecil/redup',
    tip: 'Tips singkat',
    widget: { title: 'Jadwal', sections: [], actions: [] },
    footerAction: { text: 'Buka detail', url: 'https://example.com' },
    suggest: ['Lagi dong', 'Selesai'],

    // ===== Opsi kirim (key lain di dalam aiRich diteruskan ke send) =====
    notification: false,
    disclaimerText: '',
    forwarded: true,
    forwardWrapper: true,
    bypassDownload: true,
    verification: 'auto'
  }
}, { quoted: m })          // argumen ke-3: membalas pesan

console.log('Terkirim, id:', hasil.key.id)
```

Catatan shorthand:
- `quoted` diambil dari argumen ke-3 `sendMessage`.
- Shorthand tidak punya `setTitle`, `setFooter`, `setContextInfo`, `id`, `replace`, atau `insertAt`. Untuk itu pakai builder.
- Jika `aiRich` berisi instance `AIRich`, opsi kirim diambil dari `options` di sebelahnya:

```js
await sock.sendMessage(jid, { aiRich: ai, options: { notification: true } }, { quoted: m })
```

### B) `sendAIRich`: semua bentuk argumen

```js
// 1. Callback (boleh async), builder dibuat otomatis
const pengirim = m.key.participant || m.key.remoteJid
await sock.sendAIRich(jid, async (ai) => {
  ai.setTitle('Judul')
    .setFooter('Footer')
    .setContextInfo({ mentionedJid: [pengirim] })     // pengirim = m.key.participant || m.key.remoteJid
    .addText(`Halo @${pengirim.split('@')[0]}`, { id: 'sapa' })
    .addImage(await readFile('./foto.jpg'))
    .addSuggest(['Oke', 'Batal'])
}, {
  quoted: m,
  notification: true,
  disclaimerText: 'Dibuat otomatis'
})

// 2. Instance yang sudah disiapkan (bisa dipakai ulang, diedit, dan dikirim lagi)
const ai = new AIRich(sock)
ai.addText('Halo')
const sent = await sock.sendAIRich(jid, ai, { quoted: m })

// 3. Objek pesan yang sudah ada (diteruskan lewat loadFrom)
await sock.sendAIRich(jid, pesanRichResponseYangAda)
```

`sendAIRich` mengembalikan pesan yang dikirim (ada `key`), sama seperti `ai.send()`.

### C) Builder manual: kirim ke semua jenis chat

```js
import { AIRich } from '@kelvdra/baileys'

const ai = new AIRich(sock, {
  dynamic: true,               // response id baru tiap build
  unsupportedTypeAlert: true   // teks cadangan untuk klien yang tak bisa render
})

ai.setTitle('Laporan')
  .setFooter('Sumber: sistem internal')
  .setContextInfo({ mentionedJid: ['6281234567890@s.whatsapp.net'] })
  .addText('Halo @6281234567890', { id: 'sapa' })
  .addTable([['A', 'B'], ['1', '2']], { id: 'tabel' })
  .addSuggest(['Lanjut', 'Stop'])

const opsi = {
  quoted: m,                     // balas pesan
  notification: true,
  disclaimerText: 'Dibuat otomatis',
  forwarded: true,
  forwardWrapper: true,
  bypassDownload: true,
  verification: 'auto',
  messageId: undefined,          // isi jika mau ID sendiri
  additionalNodes: []
}

// Chat pribadi
await ai.send('6281234567890@s.whatsapp.net', opsi)

// Grup
await ai.send('1203630xxxxxxxx@g.us', opsi)

// Balas di chat tempat pesan masuk
await ai.send(m.key.remoteJid, opsi)
```

Catatan: `setContextInfo` hanya mengisi `contextInfo` pesan. Apakah mention tampil sebagai tag di klien belum saya uji, jadi coba dulu di chat tes.

Gunakan `build()` bila kamu hanya ingin objek pesannya tanpa mengirim:

```js
const built = await ai.build(jid, { quoted: m })
// built.key.id, built.message, built.aiVerification ('omitted' | 'placeholder' | 'preserved')
await sock.relayMessage(built.key.remoteJid, built.message, { messageId: built.key.id })
```

Dengan `build()` + `relayMessage` manual, edit lanjutan otomatis (`bypassDownload`) **tidak** ikut berjalan karena itu bagian dari `send()`.

### D) Helper siap pakai dengan error handling

```js
import { AIRich, AIRichError } from '@kelvdra/baileys'

export async function kirimRich(sock, jid, isi, m) {
  try {
    const ai = new AIRich(sock)
    await isi(ai)                       // isi dengan ai.addX(...)
    return await ai.send(jid, { quoted: m })
  } catch (e) {
    if (e instanceof AIRichError) {
      console.error('AIRich error:', e.code, e.message)
    } else {
      console.error('Gagal kirim:', e)
    }
    // kirim cadangan teks biasa agar user tetap dapat balasan
    return sock.sendMessage(jid, { text: 'Maaf, gagal menampilkan pesan.' }, { quoted: m })
  }
}

// pemakaian
await kirimRich(sock, m.key.remoteJid, (ai) => {
  ai.addText('Halo!').addSuggest(['Oke'])
}, m)
```

---

## Referensi method

### Konstruktor

```js
new AIRich(client, { dynamic = true, unsupportedTypeAlert = true })
```

- `client`: pakai `sock`. Wajib; tanpa itu muncul error `Socket is required`.
- `dynamic`: kalau `true`, `responseId` dan `botResponseId` dibuat baru setiap `build()`.
- `unsupportedTypeAlert`: kalau `true`, item non-teks (sumber, produk, post, widget, dst.) dibekali teks cadangan `[ UNSUPPORTED_TYPE - ... ]` untuk klien yang tidak bisa merendernya. Set `false` untuk menghilangkannya.

### Konten

| Method | Fungsi |
|---|---|
| `addText(text, opsi)` | Teks markdown, mendukung link/sitasi/LaTeX (lihat [Format teks](#format-teks-link-sitasi-latex)). Opsi: `hyperlink`, `citation`, `latex`, `deeplink` (default semua `true`). |
| `addFOAText(text, opsi)` | Teks polos (`FOATextPrimitive`), tanpa pemrosesan link/sitasi. |
| `addCode(language, code, opsi)` | Blok kode dengan syntax highlight dari tokenizer bawaan. |
| `addTable(rows, opsi)` | Tabel dari `string[][]`. Baris pertama jadi header. Semua sel **harus string**. Sel mendukung link/sitasi/LaTeX. |
| `addMap(places, opsi)` | Peta dengan penanda. |
| `addSource(sources, opsi)` | Daftar sumber/referensi. |
| `addImage(img, opsi)` | Satu/banyak gambar. |
| `addVideo(video, opsi)` | Satu/banyak video. |
| `addReels(items, opsi)` | Kartu reels (scroll horizontal). |
| `addProduct(data, opsi)` | Kartu produk. Array jadi scroll horizontal. |
| `addPost(data, opsi)` | Kartu post sosial media. Array jadi carousel. |
| `addMetadata(text, opsi)` | Teks kecil/redup (metadata). |
| `addTip(text, opsi)` | Seperti metadata, diawali `ⓘ`. |
| `addWidget(data, opsi)` | Widget pihak ketiga (daftar acara/kalender + tombol aksi). |
| `addFooterAction(data, opsi)` | Tombol aksi di footer. |
| `addSuggest(teks, opsi)` | Pil saran lanjutan. String tunggal atau array. |

### Tingkat lanjut

| Method | Fungsi |
|---|---|
| `addSection(section, { text, submessage, ...opsi })` | Menambah section mentah. Beri `text` sebagai teks cadangan. Tanpa itu `submessages` jadi kosong. |
| `addSubmessage(submessage, opsi)` | Menambah submessage mentah. |
| `addFooterSection(section)` / `clearFooterSections()` | Section di area footer. |
| `addEmbeddedScreen(screen)` | Layar tertanam (dipakai `sendHTML` mode `screen`). |
| `setResponseMeta(obj)` | Gabungkan properti ekstra ke JSON unified response. |
| `setResponseId(id)` / `refreshResponseId()` | Atur / acak `response_id`. |
| `setBotResponseId(id)` / `refreshBotResponseId()` | Atur / acak `botResponseId`. |
| `setBotMetadata(obj)` | Gabungkan properti ekstra ke `botMetadata`. |
| `loadFrom(msg)` | Muat dari pesan `richResponseMessage` yang sudah ada (juga yang dibungkus `botForwardedMessage`). |
| `AIRich.newLayout(nama, data, extra)` | Membuat section dengan layout tertentu. Layout: `Single`, `Grid`, `HScroll`, `VStack`, `ActionRow`, `AddonAction`, `FlexibleCountGrid`, `RichListItem`, `MultipleResponse`, `IGSuggestedBloomCard`. |

### Pengaturan pesan (dari `BaseBuilder`)

| Method | Efek di AIRich |
|---|---|
| `setTitle(str)` | Menjadi `messageDisclaimerText` di `botMetadata`. |
| `setFooter(str)` | Menambah baris teks metadata di **akhir** pesan. |
| `setContextInfo(obj)` | Digabung ke `contextInfo` pesan (mention, dll.). |
| `addPayload(obj)` | Menambah properti ke payload pesan. |

`setSubtitle` dan `setBody` ada di kelas dasar, tetapi **tidak dipakai** oleh `AIRich`.

### Inspeksi & pengelolaan item

`hasId(id)`, `getIds()`, `peek(id)`, `assignId(index, id)`, `delete(target)`, serta getter `ai.sections` dan `ai.items`.

---

## Format teks: link, sitasi, LaTeX

`addText` dan sel `addTable` membaca sintaks berikut:

| Sintaks | Hasil |
|---|---|
| `[teks](https://url)` | Link tepercaya |
| `[teks](!https://url)` | Link **tidak** tepercaya (awalan `!`) |
| `[teks](>deeplink)` | Deeplink (awalan `>`) |
| `[](https://sumber)` | Sitasi bernomor `1, 2, 3...` otomatis (teks dikosongkan) |
| `[x^2 + y^2]<https://url-gambar-rumus>` | LaTeX: ekspresi di dalam `[...]`, URL gambar rumus di dalam `<...>` |
| `[x^2\|lebar\|tinggi\|font_height\|padding]<https://url-gambar-rumus>` | LaTeX dengan ukuran kustom |

Catatan LaTeX: sintaks ini memakai kurung sudut `<url>` setelah `]`, bukan kurung biasa (kurung biasa itu link). Bagian `lebar|tinggi|font_height|padding` opsional, dan `url` harus mengarah ke gambar rumus yang sudah kamu siapkan sendiri. Library tidak merender LaTeX jadi gambar.

Contoh:

```js
ai.addText(
  'Baca [dokumentasi](https://example.com/docs). ' +
  'Fakta ini punya sumber[](https://example.com/sumber-1) dan ini [link tidak tepercaya](!https://example.com).'
)
```

Untuk menulis kurung siku literal, escape dengan backslash: `\[bukan link\]`.

Matikan pemrosesan per pemanggilan jika tidak diinginkan:

```js
ai.addText('[tetap teks biasa](https://x.com)', { hyperlink: false })
```

---

## Media: URL, Buffer, dan path file

Aturan resolusi media (`Toolkit.resolveMedia`):

| Input | Perlakuan |
|---|---|
| String `http(s)://...` | Dipakai **apa adanya** (tidak diupload). Beri `resolveUrl: true` di `addImage` agar diunduh lalu diupload ulang. |
| `Buffer` | **Diupload otomatis** (lewat MMG/`getMmgUrl` bila tersedia, atau `waUploadToServer`). |
| String non-URL | Dianggap **base64**, *bukan* path file. |

Jadi untuk file lokal, baca dulu jadi Buffer:

```js
import { readFile } from 'node:fs/promises'

ai.addImage(await readFile('./foto.jpg'))
ai.addVideo(await readFile('./klip.mp4'))
```

Unggahan konten yang sama di-cache (lihat bagian Anti-Delay Upload di `docs/README_fitur_tambahan.md`).

---

## Bentuk data tiap item

### `addImage(img, opsi)`

```js
ai.addImage('https://example.com/a.png')
ai.addImage([bufferA, 'https://example.com/b.png'])   // beberapa gambar, satu section per gambar

ai.addImage(buffer, { width: 1024, height: 768, status: 'READY', update_text: 'Selesai' })
```

Opsi: `width`, `height`, `status` (default `'READY'`), `update_text`, `resolveUrl`. Jika memakai `id` pada array gambar akan error karena satu `id` hanya untuk satu section.

### `addVideo(video, opsi)`

```js
ai.addVideo('https://example.com/klip.mp4')

ai.addVideo({
  url: 'https://example.com/klip.mp4',
  mime_type: 'video/mp4',
  duration: 12,            // detik, opsional
  file_length: 1048576,    // byte, opsional
  thumbnail: bufferAtauUrl // opsional
})

ai.addVideo(buffer, { autoFill: true, status: 'READY', estimatedTime: 5000 })
```

Dengan `autoFill: true` (default) video diunduh untuk menghitung ukuran, durasi, dan thumbnail acak. Thumbnail butuh `ffmpeg`; jika gagal, thumbnail dikosongkan tanpa error. Set `autoFill: false` jika kamu mengisi `duration`/`file_length`/`thumbnail` sendiri.

### `addMap(places, opsi)`

```js
ai.addMap([
  { latitude: -6.5944, longitude: 106.7892, title: 'Bogor', body: 'Kota Hujan' },
  { latitude: -6.2088, longitude: 106.8456, name: 'Jakarta', address: 'DKI Jakarta' }
], { showInfoList: true })
```

Per tempat: `latitude`, `longitude` (wajib, numerik), `title`/`name`, `body`/`description`/`address`, `id`, `imageUrl`, `itemType` (default `PLACE`).
Opsi: `center` (`{ latitude, longitude }`, default titik tengah), `latitudeDelta`/`longitudeDelta` (default `0.05`), `showInfoList`, `motivation`, `staticMapUrl`, `staticMapDarkUrl`.
Minimal satu tempat, kalau tidak melempar `TypeError`.

### `addSource(sources)`

```js
// bentuk objek
ai.addSource([
  { favicon: 'https://example.com/fav.png', url: 'https://example.com', title: 'Example', subtitle: 'example.com' }
])

// bentuk array [icon, url, title, subtitle]
ai.addSource([
  ['https://example.com/fav.png', 'https://example.com', 'Example', 'example.com'],
  ['https://other.com/fav.png', 'https://other.com', 'Other', 'other.com']
])

// array string = SATU sumber [icon, url, title, subtitle]
ai.addSource(['https://example.com/fav.png', 'https://example.com', 'Example', 'example.com'])
```

### `addProduct(data)`

```js
ai.addProduct({
  title: 'Kopi Arabika 250g',
  brand: 'Kebun Kita',
  price: 'Rp95.000',
  sale_price: 'Rp79.000',
  url: 'https://example.com/produk/kopi',
  image: 'https://example.com/kopi.jpg',
  icon: 'https://example.com/logo.png'
})

ai.addProduct([produkA, produkB])   // array = scroll horizontal
```

### `addPost(data)`

```js
ai.addPost({
  title: 'Judul post',
  username: 'kelvdra',
  profile: 'https://example.com/avatar.jpg',
  thumbnail: 'https://example.com/thumb.jpg',
  caption: 'Caption post',
  like: 1200, comment: 30, share: 5,
  url: 'https://instagram.com/p/xxxx',
  source: 'INSTAGRAM',          // default INSTAGRAM
  orientation: 'LANDSCAPE',     // default LANDSCAPE
  post_type: 'VIDEO',           // default VIDEO
  verified: true
})
```

Alias yang diterima: `profile_picture_url`/`profile_url`/`profile`, `thumbnail_url`/`thumbnail`, `post_caption`/`caption`, `likes_count`/`like`, `comments_count`/`comment`, `shares_count`/`share`, `post_url`/`url`, `post_deeplink`/`deeplink`, `footer_label`/`footer`, `footer_icon`/`icon`, `is_verified`/`verified`.

### `addReels(items)`

```js
ai.addReels([{
  username: 'kelvdra',
  title: 'Judul reels',
  videoUrl: 'https://instagram.com/reel/xxxx',
  thumbnail: 'https://example.com/thumb.jpg',
  profile: 'https://example.com/avatar.jpg',
  like: 1000, share: 20, view: 50000,
  source: 'IG',
  verified: true
}])
```

### `addSuggest(teks, opsi)`

```js
ai.addSuggest('Satu saran')                         // layout Single
ai.addSuggest(['Saran 1', 'Saran 2', 'Saran 3'])    // scroll horizontal
ai.addSuggest(['A', 'B'], { scroll: false })        // baris aksi (ActionRow)
```

### `addFooterAction(data)`

```js
ai.addFooterAction({ text: 'Buka detail', type: 'OPEN_FULL_VIEW', url: 'https://example.com' })
ai.addFooterAction([{ text: 'A', url: '...' }, { text: 'B', url: '...' }])
```

`type` default `OPEN_FULL_VIEW`. Alias: `text`/`cta_text`, `type`/`cta_type`, `url`/`cta_url`.

### `addWidget(data)`

Widget pihak ketiga bertipe daftar acara. Fitur ini paling spesifik, dan tampilannya bergantung pada versi klien WhatsApp.

```js
ai.addWidget({
  title: 'Jadwal',
  sections: [ /* struktur section widget */ ],
  actions: [
    { label: 'Konfirmasi', id: 'confirm-1', kind: 'OTHER', state: 'PENDING', toast: { label: 'Terkirim' } }
  ]
})
```

`header` dan `body` (objek) bisa diberikan untuk menimpa/menambah isi bawaan.

---

## Mengatur urutan dengan `id`, `replace`, `insertAt`

Setiap method `add*` menerima tiga opsi untuk mengelola posisi item:

- `id`: beri nama pada item (string unik, satu `id` untuk satu section).
- `replace`: ganti item yang sudah ada.
- `insertAt`: sisipkan **setelah** item tersebut.

`replace` dan `insertAt` menerima `'idItem'` atau `['idItem', offset]`, dan keduanya tidak boleh dipakai bersamaan. Pada `insertAt` dengan `offset` negatif, item disisipkan sebelum node di posisi `index + offset`.

```js
const ai = new AIRich(sock)

ai.addText('Pembuka', { id: 'intro' })
  .addTable([['A', 'B'], ['1', '2']], { id: 'tabel' })
  .addTip('Catatan akhir', { id: 'catatan' })

// sisipkan gambar setelah intro
ai.addImage('https://example.com/a.png', { insertAt: 'intro' })

// ganti isi tabel
ai.addTable([['A', 'B'], ['10', '20']], { replace: 'tabel' })

// hapus item
ai.delete('catatan')

console.log(ai.getIds())      // ['intro', 'tabel']
console.log(ai.hasId('intro'))// true
console.log(ai.peek('intro')) // { id, section, submessage }

// beri id ke item yang sudah ada berdasarkan index
ai.assignId(0, 'pertama')     // error jika item itu sudah punya id

await ai.send(jid)
```

---

## Mengedit pesan yang sudah terkirim

```js
const ai = new AIRich(sock)
ai.addText('Memproses...', { id: 'status' })

const sent = await ai.send(jid, { quoted: m })

// ... beberapa saat kemudian
ai.addText('Selesai! ✅', { replace: 'status' })
await ai.sendEdit(jid, sent.key.id)

// atau tanpa argumen, otomatis memakai pesan terakhir yang dikirim instance ini
await ai.sendEdit()
```

`buildEdit(jid, id, opsi)` hanya membangun pesan edit tanpa mengirim.

---

## Opsi `send()` / `build()`

```js
await ai.send(jid, {
  quoted: m,
  notification: true,
  disclaimerText: 'Dibuat otomatis'
})
```

| Opsi | Default | Fungsi |
|---|---|---|
| `quoted` | – | Membalas pesan tertentu (objek pesan). |
| `quotedParticipant` | otomatis | Paksa JID peserta pada kutipan. |
| `messageId` | otomatis | ID pesan kustom. |
| `forwarded` | `true` | Menandai pesan sebagai diteruskan dari bot AI (`forwardedAiBotMessageInfo`). |
| `forwardWrapper` | `true` | Membungkus dalam `botForwardedMessage`. |
| `botJid` | `AIRich.DEFAULT_BOT_JID` | JID bot untuk info forward. |
| `notification` | `false` | Menambah `sessionTransparencyMetadata`. |
| `disclaimerText` | `''` | Teks disclaimer saat `notification: true`. |
| `includesUnifiedResponse` | `true` | Sertakan payload unified response. |
| `includesSubmessages` | `true` | Sertakan submessages klasik. |
| `bypassDownload` | `true` | Setelah kirim, otomatis dilanjutkan satu `sendEdit` dengan isi yang sama. Set `false` untuk mematikannya. |
| `verification` | `'auto'` | `'auto'` = tanpa proof (status UNKNOWN). `'placeholder'` = memasang proof palsu. |
| `additionalNodes` | `[]` | Node binary tambahan saat relay. |

Opsi lain yang tidak dikenal diteruskan ke `generateWAMessageFromContent` / `relayMessage`.

---

## Contoh lengkap

Handler perintah `.rich` yang memakai banyak jenis item:

```js
import { readFile } from 'node:fs/promises'
import makeWASocket, { AIRich } from '@kelvdra/baileys'

// di dalam handler messages.upsert
const ai = new AIRich(sock)

ai.setTitle('Demo AIRich')
  .addText('## Halo!\nIni demo **AIRich** dengan [link](https://example.com) dan sitasi[](https://example.com/ref).', { id: 'intro' })
  .addImage(await readFile('./banner.jpg'), { width: 1024, height: 512 })
  .addTable([
    ['Fitur', 'Keterangan'],
    ['Teks', 'Markdown + link'],
    ['Kode', 'Syntax highlight']
  ])
  .addCode('javascript', [
    'const hitung = (a, b) => a + b',
    'console.log(hitung(2, 3))'
  ].join('\n'))
  .addMap([
    { latitude: -6.5944, longitude: 106.7892, title: 'Bogor', body: 'Kota Hujan' }
  ])
  .addSource([
    ['https://example.com/fav.png', 'https://example.com', 'Example', 'example.com']
  ])
  .addProduct({
    title: 'Kopi Arabika 250g',
    brand: 'Kebun Kita',
    price: 'Rp95.000',
    url: 'https://example.com/produk/kopi',
    image: 'https://example.com/kopi.jpg'
  })
  .addTip('Kamu bisa mengedit pesan ini setelah terkirim.')
  .addSuggest(['Lagi dong', 'Selesai'])
  .setFooter('Dikirim lewat @kelvdra/baileys')

const sent = await ai.send(m.key.remoteJid, { quoted: m })

// edit beberapa detik kemudian
await new Promise((r) => setTimeout(r, 3000))
ai.addText('Teks sudah **diperbarui** ✅', { replace: 'intro' })
await ai.sendEdit(m.key.remoteJid, sent.key.id)
```

Versi paling ringkas lewat shorthand:

```js
await sock.sendMessage(m.key.remoteJid, {
  aiRich: {
    text: 'Halo dari **shorthand**',
    tip: 'Mudah, kan?',
    suggest: ['Ya', 'Tidak']
  }
}, { quoted: m })
```

---

## Error yang mungkin muncul

Semua turunan `AIRichError` (punya properti `.code`) dan diekspor dari paket:

| Error | Penyebab |
|---|---|
| `ItemNotFoundError` | `id` yang dituju (`replace`/`insertAt`/`delete`) tidak ada. Properti `availableIds` berisi daftar id yang valid. |
| `DuplicateIdError` | `id` sudah dipakai item lain. |
| `InvalidTargetError` | Index/offset di luar jangkauan. |
| `ContentValidationError` | Isi tidak valid, misalnya `replace` bersamaan dengan `insertAt`, atau satu `id` untuk banyak section. |

Kesalahan tipe argumen (mis. `addText(123)`, sel tabel bukan string, `addMap([])`) melempar `TypeError`.

```js
import { AIRichError, ItemNotFoundError } from '@kelvdra/baileys'

try {
  ai.addText('x', { replace: 'tidak-ada' })
} catch (e) {
  if (e instanceof ItemNotFoundError) console.log('Id tersedia:', e.availableIds)
  else throw e
}
```

---

## Catatan & troubleshooting

- **Tampilan bergantung pada klien WhatsApp.** AIRich dirender oleh klien penerima. Versi/konfigurasi klien tertentu bisa menampilkannya berbeda atau menyembunyikan sebagian item. Pakai `unsupportedTypeAlert` (default aktif) agar ada teks cadangan.
- **Jangan pakai `verification: 'placeholder'` kecuali perlu.** Opsi ini memasang proof palsu sehingga status verifikasi menjadi *FAILED*, dan kartu bisa tersamarkan di klien yang mengaktifkan masking pengirim tak dikenal. Default `'auto'` lebih aman. Library akan mencetak peringatan sekali jika kamu memakai `'placeholder'`.
- **`relayMessage is not a function`**: pastikan membuat `new AIRich(sock)` dengan `sock` dari `makeWASocket` yang sudah jadi, atau pakai `sock.sendAIRich` / `sock.sendMessage({ aiRich })` yang sudah menyiapkan client dengan benar.
- **Gambar/video tidak muncul dari path lokal**: baca file jadi `Buffer` dulu (lihat [Media](#media-url-buffer-dan-path-file)). String non-URL dianggap base64.
- **Thumbnail video kosong**: pasang `ffmpeg` (dan `fluent-ffmpeg`), atau berikan `thumbnail` sendiri pada objek video, atau set `autoFill: false`.
- **Pesan terkirim dua kali / ada edit otomatis**: itu perilaku `bypassDownload` (default `true`). Matikan dengan `{ bypassDownload: false }` bila tidak diinginkan.
- **Rate/ban**: kirim pesan berat secara wajar. Library ini punya opsi `humanize` (lihat README utama) untuk memberi jeda dan presence *composing*.
- **Dekode pesan AIRich yang diterima**: gunakan `decodeAIRich(msg)` (diekspor dari paket) untuk membaca sections, submessages, dan unified response dari pesan masuk.

---

Dibuat berdasarkan source `@kelvdra/baileys`. Untuk fitur lain (Button, Carousel, A2UI, `sendHTML`, dsb.) lihat [`docs/DOKUMENTASI.md`](./docs/DOKUMENTASI.md) dan [`docs/README_nativeflow_a2ui.md`](./docs/README_nativeflow_a2ui.md).
