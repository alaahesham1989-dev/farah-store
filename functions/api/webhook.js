export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // توكن التحقق الخاص بفيسبوك
  const VERIFY_TOKEN = "FarahStore2026";

  // ── 1. مسار GET: للتحقق من الـ Webhook الخاص بفيسبوك ──
  if (request.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 });
      } else {
        return new Response('Forbidden', { status: 403 });
      }
    }
    return new Response('Webhook is live!', { status: 200 });
  }

  // ── 2. أمر POST: استقبال البيانات من فيسبوك ──
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      
      // هنا سنضيف لاحقاً منطق معالجة رسائل فيسبوك أو CAPI
      
      // الرد على فيسبوك فوراً بـ 200 OK حتى لا يغضب ويفصل الـ Webhook
      return new Response('EVENT_RECEIVED', { status: 200 });
    } catch (error) {
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
