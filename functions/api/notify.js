export async function onRequestPost(context) {
  try {
    const order = await context.request.json();
    
    // Telegram Bot Details
    const TELEGRAM_BOT_TOKEN = context.env.TELEGRAM_BOT_TOKEN || '8278939648:AAE-gvOU5e6JvCIrzcOOcNo2-AE70S4b2tU';
    const TELEGRAM_CHAT_ID = context.env.TELEGRAM_CHAT_ID || '1044745883';
    const TELEGRAM_SUPPLIER_CHAT_ID = context.env.TELEGRAM_SUPPLIER_CHAT_ID || '6481778583';

    // Google Script URL (Telegram Bot Backend / Sheet Database)
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwExBfgyi4bgDUwnBCfAYZvAgrTfKL5g3bPeZyZt3fB8IAhWD29EwTZdUH0FEQUiMGdow/exec';

    // Facebook CAPI Details
    const FB_PIXEL_ID = context.env.FB_PIXEL_ID || '879537130426521';
    const FB_CAPI_TOKEN = context.env.FB_CAPI_TOKEN || 'EAAZArh2o2arMBSTbaOPCjSEwlEDSVQBOl1XnCxl1nbCqaDbAdeNOzAZBbJrZASaXbT2sSq33V0N3RwVHLVwAlmWcEeR7ZB3ZCpdpHTYR5D19BXVZBGi3pEEUqEsszIg3BnNzp8ZA561E2uvXYsAn1cWFuAVLUY3Gm0AXAO9OARNyzMSjnnRfka5wd7KCb0Di4lL6wZDZD';

    // Format Products list clearly (e.g. عدد 2 من منتج: جهاز ديرما بن)
    const itemsList = (order.items || []).map(item => {
      const qty = item.qty || 1;
      const variantObj = item.variantSelected || item.variant || {};
      const variantVals = Object.values(variantObj).filter(Boolean);
      const variantText = variantVals.length ? ` (${variantVals.join(' / ')})` : '';
      return `🔹 عدد ${qty} من منتج: ${item.name}${variantText}`;
    }).join('\n');

    // Extract address details
    const addr = order.customerAddress || order.customer?.address || {};
    const govLabel = addr.governorate || order.governorate || '';
    const cityLabel = addr.city || '';
    const streetLabel = addr.street || '';
    const fullAddress = [cityLabel, streetLabel, govLabel].filter(Boolean).join(' - ');

    const isElectronicPay = order.paymentMethod === 'vodafone_cash' || order.paymentMethod === 'instapay';
    const payLabel = order.paymentMethod === 'vodafone_cash' ? 'فودافون كاش 🔴' : order.paymentMethod === 'instapay' ? 'انستاباي ⚡' : 'الدفع عند الاستلام 💵';

    // 1. Build Message for Admin
    const adminMessage = `📦 <b>طلب جديد عبر الموقع!</b>
──────────────────────────
رقم الطلب: <code>${order.id}</code>

👤 الاسم: ${order.customerName || '—'}
📱 رقم الموبايل: ${order.customerPhone || '—'}
📍 العنوان: ${fullAddress || '—'}

🛍️ <b>المنتجات المطلوبة:</b>
${itemsList || '—'}

${order.notes ? `📝 ملاحظات: ${order.notes}\n` : ''}──────────────────────────
💳 طريقة الدفع: ${payLabel}
💰 الإجمالي الكلي: <b>${order.total} ج.م</b>
${isElectronicPay ? '\n⚠️ <b>يتطلب مراجعة وتأكيد الدفع قبل الشحن</b>' : ''}`;

    // 2. Build Message for Supplier (Mahmoud)
    const supplierMessage = `📦 <b>طلب جديد للتجميع والتغليف</b>
──────────────────────────
رقم الطلب: <code>${order.id}</code>

👤 الاسم: ${order.customerName || '—'}
📱 رقم الموبايل: ${order.customerPhone || '—'}
📍 العنوان: ${fullAddress || '—'}

🛍️ <b>المنتجات المطلوب تغليفها:</b>
${itemsList || '—'}

${order.notes ? `📝 ملاحظات: ${order.notes}\n` : ''}──────────────────────────
💳 طريقة الدفع: ${payLabel}
${isElectronicPay ? '\n🛑 <b>بانتظار مراجعة الأدمن وتأكيد الدفع — حظر الشحن حالياً</b>' : ''}`;

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    // Admin inline keyboard — quick action buttons on notification
    const adminKeyboard = isElectronicPay
      ? { inline_keyboard: [[
            { text: `✅ تأكيد الدفع — ${order.id}`, callback_data: `confirm_${order.id}` }
          ], [
            { text: '📋 الطلبات المعلقة', callback_data: 'cmd_pending' },
            { text: '📊 ملخص اليوم', callback_data: 'cmd_summary' }
          ]] }
      : { inline_keyboard: [[
            { text: '📋 الطلبات المعلقة', callback_data: 'cmd_pending' },
            { text: '📊 ملخص اليوم', callback_data: 'cmd_summary' }
          ]] };

    // Supplier inline keyboard on notification
    const supplierKeyboard = isElectronicPay
      ? { inline_keyboard: [[
            { text: '📦 عرض قائمة التجهيز', callback_data: 'cmd_prepare' }
          ]] }
      : { inline_keyboard: [[
            { text: `✅ تم تغليف ${order.id}`, callback_data: `packed_${order.id}` }
          ], [
            { text: '📦 عرض قائمة التجهيز', callback_data: 'cmd_prepare' }
          ]] };

    // Notify Admin
    await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: adminMessage,
        parse_mode: 'HTML',
        reply_markup: adminKeyboard
      })
    }).catch(e => console.error('Telegram Admin Error:', e));

    // Notify Supplier (Mahmoud)
    await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_SUPPLIER_CHAT_ID,
        text: supplierMessage,
        parse_mode: 'HTML',
        reply_markup: supplierKeyboard
      })
    }).catch(e => console.error('Telegram Supplier Error:', e));

    // 3. (Removed Google Script forwarding - Using Firestore REST API directly in Bot now)

    // 4. Send Facebook Conversions API (Purchase Event)
    if (FB_CAPI_TOKEN && FB_PIXEL_ID) {
      const fbUrl = `https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events?access_token=${FB_CAPI_TOKEN}`;
      
      const fbPayload = {
        data: [
          {
            event_name: "Purchase",
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            user_data: {
              client_ip_address: context.request.headers.get("cf-connecting-ip") || context.request.headers.get("x-forwarded-for") || null,
              client_user_agent: context.request.headers.get("user-agent") || null,
            },
            custom_data: {
              currency: "EGP",
              value: parseFloat(order.total) || 0,
              order_id: order.id,
              num_items: (order.items || []).length,
            }
          }
        ]
      };

      await fetch(fbUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fbPayload)
      }).catch(e => console.error('FB CAPI Error:', e));
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
