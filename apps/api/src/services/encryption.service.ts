type EncryptionConfig = {
  iterations: number;
  saltLength: number;
  hashLength: number;
  digest: "SHA-256" | "SHA-384" | "SHA-512";
};

const DEFAULT_CONFIG: EncryptionConfig = {
  iterations: 310_000,
  saltLength: 16,
  hashLength: 32,
  digest: "SHA-256",
};

const encoder = new TextEncoder();

const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
  }
  return btoa(binary);
};

const fromBase64 = (base64: string) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const timingSafeEqual = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
};

const deriveKey = async (
  password: string,
  salt: Uint8Array,
  config: EncryptionConfig
) => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: config.iterations,
      hash: config.digest,
    },
    key,
    config.hashLength * 8
  );

  return new Uint8Array(bits);
};

const createEncryptionService = (config: Partial<EncryptionConfig> = {}) => {
  const settings: EncryptionConfig = { ...DEFAULT_CONFIG, ...config };

  async function encryptPassword(password: string) {
    const salt = crypto.getRandomValues(new Uint8Array(settings.saltLength));
    const hash = await deriveKey(password, salt, settings);

    return [
      "pbkdf2",
      settings.digest,
      settings.iterations,
      toBase64(salt),
      toBase64(hash),
    ].join("$");
  }

  async function verifyPassword(password: string, storedHash: string) {
    const parts = storedHash.split("$");
    if (parts.length !== 5 || parts[0] !== "pbkdf2") return false;

    const digest = parts[1] as EncryptionConfig["digest"];
    const iterations = Number(parts[2]);
    if (!Number.isFinite(iterations) || iterations <= 0) return false;

    try {
      const salt = fromBase64(parts[3]);
      const hash = fromBase64(parts[4]);
      const derived = await deriveKey(password, salt, {
        digest,
        iterations,
        saltLength: salt.length,
        hashLength: hash.length,
      });

      return timingSafeEqual(hash, derived);
    } catch {
      return false;
    }
  }

  return { encryptPassword, verifyPassword };
};

export default createEncryptionService;