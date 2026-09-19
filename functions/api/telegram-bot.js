/**
 * FARAH STORE — Telegram Hybrid Bot (Commands + Gemini AI)
 * 
 * Architecture:
 * - Role-Based Access Control (RBAC) by Chat ID
 * - Commands & Inline Keyboards → instant, no AI quota used
 * - Free-text messages → Gemini AI with graceful fallback
 * - Multi-supplier ready (just add to USERS map)
 */

// ─── CONFIGURATION ────────────────────────────────────────────────────────────

const BOT_TOKEN      = '8278939648:AAE-gvOU5e6JvCIrzcOOcNo2-AE70S4b2tU';

// ─── USER ROLES MAP (Multi-supplier ready — just add new entries) ─────────────
const USERS = {
  '1044745883': { role: 'admin',    name: 'علاء (الأدمن)' },
  '6481778583': { role: 'supplier', name: 'محمود (مخزن الموسكي)', warehouse: 'musky' },
  // Future suppliers:
  // '999999999': { role: 'supplier', name: 'مورد 2 (الإسكندرية)', warehouse: 'alex' },
};

// ─── TELEGRAM API HELPERS ─────────────────────────────────────────────────────

const TG = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMessage(chat_id, text, extra = {}) {
  return fetch(`${TG}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text, parse_mode: 'HTML', ...extra })
  });
}

async function answerCallbackQuery(callback_query_id, text = '') {
  return fetch(`${TG}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id, text, show_alert: false })
  });
}

async function editMessageText(chat_id, message_id, text, extra = {}) {
  return fetch(`${TG}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, message_id, text, parse_mode: 'HTML', ...extra })
  });
}

// ─── INLINE KEYBOARDS ─────────────────────────────────────────────────────────

function adminKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '📋 الطلبات المعلقة (فودافون/انستاباي)', callback_data: 'cmd_pending' }
      ],
      [
        { text: '✅ تأكيد دفع طلب', callback_data: 'cmd_confirm_prompt' },
        { text: '📊 ملخص اليوم', callback_data: 'cmd_summary' }
      ],
      [
        { text: '🤖 اسأل الذكاء الاصطناعي', callback_data: 'cmd_ai_hint' }
      ]
    ]
  };
}

function supplierKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '📦 قائمة التجهيز والتغليف', callback_data: 'cmd_prepare' }
      ],
      [
        { text: '✅ أوردر تم تغليفه', callback_data: 'cmd_packed_prompt' },
        { text: '📊 حالة المخزن', callback_data: 'cmd_stock' }
      ],
      [
        { text: '🤖 اسأل الذكاء الاصطناعي', callback_data: 'cmd_ai_hint' }
      ]
    ]
  };
}

import { getFirebaseAuthToken, fetchPendingOrders, fetchDailySummary, fetchSupplierSummary, fetchReadyOrders, markOrderPacked } from './firebase-rest.js';

async function fetchTelegramFileBase64(fileId) {
  const fileRes = await fetch(`${TG}/getFile?file_id=${fileId}`);
  const fileData = await fileRes.json();
  if (!fileData.ok) return null;
  
  const dlUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
  const dlRes = await fetch(dlUrl);
  const arrayBuffer = await dlRes.arrayBuffer();
  
  // Convert ArrayBuffer to Base64 in Cloudflare Worker
  let binary = '';
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ─── FIRESTORE INTEGRATION ──────────────────────────────────────────────────

async function getAdminToken(context) {
  const email = context.env.FARAH_ADMIN_EMAIL || context.env.ADMIN_EMAIL || 'admin@farahstore.com'; 
  const password = context.env.FARAH_ADMIN_PASSWORD || context.env.ADMIN_PASSWORD; 
  if (!password) {
    throw new Error('Missing FARAH_ADMIN_PASSWORD in Cloudflare env Variables.');
  }
  const token = await getFirebaseAuthToken(email, password);
  if (!token) {
    throw new Error(`Firebase Auth failed for email: ${email}. Check Firebase Users tab.`);
  }
  return token;
}

// ─── GEMINI AI HANDLER ────────────────────────────────────────────────────────

async function askGemini(userMessage, role, apiKey, context = '', mediaData = null) {
  const systemContext = role === 'admin'
    ? `أنت مساعد ذكي لأدمن متجر فرح للعناية بالبشرة. تجيب باللغة العربية العامية المصرية. المتجر يبيع أجهزة وادوات العناية بالبشرة. الأدمن اسمه علاء وهو مسؤول عن المبيعات والمدفوعات والتحكم الكامل. المورد اسمه محمود في الموسكي. وسائل الدفع الإلكترونية: فودافون كاش 01017344345 وانستاباي 01127116395.`
    : `أنت مساعد ذكي لمحمود مسؤول المخزن في متجر فرح للعناية بالبشرة. تجيب باللغة العربية العامية المصرية. مهمتك مساعدة محمود في تجميع وتغليف طلبات متجر فرح. الطلبات المعتمدة فقط هي اللي يشتغل عليها محمود بعد تأكيد الدفع من الأدمن.`;

  const fullPrompt = context
    ? `${systemContext}\n\nبيانات حالية من السيستم:\n${context}\n\nسؤال المستخدم: ${userMessage || '[تسجيل صوتي]'}`
    : `${systemContext}\n\nسؤال المستخدم: ${userMessage || '[تسجيل صوتي]'}`;

  const parts = [];
  if (mediaData) {
    parts.push({
      inlineData: {
        mimeType: mediaData.mimeType,
        data: mediaData.data
      }
    });
  }
  parts.push({ text: fullPrompt });

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        })
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (e) {
    console.error('Gemini error:', e);
    return null;
  }
}

// ─── COMMAND HANDLERS — ADMIN ─────────────────────────────────────────────────

async function handleAdminStart(chat_id, userName, context) {
  const token = await getAdminToken(context);
  const data = token ? await fetchDailySummary(token) : null;
  
  const total   = data ? 'مشفر' : '—'; // REST query doesn't count ALL orders easily
  const pending = data?.pendingPayment ?? '—';
  const today   = data?.todayOrders ?? '—';

  const text = `👋 أهلاً <b>${userName}</b>!
🏪 <b>لوحة تحكم متجر فرح</b>

📊 <b>إحصائيات سريعة:</b>
• طلبات اليوم: <b>${today}</b>
• بانتظار تأكيد الدفع: <b>${pending}</b> 🔴

اختر من القائمة أو اكتب سؤالك بشكل حر 👇`;

  await sendMessage(chat_id, text, { reply_markup: adminKeyboard() });
}

async function handleAdminPending(chat_id, context) {
  const token = await getAdminToken(context);
  if (!token) return sendMessage(chat_id, '⚠️ خطأ في المصادقة مع قاعدة البيانات. تأكد من إضافة ADMIN_PASSWORD.');
  
  const orders = await fetchPendingOrders(token);

  if (!orders || !orders.length) {
    return sendMessage(chat_id,
      '✅ لا توجد طلبات معلقة تحتاج تأكيد الدفع حالياً.',
      { reply_markup: adminKeyboard() }
    );
  }

  let text = `⏳ <b>الطلبات بانتظار تأكيد الدفع (${orders.length})</b>\n${'─'.repeat(30)}\n\n`;
  const buttons = [];

  for (const o of orders) {
    const payIcon = o.paymentMethod === 'vodafone_cash' ? '🔴 فودافون كاش' : '⚡ انستاباي';
    text += `📦 <b>${o.id}</b>\n`;
    text += `👤 ${o.customerName} — ${o.customerPhone}\n`;
    text += `💳 ${payIcon} — <b>${o.total} ج.م</b>\n`;
    text += `📅 ${o.createdAt ? o.createdAt.substring(0, 10) : '—'}\n\n`;
    buttons.push([{ text: `✅ تأكيد دفع ${o.id}`, callback_data: `confirm_${o.id}` }]);
  }

  await sendMessage(chat_id, text, {
    reply_markup: { inline_keyboard: [...buttons, [{ text: '🔙 القائمة الرئيسية', callback_data: 'cmd_start' }]] }
  });
}

async function handleAdminSummary(chat_id, context) {
  const token = await getAdminToken(context);
  if (!token) return sendMessage(chat_id, '⚠️ خطأ في المصادقة مع قاعدة البيانات.');
  
  const data = await fetchDailySummary(token);

  const text = `📊 <b>ملخص اليوم — متجر فرح</b>
${'─'.repeat(30)}

🛍️ طلبات اليوم: <b>${data.todayOrders ?? 0}</b>
💰 مبيعات اليوم: <b>${data.todayRevenue ?? 0} ج.م</b>
✅ طلبات مؤكدة: <b>${data.confirmed ?? 0}</b>
⏳ بانتظار التأكيد: <b>${data.pendingPayment ?? 0}</b>`;

  await sendMessage(chat_id, text, { reply_markup: adminKeyboard() });
}

async function handleConfirmPayment(chat_id, orderId, context) {
  // Update Firestore Document directly via REST PATCH
  const token = await getAdminToken(context);
  if (token) {
    const PROJECT_ID = "farah-store-6bf78";
    await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/orders/${orderId}?updateMask.fieldPaths=status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fields: { status: { stringValue: 'payment_confirmed' } }
        })
      }
    );
  }

  // Notify Mahmoud
  const notifyMahmoud = await sendMessage(
    '6481778583',
    `✅ <b>تم تأكيد الدفع!</b>\n\nالطلب رقم <code>${orderId}</code> مؤكد بواسطة الأدمن.\n📦 يمكنك الآن تجميع وتغليف هذا الطلب وتسليمه لشركة الشحن.`,
    { reply_markup: { inline_keyboard: [[{ text: '✅ تم التغليف والتجهيز', callback_data: `packed_${orderId}` }]] } }
  );

  await sendMessage(chat_id,
    `✅ تم تأكيد دفع الطلب <code>${orderId}</code> بنجاح وتحديثه في قاعدة البيانات!\n🔔 تم إخطار محمود بالمخزن للتجهيز.`,
    { reply_markup: adminKeyboard() }
  );
}

// ─── COMMAND HANDLERS — SUPPLIER (MAHMOUD) ───────────────────────────────────

async function handleSupplierStart(chat_id, userName, context) {
  const token = await getAdminToken(context);
  const data = token ? await fetchSupplierSummary(token) : null;
  const readyCount = data?.readyOrders ?? '—';

  const text = `👋 أهلاً <b>${userName}</b>!
🏪 <b>مخزن الموسكي — متجر فرح</b>

📦 <b>الطلبات الجاهزة للتجميع: ${readyCount}</b>

اختر من القائمة أو اكتب سؤالك بشكل حر 👇`;

  await sendMessage(chat_id, text, { reply_markup: supplierKeyboard() });
}

async function handleSupplierPrepare(chat_id, context) {
  const token = await getAdminToken(context);
  if (!token) return sendMessage(chat_id, '⚠️ خطأ في المصادقة مع قاعدة البيانات.', { reply_markup: supplierKeyboard() });
  
  const orders = await fetchReadyOrders(token);

  if (!orders || !orders.length) {
    return sendMessage(chat_id,
      '📭 لا توجد طلبات معتمدة للتجميع حالياً.\n\n⏳ انتظر تأكيد الأدمن للطلبات الإلكترونية.',
      { reply_markup: supplierKeyboard() }
    );
  }

  let text = `📦 <b>قائمة التجهيز والتغليف (${orders.length} طلبات)</b>\n${'─'.repeat(30)}\n\n`;
  const buttons = [];

  for (const o of orders) {
    text += `🧾 <b>${o.id}</b> — ${o.customerName}\n`;
    text += `📍 ${o.fullAddress || '—'}\n`;
    const items = (o.items || []).map(i => `  🔹 عدد ${i.qty} من منتج: ${i.name}${i.variantSelected ? ` (${Object.values(i.variantSelected).join('/')})` : ''}`).join('\n');
    text += `${items}\n\n`;
    buttons.push([{ text: `✅ تم تغليف ${o.id}`, callback_data: `packed_${o.id}` }]);
  }

  await sendMessage(chat_id, text, {
    reply_markup: { inline_keyboard: [...buttons, [{ text: '🔙 القائمة الرئيسية', callback_data: 'cmd_start' }]] }
  });
}

async function handleSupplierPacked(chat_id, orderId, context) {
  const token = await getAdminToken(context);
  if (token) {
    await markOrderPacked(token, orderId);
  }

  // Notify Admin
  await sendMessage(
    '1044745883',
    `🚚 <b>طلب جاهز للشحن!</b>\n\nالطلب رقم <code>${orderId}</code> تم تجميعه وتغليفه بواسطة المخزن وجاهز لتسليمه لشركة الشحن.`
  );

  await sendMessage(chat_id,
    `✅ تم تسجيل الطلب <code>${orderId}</code> كجاهز للشحن وتحديث قاعدة البيانات.\n📬 تم إخطار الأدمن.`,
    { reply_markup: supplierKeyboard() }
  );
}

async function handleSupplierStock(chat_id, context) {
  const token = await getAdminToken(context);
  if (!token) return sendMessage(chat_id, '⚠️ خطأ في المصادقة مع قاعدة البيانات.', { reply_markup: supplierKeyboard() });
  
  const orders = await fetchReadyOrders(token);
  
  // Aggregate items across all ready orders
  const stockMap = {};
  for (const o of orders) {
    if (o.items) {
      for (const item of o.items) {
        const key = item.variantSelected ? `${item.name} (${Object.values(item.variantSelected).join('/')})` : item.name;
        stockMap[key] = (stockMap[key] || 0) + parseInt(item.qty || 1);
      }
    }
  }

  const keys = Object.keys(stockMap);
  if (!keys.length) {
    return sendMessage(chat_id, '📭 لا توجد منتجات في قائمة الطلبات المعتمدة حالياً.', { reply_markup: supplierKeyboard() });
  }

  let text = `📦 <b>إجمالي المنتجات المطلوبة للتجهيز</b>\n${'─'.repeat(30)}\n\n`;
  for (const key of keys) {
    text += `🔹 ${key}: <b>${stockMap[key]}</b>\n`;
  }

  await sendMessage(chat_id, text, { reply_markup: supplierKeyboard() });
}

// ─── MAIN WEBHOOK HANDLER ─────────────────────────────────────────────────────

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();

    // Handle callback_query (button press)
    if (body.callback_query) {
      const cq       = body.callback_query;
      const chat_id  = String(cq.message?.chat?.id || cq.from?.id);
      const data     = cq.data;
      const user     = USERS[chat_id];

      await answerCallbackQuery(cq.id);

      if (!user) {
        await sendMessage(chat_id, '⛔ غير مصرح لك باستخدام هذا البوت.');
        return new Response('OK');
      }

      // ── Admin callbacks ──
      if (user.role === 'admin') {
        if (data === 'cmd_start')           await handleAdminStart(chat_id, user.name, context);
        else if (data === 'cmd_pending')    await handleAdminPending(chat_id, context);
        else if (data === 'cmd_summary')    await handleAdminSummary(chat_id, context);
        else if (data === 'cmd_ai_hint')    await sendMessage(chat_id, '🤖 اكتب سؤالك بالعامية وهرد عليك فوراً بالذكاء الاصطناعي!\n\nمثال: "كام أوردر فودافون كاش مش مؤكد دلوقتي؟"');
        else if (data === 'cmd_confirm_prompt') await sendMessage(chat_id, '🔢 اكتب رقم الطلب اللي تريد تأكيد دفعه:\n\nمثال: <code>تأكيد ORD-1025</code>');
        else if (data.startsWith('confirm_')) {
          const orderId = data.replace('confirm_', '');
          await handleConfirmPayment(chat_id, orderId, context);
        }
      }

      // ── Supplier callbacks ──
      if (user.role === 'supplier') {
        if (data === 'cmd_start')           await handleSupplierStart(chat_id, user.name, context);
        else if (data === 'cmd_prepare')    await handleSupplierPrepare(chat_id, context);
        else if (data === 'cmd_stock')      await handleSupplierStock(chat_id, context);
        else if (data === 'cmd_ai_hint')    await sendMessage(chat_id, '🤖 اكتب سؤالك بالعامية وهرد عليك فوراً بالذكاء الاصطناعي!\n\nمثال: "الطلبات المطلوب تجهيزها النهاردة كام؟"');
        else if (data === 'cmd_packed_prompt') await sendMessage(chat_id, '🔢 اكتب رقم الطلب اللي تم تغليفه:\n\nمثال: <code>تم التغليف ORD-1025</code>');
        else if (data.startsWith('packed_')) {
          const orderId = data.replace('packed_', '');
          await handleSupplierPacked(chat_id, orderId, context);
        }
      }

      return new Response('OK');
    }

    // Handle regular message
    if (body.message) {
      const msg      = body.message;
      const chat_id  = String(msg.chat?.id);
      const text     = (msg.text || '').trim();
      const user     = USERS[chat_id];

      // Block unauthorized users
      if (!user) {
        await sendMessage(chat_id, '⛔ غير مصرح لك باستخدام هذا البوت.');
        return new Response('OK');
      }

      // ── Command routing (no AI quota) ──
      if (text === '/start' || text === 'start' || text === 'ابدأ') {
        if (user.role === 'admin')    await handleAdminStart(chat_id, user.name, context);
        if (user.role === 'supplier') await handleSupplierStart(chat_id, user.name, context);
        return new Response('OK');
      }

      // Admin text commands
      if (user.role === 'admin') {
        if (text === '/الطلبات_المعلقة' || text === 'الطلبات المعلقة') {
          await handleAdminPending(chat_id, context);
          return new Response('OK');
        }
        if (text === '/ملخص_اليوم' || text === 'ملخص اليوم') {
          await handleAdminSummary(chat_id, context);
          return new Response('OK');
        }
        // تأكيد ORD-XXXX
        const confirmMatch = text.match(/تأكيد\s+(ORD-[\w\d-]+)/i);
        if (confirmMatch) {
          await handleConfirmPayment(chat_id, confirmMatch[1], context);
          return new Response('OK');
        }
      }

      // Supplier text commands
      if (user.role === 'supplier') {
        if (text === '/تجهيز_الطلبات' || text === 'تجهيز الطلبات' || text === 'تجهيز الأوردات' || text === 'تجهيز الاوردرات') {
          await handleSupplierPrepare(chat_id, context);
          return new Response('OK');
        }
        if (text === '/حالة_المخزن' || text === 'حالة المخزن') {
          await handleSupplierStock(chat_id, context);
          return new Response('OK');
        }
        // تم التغليف ORD-XXXX
        const packedMatch = text.match(/تم\s+التغليف\s+(ORD-[\w\d-]+)/i);
        if (packedMatch) {
          await handleSupplierPacked(chat_id, packedMatch[1], context);
          return new Response('OK');
        }
      }

      // ── Fallback: Gemini AI (free-text or voice) ──
      // Show typing indicator
      await fetch(`${TG}/sendChatAction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, action: 'typing' })
      });

      // Try Gemini AI
      const GEMINI_API_KEY = context.env.GEMINI_API_KEY || '';
      
      let mediaData = null;
      if (msg.voice) {
        const base64Audio = await fetchTelegramFileBase64(msg.voice.file_id);
        if (base64Audio) {
          mediaData = {
            mimeType: msg.voice.mime_type || 'audio/ogg',
            data: base64Audio
          };
        }
      }

      if (!text && !mediaData) {
        return new Response('OK');
      }

      const aiReply = await askGemini(text, user.role, GEMINI_API_KEY, '', mediaData);

      if (aiReply) {
        await sendMessage(chat_id,
          `🤖 <b>الذكاء الاصطناعي:</b>\n\n${aiReply}`,
          { reply_markup: user.role === 'admin' ? adminKeyboard() : supplierKeyboard() }
        );
      } else {
        // Graceful fallback — show menu
        const fallbackText = user.role === 'admin'
          ? '⚠️ المساعد الذكي غير متاح الآن. استخدم الأزرار أدناه:'
          : '⚠️ المساعد الذكي غير متاح الآن. استخدم الأزرار أدناه:';
        await sendMessage(chat_id, fallbackText,
          { reply_markup: user.role === 'admin' ? adminKeyboard() : supplierKeyboard() }
        );
      }
    }

    return new Response('OK');
  } catch (err) {
    console.error('Telegram Bot Error:', err);
    try {
      const chat_id = body?.message?.chat?.id || body?.callback_query?.message?.chat?.id;
      if (chat_id) {
         await fetch(`${TG}/sendMessage`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ chat_id, text: `🚨 <b>خطأ برمجي:</b>\n<code>${err.message}</code>\n\nStack:\n<pre>${err.stack}</pre>`, parse_mode: 'HTML' })
         });
      }
    } catch (e) {}
    return new Response('OK'); // Always return 200 to Telegram
  }
}

// ─── GET Handler: set/delete webhook helpers ─────────────────────────────────
export async function onRequestGet(context) {
  const url    = new URL(context.request.url);
  const action = url.searchParams.get('action');

  if (action === 'set_webhook') {
    const webhookUrl = `https://farah-store.pages.dev/api/telegram-bot`;
    const res = await fetch(`${TG}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl, allowed_updates: ['message', 'callback_query'] })
    });
    const data = await res.json();
    return new Response(JSON.stringify(data, null, 2), { headers: { 'Content-Type': 'application/json' } });
  }

  if (action === 'get_webhook') {
    const res = await fetch(`${TG}/getWebhookInfo`);
    const data = await res.json();
    return new Response(JSON.stringify(data, null, 2), { headers: { 'Content-Type': 'application/json' } });
  }

  if (action === 'delete_webhook') {
    const res = await fetch(`${TG}/deleteWebhook`);
    const data = await res.json();
    return new Response(JSON.stringify(data, null, 2), { headers: { 'Content-Type': 'application/json' } });
  }

  return new Response('Farah Store Telegram Bot is running! ✅');
}
