import crypto from "node:crypto";

import * as openpgp from "openpgp";

import { env } from "../config/env.js";

export function signToken(rawToken: string) {
  return crypto.createHmac("sha256", env.sessionSecret).update(rawToken).digest("hex");
}

export function randomToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * PGP decrypt: decrypt PGP-encrypted content using private key or password.
 * Used for ENCRYPTED_TXT integration files (e.g. JAN).
 */
export async function pgpDecrypt(
  encryptedBuffer: Buffer,
  options: { privateKeyArmored?: string; passphrase?: string; password?: string },
): Promise<string> {
  const { privateKeyArmored, passphrase, password } = options;

  if (password) {
    // Symmetric password-based PGP decryption
    const message = await openpgp.readMessage({
      binaryMessage: new Uint8Array(encryptedBuffer),
    });
    const { data } = await openpgp.decrypt({
      message,
      passwords: [password],
      format: "utf8",
    });
    return data as string;
  }

  if (privateKeyArmored) {
    const privateKey = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored });
    const decryptedKey = passphrase
      ? await openpgp.decryptKey({ privateKey, passphrase })
      : privateKey;

    const message = await openpgp.readMessage({
      binaryMessage: new Uint8Array(encryptedBuffer),
    });
    const { data } = await openpgp.decrypt({
      message,
      decryptionKeys: decryptedKey,
      format: "utf8",
    });
    return data as string;
  }

  throw new Error("PGP decryption requires either password or privateKeyArmored");
}
