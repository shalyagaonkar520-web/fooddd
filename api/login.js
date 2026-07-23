export default function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email = '', password = '' } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminAuthToken = process.env.ADMIN_AUTH_TOKEN || 'admin-session-authenticated-token';

    if (!adminEmail || !adminPassword) {
      return res.status(500).json({ success: false, message: 'Server admin credentials not configured' });
    }

    if (email.trim().toLowerCase() === adminEmail.trim().toLowerCase() && password.trim() === adminPassword.trim()) {
      return res.status(200).json({
        success: true,
        token: adminAuthToken,
        user: {
          id: 'admin-1',
          name: 'Super Admin',
          email: adminEmail,
          role: 'super_admin'
        }
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Invalid request body' });
  }
}
