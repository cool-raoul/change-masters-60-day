const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n✓ VAPID Keys gegenereerd!\n');
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);

// Lees huidige .env.local
const envPath = path.join(__dirname, '.env.local');
let envContent = fs.readFileSync(envPath, 'utf8');

// Vervang de VAPID keys
envContent = envContent.replace(
  /NEXT_PUBLIC_VAPID_PUBLIC_KEY=.*/,
  `NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`
);
envContent = envContent.replace(
  /VAPID_PRIVATE_KEY=.*/,
  `VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`
);

// Schrijf terug
fs.writeFileSync(envPath, envContent);

console.log('\n✓ Keys automatisch opgeslagen in .env.local!');
console.log('\nKopieer deze Public Key voor Vercel:');
console.log(vapidKeys.publicKey);
console.log('\nKopieer deze Private Key voor Vercel:');
console.log(vapidKeys.privateKey);
