import 'reflect-metadata';
import * as crypto from 'crypto';

// Generación dinámica de claves RSA para firma y verificación de tokens en pruebas
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

process.env.JWT_PRIVATE_KEY = privateKey;
process.env.JWT_PUBLIC_KEY = publicKey;
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_ISSUER = 'uni-booking-tests';
process.env.JWT_AUDIENCE = 'uni-booking-app';
