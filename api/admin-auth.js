export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body || {};
  const ADMIN_EMAIL = process.env.FARAH_ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.FARAH_ADMIN_PASSWORD;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return res.status(500).json({ message: 'Server configuration error: admin credentials are not configured.' });
  }

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return res.status(403).json({ message: 'غير مصرح بالدخول لهذا المستخدم.' });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'كلمة المرور غير صحيحة.' });
  }

  return res.status(200).json({ message: 'Authenticated' });
}
