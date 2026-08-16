const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const keyPath = path.join(__dirname, '..', 'firebase_key.json');
admin.initializeApp({
  credential: admin.credential.cert(require(keyPath))
});

const db = admin.firestore();

async function run() {
  const snapshot = await db.collection('products').get();
  const allKeys = new Set();
  snapshot.forEach(doc => {
    const data = doc.data();
    Object.keys(data).forEach(k => allKeys.add(k));
    
    // Check specific fields on a sample product
    if (doc.id === 'code0001') {
      console.log('Sample product code0001 data:', JSON.stringify(data, null, 2));
    }
  });
  console.log('All unique field keys in Firestore products:', Array.from(allKeys));
}
run().catch(console.error);
