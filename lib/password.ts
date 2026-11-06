import crypto from 'crypto';

const ITERATIONS = 10000;
const KEY_LEN = 64;
const DIGEST = 'sha256';

/**
 * Hash kata sandi dengan PBKDF2 + Random Salt (Standard Security)
 * Format output: pbkdf2:<salt_hex>:<hash_hex>
 */
export function hashPassword(plainPassword: string): string {
  if (!plainPassword) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(plainPassword, salt, ITERATIONS, KEY_LEN, DIGEST)
    .toString('hex');
  return `pbkdf2:${salt}:${hash}`;
}

/**
 * Cek apakah string password sudah berformat hash PBKDF2
 */
export function isHashed(passwordStr: string): boolean {
  return typeof passwordStr === 'string' && passwordStr.startsWith('pbkdf2:');
}

/**
 * Verifikasi kata sandi yang diinput user dengan yang tersimpan di DB
 * Mendukung format PBKDF2 Hash maupun Fallback Plain Text (untuk akun lama)
 */
export function verifyPassword(plainPassword: string, storedPassword: string): boolean {
  if (!plainPassword || !storedPassword) return false;

  // 1. Jika tersimpan dalam format hash PBKDF2
  if (isHashed(storedPassword)) {
    const parts = storedPassword.split(':');
    if (parts.length !== 3) return false;
    const [, salt, originalHash] = parts;

    const hashToVerify = crypto
      .pbkdf2Sync(plainPassword, salt, ITERATIONS, KEY_LEN, DIGEST)
      .toString('hex');

    return crypto.timingSafeEqual(
      Buffer.from(hashToVerify, 'hex'),
      Buffer.from(originalHash, 'hex')
    );
  }

  // 2. Fallback untuk akun lama yang masih plain text
  return plainPassword === storedPassword;
}

/**
 * Struktur status validasi kriteria kata sandi
 */
export interface PasswordValidation {
  hasMinLength: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  hasLetter: boolean;
  isValid: boolean;
  score: number;
}

/**
 * Validasi kata sandi baru (minimal 8 karakter, ada angka, ada simbol, ada huruf)
 */
export function validatePasswordCriteria(password: string): PasswordValidation {
  const p = password || '';
  const hasMinLength = p.length >= 8;
  const hasNumber = /\d/.test(p);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p);
  const hasLetter = /[a-zA-Z]/.test(p);

  const isValid = hasMinLength && hasNumber && hasSymbol && hasLetter;
  let score = 0;
  if (hasMinLength) score++;
  if (hasNumber) score++;
  if (hasSymbol) score++;
  if (hasLetter) score++;

  return {
    hasMinLength,
    hasNumber,
    hasSymbol,
    hasLetter,
    isValid,
    score,
  };
}
