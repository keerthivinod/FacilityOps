const { webcrypto } = require("crypto");
const { subtle } = webcrypto;

// Derive a 32-byte key from ENCRYPTION_KEY or JWT_SECRET or a fallback
const secret = (process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || "default_fallback_secret_32_bytes").padEnd(32, "0").slice(0, 32);

async function getEncryptionKey() {
  const rawKey = new TextEncoder().encode(secret);
  return subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptData(text) {
  if (!text) return text;
  try {
    const key = await getEncryptionKey();
    const iv = webcrypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);

    const ciphertext = await subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded
    );

    // Concatenate IV and ciphertext
    const encryptedBuffer = Buffer.concat([iv, Buffer.from(ciphertext)]);
    return encryptedBuffer.toString("base64");
  } catch (err) {
    console.error("Encryption failed:", err);
    return text; // Return plaintext as fallback or throw?
  }
}

async function decryptData(encryptedBase64) {
  if (!encryptedBase64) return encryptedBase64;

  // Basic check if it looks like base64 and has minimum length for IV + Auth Tag
  if (encryptedBase64.startsWith("sk-")) return encryptedBase64; // It's plaintext

  try {
    const key = await getEncryptionKey();
    const data = Buffer.from(encryptedBase64, "base64");

    // Ensure we have at least 12 bytes IV + 16 bytes auth tag
    if (data.length < 28) return encryptedBase64;

    const iv = data.slice(0, 12);
    const ciphertext = data.slice(12);

    const decrypted = await subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    // If decryption fails, it might be an old plaintext key
    return encryptedBase64;
  }
}

module.exports = { encryptData, decryptData };
