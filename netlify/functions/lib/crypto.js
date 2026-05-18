const { webcrypto } = require("crypto");
const { subtle } = webcrypto;

async function getEncryptionKey() {
  const rawKey = process.env.ENCRYPTION_KEY || "12345678901234567890123456789012";
  const keyBuf = Buffer.from(rawKey.padEnd(32, '0').slice(0, 32));
  return await subtle.importKey(
    "raw",
    keyBuf,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encrypt(text) {
  if (!text) return text;
  const key = await getEncryptionKey();
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);
  const encrypted = await subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  return Buffer.from(combined).toString("base64");
}

async function decrypt(cipherText) {
  if (!cipherText) return cipherText;
  try {
    const key = await getEncryptionKey();
    const combined = Buffer.from(cipherText, "base64");
    if (combined.length < 12) return cipherText;

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    // Return original text if decryption fails (e.g. it was plaintext)
    return cipherText;
  }
}

module.exports = { encrypt, decrypt };
