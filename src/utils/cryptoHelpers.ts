export const generateSecureRandom = (length: number): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const generateSecureToken = (): string => {
  return `${Date.now()}_${generateSecureRandom(32)}`;
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = generateSecureRandom(16);
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hash = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  return `pbkdf2:${salt}:${hash}`;
};

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  // Legacy SHA-256 hashes have no prefix — verify with old method for backwards compat
  if (!storedHash.startsWith('pbkdf2:')) {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
    const legacyHash = Array.from(new Uint8Array(hashBuffer))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    return legacyHash === storedHash;
  }

  const parts = storedHash.split(':');
  if (parts.length !== 3) return false;
  const [, salt, expectedHash] = parts;

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const hash = Array.from(new Uint8Array(derivedBits))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
  return hash === expectedHash;
};

export const encryptData = async (data: string, key: CryptoKey): Promise<{ encrypted: string; iv: string }> => {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );

  const encryptedArray = Array.from(new Uint8Array(encryptedBuffer));
  const encrypted = btoa(String.fromCharCode(...encryptedArray));
  const ivString = btoa(String.fromCharCode(...Array.from(iv)));

  return { encrypted, iv: ivString };
};

export const decryptData = async (encrypted: string, iv: string, key: CryptoKey): Promise<string> => {
  const encryptedArray = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
  const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivArray },
    key,
    encryptedArray
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
};

export const getOrCreateEncryptionKey = async (): Promise<CryptoKey> => {
  const keyName = '__gym_encryption_key__';

  const storedKeyData = localStorage.getItem(keyName);

  if (storedKeyData) {
    try {
      const keyData = JSON.parse(storedKeyData);
      const rawKey = Uint8Array.from(atob(keyData.key), c => c.charCodeAt(0));

      return await crypto.subtle.importKey(
        'raw',
        rawKey,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to import stored key:', error);
    }
  }

  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const exportedKey = await crypto.subtle.exportKey('raw', key);
  const keyArray = Array.from(new Uint8Array(exportedKey));
  const keyString = btoa(String.fromCharCode(...keyArray));

  localStorage.setItem(keyName, JSON.stringify({ key: keyString }));

  return key;
};
