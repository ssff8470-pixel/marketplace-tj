/**
 * Генератор самоподписанного SSL-сертификата для локального HTTPS.
 * Использует пакет `selfsigned` (чистый JS, без openssl).
 *
 * Запуск: npm run cert
 */
import selfsigned from 'selfsigned';
import fs from 'fs';
import path from 'path';

const certsDir = path.resolve(__dirname, '..', '..', 'certs');

if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

async function createCert() {
  const attrs = [
    { name: 'commonName', value: 'localhost' },
    { name: 'organizationName', value: 'TJ Marketplace Dev' },
    { name: 'countryName', value: 'TJ' },
  ];

  const altNames = ['localhost', '127.0.0.1'];

  const pems = await selfsigned.generate(attrs, {
    keySize: 2048,
    days: 365,
    algorithm: 'sha256',
    extensions: [
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        keyEncipherment: true,
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
      },
      {
        name: 'subjectAltName',
        altNames: altNames.map((host) => ({
          type: /^\d+\.\d+\.\d+\.\d+$/.test(host) ? 7 : 2,
          value: host,
        })),
      },
    ],
  } as any);

  const certPath = path.join(certsDir, 'server.crt');
  const keyPath = path.join(certsDir, 'server.key');

  fs.writeFileSync(certPath, pems.cert);
  fs.writeFileSync(keyPath, pems.private);
  fs.chmodSync(keyPath, 0o600);

  console.log('\n[OK] SSL-сертификат создан (selfsigned):');
  console.log(`  Сертификат: ${certPath}`);
  console.log(`  Ключ:       ${keyPath}`);
  console.log('\n  Это самоподписанный сертификат для локальной разработки.');
  console.log('  Браузер покажет предупреждение — это нормально.\n');
}

createCert();

