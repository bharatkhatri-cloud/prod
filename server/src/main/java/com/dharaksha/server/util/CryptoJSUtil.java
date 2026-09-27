package com.dharaksha.server.util;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Base64;

public class CryptoJSUtil {

    public static String decrypt(String cipherText, String passphrase) throws Exception {
        byte[] cipherBytes = Base64.getDecoder().decode(cipherText);

        // CryptoJS format starts with "Salted__" (8 bytes) followed by 8 bytes salt
        if (cipherBytes.length < 16) {
            throw new IllegalArgumentException("Invalid encrypted text length");
        }
        byte[] saltHeader = Arrays.copyOfRange(cipherBytes, 0, 8);
        String headerStr = new String(saltHeader, StandardCharsets.US_ASCII);
        if (!"Salted__".equals(headerStr)) {
            throw new IllegalArgumentException("Invalid CryptoJS encrypted text (missing Salted__ prefix)");
        }

        byte[] salt = Arrays.copyOfRange(cipherBytes, 8, 16);
        byte[] encryptedBytes = Arrays.copyOfRange(cipherBytes, 16, cipherBytes.length);

        // Derive Key and IV using EvpKDF (MD5)
        byte[][] keyAndIv = deriveKeyAndIv(passphrase.getBytes(StandardCharsets.UTF_8), salt);
        SecretKeySpec keySpec = new SecretKeySpec(keyAndIv[0], "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(keyAndIv[1]);

        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec);
        byte[] decryptedBytes = cipher.doFinal(encryptedBytes);

        return new String(decryptedBytes, StandardCharsets.UTF_8);
    }

    public static String encrypt(String plainText, String passphrase) throws Exception {
        byte[] salt = new byte[8];
        new java.security.SecureRandom().nextBytes(salt);

        byte[][] keyAndIv = deriveKeyAndIv(passphrase.getBytes(StandardCharsets.UTF_8), salt);
        SecretKeySpec keySpec = new SecretKeySpec(keyAndIv[0], "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(keyAndIv[1]);

        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);
        byte[] encryptedBytes = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

        byte[] prefix = "Salted__".getBytes(StandardCharsets.US_ASCII);
        byte[] result = new byte[prefix.length + salt.length + encryptedBytes.length];
        System.arraycopy(prefix, 0, result, 0, prefix.length);
        System.arraycopy(salt, 0, result, prefix.length, salt.length);
        System.arraycopy(encryptedBytes, 0, result, prefix.length + salt.length, encryptedBytes.length);

        return Base64.getEncoder().encodeToString(result);
    }

    private static byte[][] deriveKeyAndIv(byte[] passphrase, byte[] salt) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] key = new byte[32]; // 256 bits
        byte[] iv = new byte[16];  // 128 bits

        byte[] mdBuf = new byte[0];
        byte[] keyAndIvBytes = new byte[48];
        int derivedBytesCount = 0;

        while (derivedBytesCount < 48) {
            md.reset();
            md.update(mdBuf);
            md.update(passphrase);
            md.update(salt);
            mdBuf = md.digest();

            int bytesToCopy = Math.min(mdBuf.length, 48 - derivedBytesCount);
            System.arraycopy(mdBuf, 0, keyAndIvBytes, derivedBytesCount, bytesToCopy);
            derivedBytesCount += bytesToCopy;
        }

        System.arraycopy(keyAndIvBytes, 0, key, 0, 32);
        System.arraycopy(keyAndIvBytes, 32, iv, 0, 16);

        return new byte[][]{key, iv};
    }
}
