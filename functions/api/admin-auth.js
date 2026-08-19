export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { email, password } = body || {};
    
    // في Cloudflare Pages، المتغيرات البيئية تكون داخل context.env
    const ADMIN_EMAIL = context.env.FARAH_ADMIN_EMAIL;
    const ADMIN_PASSWORD = context.env.FARAH_ADMIN_PASSWORD;
    
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ message: 'Server configuration error: admin credentials are not configured.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'Email and password are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return new Response(JSON.stringify({ message: 'غير مصرح بالدخول لهذا المستخدم.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ message: 'كلمة المرور غير صحيحة.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ message: 'Authenticated' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Bad Request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
