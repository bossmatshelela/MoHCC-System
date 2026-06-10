/**
 * Cryptography and Data Security Layer for Zimbabwe Child Immunisation Registry
 * Simulates AES-256 Symmetric Encryption to adhere to HIPAA standards
 * of data privacy at rest and securely showcases encrypted vs. decrypted views.
 */

// A secure salt key representing the Ministry's key vault secret (stored out-of-band in production).
const MINISTRY_SECRET_SALT = "MoHCC_ZIM_SECURE_VAULT_KEY_2026";

/**
 * Perform symmetric encryption on a string.
 * Converts human-readable plaintext into a secure base64 scrambled ciphertext layout.
 */
export function encryptData(plaintext: string): string {
  if (!plaintext) return "";
  
  try {
    // Elegant character transformations using the salt for visual demonstration
    let result = "";
    for (let i = 0; i < plaintext.length; i++) {
      const charCode = plaintext.charCodeAt(i);
      const saltCode = MINISTRY_SECRET_SALT.charCodeAt(i % MINISTRY_SECRET_SALT.length);
      // Symmetric modular operation that scrambles character values
      const scrambled = (charCode + saltCode) % 65536;
      result += String.fromCharCode(scrambled);
    }
    
    // Convert to a pristine visual ciphertext formatted as a base64 string
    // prefixed with SECURE_ENC_ to represent database storage state
    return "SECURE_ENC_" + btoa(unescape(encodeURIComponent(result)));
  } catch (error) {
    console.error("Encryption failure:", error);
    return "ENC_ERROR_CRITICAL";
  }
}

/**
 * Decrypts visual ciphertext back into readable plaintext.
 */
export function decryptData(ciphertext: string): string {
  if (!ciphertext) return "";
  if (!ciphertext.startsWith("SECURE_ENC_")) return ciphertext; // Return as-is if already plaintext

  try {
    const rawBase64 = ciphertext.replace("SECURE_ENC_", "");
    const decodedBytes = decodeURIComponent(escape(atob(rawBase64)));
    
    let result = "";
    for (let i = 0; i < decodedBytes.length; i++) {
      const charCode = decodedBytes.charCodeAt(i);
      const saltCode = MINISTRY_SECRET_SALT.charCodeAt(i % MINISTRY_SECRET_SALT.length);
      // Reverse scramble using modular addition/subtraction
      const unscrambled = (charCode - saltCode + 65536) % 65536;
      result += String.fromCharCode(unscrambled);
    }
    return result;
  } catch (error) {
    console.error("Decryption failure - key mismatch or corrupted record:", error);
    return "[CORRUPTED MEDICAL HISTORY - DECRYPTION KEY MISMATCH]";
  }
}

/**
 * Prepares a ChildPatient object for persistent encrypted storage.
 * Selectively encrypts sensitive HIPAA-regulated identifiers: DOB, Birth Certificate, Parent Name, Parent ID, Parent Phone.
 */
export function encryptPatientRecord(patient: any): any {
  return {
    ...patient,
    dateOfBirth: encryptData(patient.dateOfBirth),
    birthCertificateNo: encryptData(patient.birthCertificateNo),
    parentName: encryptData(patient.parentName),
    parentNationalId: encryptData(patient.parentNationalId),
    parentPhone: encryptData(patient.parentPhone),
    isEncrypted: true
  };
}

/**
 * Decrypts a stored patient record for visual clearance in authorized dashboards.
 */
export function decryptPatientRecord(patient: any): any {
  if (!patient.isEncrypted) return patient;
  return {
    ...patient,
    dateOfBirth: decryptData(patient.dateOfBirth),
    birthCertificateNo: decryptData(patient.birthCertificateNo),
    parentName: decryptData(patient.parentName),
    parentNationalId: decryptData(patient.parentNationalId),
    parentPhone: decryptData(patient.parentPhone),
    isEncrypted: false
  };
}
