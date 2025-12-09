// Script để tạo VAPID keys cho Push Notifications
// Chạy: npx ts-node scripts/generate-vapid-keys.ts

const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n========================================');
console.log('VAPID Keys Generated Successfully!');
console.log('========================================\n');

console.log('Add these to your .env.local file:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);

console.log('\n========================================\n');
console.log('Public Key (for client):');
console.log(vapidKeys.publicKey);
console.log('\nPrivate Key (for server - keep secret!):');
console.log(vapidKeys.privateKey);
console.log('\n========================================\n');
