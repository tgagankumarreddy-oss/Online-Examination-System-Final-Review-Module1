/**
 * Web Crypto API Utility for Client-Side Password Hashing
 * Demonstrates secure one-way cryptographic hashing using SHA-256 in browser environments.
 *
 * TRANSPARENCY NOTICE:
 * Client-side cryptographic hashing prevents storing plaintext passwords in browser LocalStorage.
 * In a pure frontend demonstration architecture without an authoritative backend server,
 * client-side hashing is for demonstration only and cannot replace server-side authentication,
 * secret salting, or HTTPS token verification.
 */

/**
 * Generates a SHA-256 hexadecimal hash string for a given password using Web Crypto API.
 * @param {string} password - Raw plaintext password
 * @returns {Promise<string>} Hexadecimal SHA-256 hash
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string') return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Web Crypto API hashing error:', error);
    // Fallback simple bitwise hash for non-crypto environments
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }
}

/**
 * Validates a plaintext password against a stored SHA-256 hash.
 * @param {string} password - Raw plaintext password
 * @param {string} storedHash - Previously computed hash
 * @returns {Promise<boolean>} Match status
 */
export async function verifyPasswordHash(password, storedHash) {
  if (!password || !storedHash) return false;
  const computed = await hashPassword(password);
  return computed === storedHash;
}
