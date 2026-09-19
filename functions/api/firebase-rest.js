/**
 * Firebase Firestore REST API Helper for Cloudflare Pages (Telegram Bot)
 */
const FIREBASE_API_KEY = "AIzaSyBDwd_eWbUAOf34ttXik5sw909ZEgrCD6o";
const PROJECT_ID = "farah-store-6bf78";

// Cache the token in memory during the isolate lifetime
let cachedIdToken = null;
let tokenExpiration = 0;

export async function getFirebaseAuthToken(email, password) {
  if (cachedIdToken && Date.now() < tokenExpiration) {
    return cachedIdToken;
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    }
  );

  const data = await res.json();
  if (data.idToken) {
    cachedIdToken = data.idToken;
    tokenExpiration = Date.now() + (parseInt(data.expiresIn) * 1000) - 60000; // 1 min buffer
    return cachedIdToken;
  }
  
  console.error("Firebase Auth Error:", data);
  return null;
}

export async function fetchPendingOrders(idToken) {
  const query = {
    structuredQuery: {
      from: [{ collectionId: "orders" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "status" },
          op: "EQUAL",
          value: { stringValue: "pending_payment" }
        }
      }
    }
  };

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(query)
    }
  );

  const data = await res.json();
  // Transform Firestore REST format to simple JSON
  const orders = [];
  if (Array.isArray(data) && data[0]?.document) {
    data.forEach(item => {
      const doc = item.document;
      if (doc && doc.fields) {
        orders.push({
          id: doc.name.split('/').pop(),
          customerName: doc.fields.customerName?.stringValue,
          customerPhone: doc.fields.customerPhone?.stringValue,
          total: doc.fields.total?.numberValue || doc.fields.total?.stringValue,
          paymentMethod: doc.fields.paymentMethod?.stringValue,
          createdAt: doc.fields.createdAt?.stringValue
        });
      }
    });
  }
  return orders;
}

export async function fetchDailySummary(idToken) {
  // Simplified summary by fetching all recent orders and filtering
  const today = new Date().toISOString().split('T')[0];
  
  const query = {
    structuredQuery: {
      from: [{ collectionId: "orders" }],
      orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
      limit: 100 // Fetch last 100 orders for summary
    }
  };

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(query)
    }
  );

  const data = await res.json();
  let todayOrders = 0;
  let todayRevenue = 0;
  let pendingPayment = 0;
  let confirmed = 0;

  if (Array.isArray(data) && data[0]?.document) {
    data.forEach(item => {
      const fields = item.document?.fields;
      if (!fields) return;
      
      const createdAt = fields.createdAt?.stringValue || '';
      const status = fields.status?.stringValue || '';
      const total = Number(fields.total?.numberValue || fields.total?.stringValue || 0);

      if (createdAt.startsWith(today)) {
        todayOrders++;
        todayRevenue += total;
      }
      
      if (status === 'pending_payment') pendingPayment++;
      if (status === 'payment_confirmed') confirmed++;
    });
  }

  return { todayOrders, todayRevenue, pendingPayment, confirmed };
}

export async function fetchReadyOrders(idToken) {
  // We need to fetch orders that are either 'new' or 'payment_confirmed'
  // Since Firestore REST API requires composite indexes for OR queries if not simple,
  // we can fetch recent orders and filter in memory, or use IN query.
  const query = {
    structuredQuery: {
      from: [{ collectionId: "orders" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "status" },
          op: "IN",
          value: { arrayValue: { values: [{ stringValue: "new" }, { stringValue: "payment_confirmed" }] } }
        }
      }
    }
  };

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
      body: JSON.stringify(query)
    }
  );

  const data = await res.json();
  const orders = [];
  if (Array.isArray(data) && data[0]?.document) {
    data.forEach(item => {
      const doc = item.document;
      if (doc && doc.fields) {
        // Build items array
        let items = [];
        if (doc.fields.items && doc.fields.items.arrayValue && doc.fields.items.arrayValue.values) {
          items = doc.fields.items.arrayValue.values.map(v => {
            const iMap = v.mapValue.fields;
            return {
              qty: iMap.qty?.numberValue || iMap.qty?.stringValue,
              name: iMap.name?.stringValue,
              variantSelected: iMap.variantSelected?.mapValue?.fields 
                ? Object.keys(iMap.variantSelected.mapValue.fields).reduce((acc, k) => {
                    acc[k] = iMap.variantSelected.mapValue.fields[k].stringValue; return acc;
                  }, {}) 
                : null
            };
          });
        }
        
        orders.push({
          id: doc.name.split('/').pop(),
          customerName: doc.fields.customerName?.stringValue,
          fullAddress: `${doc.fields.address?.mapValue?.fields?.governorate?.stringValue || ''}, ${doc.fields.address?.mapValue?.fields?.city?.stringValue || ''} - ${doc.fields.address?.mapValue?.fields?.street?.stringValue || ''}`,
          items
        });
      }
    });
  }
  return orders;
}

export async function fetchSupplierSummary(idToken) {
  const orders = await fetchReadyOrders(idToken);
  return { readyOrders: orders.length };
}

export async function markOrderPacked(idToken, orderId) {
  await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/orders/${orderId}?updateMask.fieldPaths=status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        fields: { status: { stringValue: 'ready_for_shipping' } }
      })
    }
  );
}
