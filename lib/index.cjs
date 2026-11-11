'use strict';
/**
 * Entry CommonJS untuk @kelvdra/baileys.
 *
 * Library ini ditulis sebagai ES Module. File ini membuat `require()` bekerja:
 *
 *   const makeWASocket = require('@kelvdra/baileys')                  // callable
 *   const { default: makeWASocket, DisconnectReason } = require('@kelvdra/baileys')
 *   const { makeWASocket, useMultiFileAuthState } = require('@kelvdra/baileys')
 *
 * Syarat: Node.js >= 20.19 atau >= 22.12 (require() untuk ES Module).
 * Di Node yang lebih lama, pakai:  const baileys = await import('@kelvdra/baileys')
 */
let ns;
try {
    ns = require('./index.js');
} catch (err) {
    if (err && (err.code === 'ERR_REQUIRE_ESM' || err.code === 'ERR_REQUIRE_ASYNC_MODULE')) {
        const e = new Error(
            `@kelvdra/baileys tidak bisa di-require() di Node ${process.versions.node}. ` +
            'Gunakan Node.js >= 20.19 / >= 22.12, atau muat dengan: ' +
            "const baileys = await import('@kelvdra/baileys').\n" + err.message
        );
        e.code = err.code;
        e.cause = err;
        throw e;
    }
    throw err;
}

const makeWASocket = ns.default || ns.makeWASocket;
// Fungsi pembungkus supaya `require(...)` langsung bisa dipanggil, sekaligus membawa semua named export.
const api = function makeWASocketCjs(...args) {
    return makeWASocket.apply(this, args);
};
const SKIP = new Set(['length', 'name', 'prototype', 'caller', 'arguments', '__esModule']);
for (const key of Object.keys(ns)) {
    if (SKIP.has(key)) continue;
    Object.defineProperty(api, key, { enumerable: true, configurable: true, get: () => ns[key] });
}
Object.defineProperty(api, 'default', { enumerable: true, configurable: true, value: makeWASocket });
Object.defineProperty(api, '__esModule', { value: true });
module.exports = api;
