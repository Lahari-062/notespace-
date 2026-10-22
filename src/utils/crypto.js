// Secure password hashing utility using Web Crypto API (SHA-256 with salt)

export async function hashPassword(password, salt = "notespace_secure_salt_v1") {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
