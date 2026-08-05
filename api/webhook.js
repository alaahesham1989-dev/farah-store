export default async function handler(req, res) {
  // توكن التحقق (سنضعه في إعدادات فيسبوك لاحقاً للتأكد من هويتنا)
  const VERIFY_TOKEN = "FarahStore2026";

  // ── 1. مسار GET: للتحقق من الـ Webhook الخاص بفيسبوك ──
  if (req.method === 'GET') {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        return res.status(200).send(challenge);
      } else {
        return res.status(403).send('Forbidden');
      }
    }
    return res.status(200).send('Webhook is live!');
  }

  // 2. أمر POST: استقبال الداتا من الموقع (أوردر جديد) أو من تليجرام وإرسالها إلى سكريبت جوجل
  if (req.method === 'POST') {
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxnobWXg4W-2dwaoJGw7WyUiUfhHiyC1285qpcRo0x0QE7w74d8kNwSk6i3Dyvh0HWOQ/exec";

    try {
      // إرسال البيانات فوراً إلى جوجل شيت دون انتظار الرد
      // Vercel سيدير الـ 302 Redirect بذكاء
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
      });
      
      // الرد على فيسبوك فوراً بـ 200 OK حتى لا يغضب ويفصل الـ Webhook
      return res.status(200).send('EVENT_RECEIVED');
      
    } catch (error) {
      console.error('Error forwarding to Google Script:', error);
      return res.status(500).send('Internal Server Error');
    }
  }

  // دعم الطرق الأخرى إن وجدت
  return res.status(405).send('Method Not Allowed');
}
