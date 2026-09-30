# @kelvdra/libsignal

**Modernized, security-hardened fork of the Signal Protocol for Node.js**

[![npm version](https://img.shields.io/npm/v/@akaanakbaik/libsignal.svg?style=flat-square)](https://www.npmjs.com/package/@akaanakbaik/libsignal)
[![npm downloads](https://img.shields.io/npm/dm/@akaanakbaik/libsignal.svg?style=flat-square)](https://www.npmjs.com/package/@akaanakbaik/libsignal)
[![GitHub last commit](https://img.shields.io/github/last-commit/akaanakbaik/libsignal?style=flat-square)](https://github.com/akaanakbaik/libsignal/commits/master)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=flat-square)](LICENSE)
[![Node.js CI](https://img.shields.io/github/actions/workflow/status/akaanakbaik/libsignal/ci.yml?branch=master&style=flat-square)](https://github.com/akaanakbaik/libsignal/actions?query=workflow%3ACI)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/akaanakbaik/libsignal/ci.yml?branch=master&style=flat-square&label=CodeQL)](https://github.com/akaanakbaik/libsignal/security/code-scanning)
[![Node Version](https://img.shields.io/badge/node-%3E%3D16-brightgreen?style=flat-square)](package.json)

---

## Overview

`@kelvdra/libsignal` is a pure JavaScript implementation of the **Signal Protocol** — the cryptographic protocol that powers WhatsApp, Signal Messenger, and other end-to-end encrypted messaging applications.

This is a **modernized fork** of [WhiskeySockets/libsignal-node](https://github.com/WhiskeySockets/libsignal-node). It provides:

- **Zero Breaking Changes** — 100% API compatible with the original
- **Security Hardened** — All sensitive data leakage via console logging removed
- **Enterprise Quality** — Comprehensive testing, CI/CD, and documentation
- **Long-Term Maintainable** — Clean codebase with full documentation

## Features

- 🔐 **Signal Protocol v3** — X3DH key agreement + Double Ratchet algorithm
- 🔑 **X25519 Key Agreement** — Curve25519 ECDH for forward secrecy
- 📝 **Ed25519 Signatures** — Signed pre-keys for identity verification
- 🗄️ **AES-256-CBC Encryption** — Symmetric message encryption
- 🔄 **Session Management** — Multi-session support with cleanup
- 📦 **Pure JavaScript** — No native compilation required
- 🎯 **Baileys Compatible** — Drop-in replacement for `@kelvdra/baileys`

## Why This Fork?

The original `WhiskeySockets/libsignal-node` package:

1. **Leaks sensitive data**: Console.log/info/warn calls expose private keys, session records, and registration IDs to stdout/stderr
2. **Lacks testing**: No unit tests, no regression tests, no CI/CD
3. **Limited documentation**: No API reference, architecture docs, or security guide
4. **No publish config**: Git URL dependencies cause installation issues

This fork addresses all these issues while maintaining **100% backward compatibility**.

## Installation

```bash
npm install @kelvdra/libsignal
```

## Usage

### Basic Usage

```javascript
const libsignal = require('@kelvdra/libsignal');

// OR (ESM / TypeScript)
import * as libsignal from '@kelvdra/libsignal';
```

### With Baileys

```javascript
// Works with @kelvdra/baileys and WhiskeySockets/Baileys
const libsignal = require('@kelvdra/libsignal');

// Or configure your Baileys instance to use this package
```

### Key Generation

```javascript
const { keyhelper, curve, ProtocolAddress } = require('@kelvdra/libsignal');

// Generate identity key pair
const identityKeyPair = keyhelper.generateIdentityKeyPair();

// Generate registration ID
const registrationId = keyhelper.generateRegistrationId();

// Generate signed pre-key
const signedPreKey = keyhelper.generateSignedPreKey(identityKeyPair, 1);

// Generate one-time pre-key
const preKey = keyhelper.generatePreKey(1);
```

### Session Establishment

```javascript
const { SessionBuilder, SessionCipher, ProtocolAddress } = require('@kelvdra/libsignal');

// Create address for remote device
const remoteAddr = new ProtocolAddress('user@example.com', 1);

// Storage interface (implement by your app)
const storage = {
    loadSession: async (id) => { /* ... */ },
    storeSession: async (id, session) => { /* ... */ },
    isTrustedIdentity: (identifier, identityKey) => { /* ... */ },
    loadPreKey: async (id) => { /* ... */ },
    removePreKey: (id) => { /* ... */ },
    loadSignedPreKey: () => { /* ... */ },
    getOurRegistrationId: () => { /* ... */ },
    getOurIdentity: () => { /* ... */ }
};

// Initiate session
const builder = new SessionBuilder(storage, remoteAddr);
await builder.initOutgoing({
    registrationId: 12345,
    identityKey: someIdentityKey,
    signedPreKey: { keyId: 1, publicKey: pubKey, signature: sig },
    preKey: { keyId: 1, publicKey: pubKey }
});
```

### Message Encryption/Decryption

```javascript
const cipher = new SessionCipher(storage, remoteAddr);

// Encrypt
const { type, body, registrationId } = await cipher.encrypt(
    Buffer.from('Hello, World!')
);

// Decrypt (standard message)
const plaintext = await cipher.decryptWhisperMessage(body);

// Decrypt (pre-key message)
const plaintext = await cipher.decryptPreKeyWhisperMessage(preKeyMessage);
```

## API

### Exports

| Export | Description |
|--------|-------------|
| `crypto` | AES-256-CBC, HMAC-SHA256, SHA-512, HKDF |
| `curve` | X25519 key agreement, Ed25519 signatures |
| `keyhelper` | Key generation (identity, pre-keys, signed pre-keys) |
| `ProtocolAddress` | Device address representation |
| `SessionBuilder` | Session establishment (X3DH) |
| `SessionCipher` | Message encryption/decryption (Double Ratchet) |
| `SessionRecord` | Session state persistence |
| `SignalError` | Base error class |
| `UntrustedIdentityKeyError` | Untrusted identity error |
| `SessionError` | Session error |
| `MessageCounterError` | Message counter error |
| `PreKeyError` | Pre-key error |

For full API documentation, see [API_REFERENCE.md](API_REFERENCE.md).

## Migration Guide

### From libsignal (npm) or WhiskeySockets/libsignal-node

1. Update your `package.json`:
```json
{
  "dependencies": {
    "libsignal": "npm:@kelvdra/libsignal@^1.0.0"
  }
}
```

2. Or replace the package name:
```json
{
  "dependencies": {
    "@akaanakbaik/libsignal": "^1.0.0"
  }
}
```

3. Update your imports:
```javascript
// Old
const libsignal = require('libsignal');

// New
const libsignal = require('@kelvdra/libsignal');
```

**No other code changes required.** All APIs, classes, methods, parameters, return values, and error types are identical.

## Compatibility Matrix

### Node.js Versions

| Version | Supported |
|---------|-----------|
| 16.x | ✅ |
| 18.x | ✅ |
| 20.x | ✅ |
| 22.x | ✅ |
| 24.x | ⏳ (planned) |

### Baileys Versions

| Version | Compatible |
|---------|------------|
| WhiskeySockets/Baileys 6.x | ✅ |
| @kelvdra/baileys 1.x | ✅ |

### Platforms

| Platform | Architecture | Status |
|----------|-------------|--------|
| Ubuntu 20.04+ | x64, arm64 | ✅ |
| Debian 11+ | x64, arm64 | ✅ |
| macOS 12+ | x64, arm64 | ✅ |
| Windows Server 2019+ | x64 | ✅ |
| Windows 10+ | x64 | ✅ |

## Security

### What We Fixed

- **Removed all console.log/info/warn/error** calls that leaked:
  - Private keys
  - Ephemeral keys
  - Root keys
  - Pending pre-keys
  - Registration IDs
  - Session records
  - Error stack traces

### What We Guarantee

- **Zero sensitive data** printed to stdout/stderr
- **Zero cryptographic changes** — protocol behavior is identical
- **Zero API changes** — 100% backward compatible
- **Regression tests** ensure no console logging is reintroduced

See [SECURITY.md](SECURITY.md) for vulnerability reporting and [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md) for detailed security analysis.

## Performance

Benchmarks available in [test/benchmark.test.js](test/benchmark.test.js).

Run benchmarks:
```bash
node --test test/benchmark.test.js
```

## Development

```bash
# Clone
git clone https://github.com/kelvdra/libsignal.git
cd libsignal

# Install
npm install

# Test
npm test

# Lint
npx eslint src/
npx prettier --check "src/**/*.js" "index.js"
```

See [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) for full development setup.

## Documentation Index

| Document | Description |
|----------|-------------|
| [README.md](README.md) | This file |
| [API_REFERENCE.md](API_REFERENCE.md) | Complete API documentation |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architecture overview |
| [DESIGN.md](DESIGN.md) | Design decisions and rationale |
| [INTERNALS.md](INTERNALS.md) | Internal implementation details |
| [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md) | Security analysis |
| [SECURITY.md](SECURITY.md) | Security policy and vulnerability reporting |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contributing guidelines |
| [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) | Development setup |
| [TESTING_GUIDE.md](TESTING_GUIDE.md) | Testing guide |
| [RELEASE_GUIDE.md](RELEASE_GUIDE.md) | Release process |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [ROADMAP.md](ROADMAP.md) | Future plans |
| [AGENTS.md](AGENTS.md) | AI/Agent guide |
| [LAPORAN.md](LAPORAN.md) | Master audit report |

## FAQ

### Why does this package exist?

The original `WhiskeySockets/libsignal-node` had several issues: sensitive data leaked through console logs, no testing, no CI/CD, and limited documentation. This fork addresses all these issues while maintaining 100% backward compatibility.

### Is this compatible with Baileys?

Yes. This is designed as a drop-in replacement for the `libsignal` dependency in `@kelvdra/baileys`. No code changes needed.

### Does this change the Signal Protocol?

No. Zero changes to cryptographic algorithms, session format, message format, serialization, or any protocol behavior.

### Can I use this with the official Signal app?

No. This is a Node.js implementation for server-side use. The official Signal app uses `@signalapp/libsignal-client`.

### Why not use @signalapp/libsignal-client?

The official library uses native Rust bindings and has a different API. Switching would require significant changes to Baileys.

### Will this package receive updates?

Yes. We maintain this package for the `@kelvdra/baileys` project and welcome community contributions.

## License

[GPL-3.0](LICENSE) — This is a fork of [WhiskeySockets/libsignal-node](https://github.com/WhiskeySockets/libsignal-node), which is licensed under GPL-3.0.

## Credits

- **WhiskeySockets** — Original [libsignal-node](https://github.com/WhiskeySockets/libsignal-node) implementation
- **Adiwajshing** — Original [Baileys](https://github.com/adiwajshing/Baileys) project
- **Signal Foundation** — The [Signal Protocol](https://signal.org/docs/) specification

## Support

- [GitHub Issues](https://github.com/akaanakbaik/libsignal/issues)
- [Security Issues](SECURITY.md)
- [Documentation](https://github.com/akaanakbaik/libsignal#readme)
