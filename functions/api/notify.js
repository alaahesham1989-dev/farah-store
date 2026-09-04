export async function onRequestPost(context) {
  try {
    const order = await context.request.json();
    
    // Telegram Bot Details
    const TELEGRAM_BOT_TOKEN = context.env.TELEGRAM_BOT_TOKEN || '8278939648:AAE-gvOU5e6JvCIrzcOOcNo2-AE70S4b2tU';
    const TELEGRAM_CHAT_ID = context.env.TELEGRAM_CHAT_ID || '1044745883';
    const TELEGRAM_SUPPLIER_CHAT_ID = context.env.TELEGRAM_SUPPLIER_CHAT_ID || '6481778583';

    // Facebook CAPI Details
    const FB_PIXEL_ID = context.env.FB_PIXEL_ID || '879537130426521';
    const FB_CAPI_TOKEN = context.env.FB_CAPI_TOKEN || 'EAAZArh2o2arMBSTbaOPCjSEwlEDSVQBOl1XnCxl1nbCqaDbAdeNOzAZBbJrZASaXbT2sSq33V0N3RwVHLVwAlmWcEeR7ZB3ZCpdpHTYR5D19BXVZBGi3pEEUqEsszIg3BnNzp8ZA561E2uvXYsAn1cWFuAVLUY3Gm0AXAO9OARNyzMSjnnRfka5wd7KCb0Di4lL6wZDZD';

    // 1. Send Telegram Notifications
    const message = `🛍️ **طلب جديد عبر الموقع!**
رقم الطلب: \`${order.id}\`
العميل: ${order.customerName}
الموبايل: ${order.customerPhone}
الإجمالي: ${order.total} ج.م
طريقة الدفع: ${order.paymentMethod === 'vodafone_cash' ? 'فودافون كاش 🔴' : order.paymentMethod === 'instapay' ? 'انستاباي ⚡' : 'الدفع عند الاستلام 💵'}

للتفاصيل كاملة، افتح لوحة التحكم.`;

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    // Notify Admin
    await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    }).catch(e => console.error('Telegram Admin Error:', e));

    // Notify Supplier
    await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_SUPPLIER_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    }).catch(e => console.error('Telegram Supplier Error:', e));

    // 2. Send Facebook Conversions API (Purchase Event)
    if (FB_CAPI_TOKEN && FB_PIXEL_ID) {
      const fbUrl = `https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events?access_token=${FB_CAPI_TOKEN}`;
      
      const fbPayload = {
        data: [
          {
            event_name: "Purchase",
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            user_data: {
              client_ip_address: context.request.headers.get("cf-connecting-ip") || context.request.headers.get("x-forwarded-for"),
              client_user_agent: context.request.headers.get("user-agent"),
              ph: [ // Hash phone number (SHA-256) - simplified for edge
                 // Ideally this should be hashed, but we send as is or skip if no crypto library
                 // Since standard crypto is needed for hashing, we might just omit PII or send unhashed (FB might reject unhashed PII)
              ]
            },
            custom_data: {
              currency: "EGP",
              value: parseFloat(order.total) || 0,
              order_id: order.id
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
