import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const QR_SESSION_FILE = path.join(process.cwd(), 'data', 'qr-sessions.json');

/**
 * GET /api/auth/qr/confirm?token=...
 * Returns an HTML page for the mobile device to enter credentials and confirm the QR login.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new Response('Token fehlt', { status: 400, headers: { 'Content-Type': 'text/plain' } });
  }

  // Verify token exists
  let sessions: Record<string, any> = {};
  try {
    const raw = await fs.readFile(QR_SESSION_FILE, 'utf-8');
    sessions = JSON.parse(raw);
  } catch { /* empty */ }

  const session = sessions[token];
  if (!session) {
    return new Response(renderPage('Token ungültig oder abgelaufen', true), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (session.confirmed) {
    return new Response(renderPage('Dieser QR-Code wurde bereits verwendet.', true), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Return a login form page
  const url = new URL(request.url);
  const apiBase = `${url.protocol}//${url.host}`;

  return new Response(renderLoginPage(token, apiBase), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function renderPage(message: string, isError: boolean): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QR Login — Kitting Suite</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }
    .card { background: white; border-radius: 16px; padding: 32px; max-width: 400px; width: 100%; box-shadow: 0 4px 6px rgba(0,0,0,0.07); text-align: center; }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 18px; color: #0f172a; margin-bottom: 8px; }
    p { font-size: 14px; color: ${isError ? '#ef4444' : '#475569'}; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${isError ? '❌' : '✅'}</div>
    <h1>QR-Code Login</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}

function renderLoginPage(token: string, apiBase: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QR Login — Kitting Suite</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }
    .card { background: white; border-radius: 16px; padding: 32px; max-width: 400px; width: 100%; box-shadow: 0 20px 25px rgba(0,0,0,0.15); }
    .logo { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; justify-content: center; }
    .logo-icon { width: 40px; height: 40px; background: #2563eb; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; }
    h1 { font-size: 20px; color: #0f172a; margin-bottom: 4px; text-align: center; }
    .subtitle { font-size: 14px; color: #64748b; margin-bottom: 24px; text-align: center; }
    .form-group { margin-bottom: 16px; }
    label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 4px; }
    input { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px; transition: border-color 0.2s; }
    input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    button { width: 100%; padding: 12px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    button:hover { background: #1d4ed8; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .error { color: #ef4444; font-size: 13px; margin-bottom: 12px; display: none; padding: 8px 12px; background: #fee2e2; border-radius: 8px; }
    .success { color: #10b981; font-size: 14px; text-align: center; padding: 16px; display: none; }
    .success .check { font-size: 48px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div id="login-form">
      <div class="logo">
        <div class="logo-icon">K</div>
        <span style="font-weight: 600; color: #0f172a;">Kitting Suite</span>
      </div>
      <h1>QR-Code Anmeldung</h1>
      <p class="subtitle">Bestätigen Sie Ihre Identität</p>
      <div id="error" class="error"></div>
      <div class="form-group">
        <label for="email">E-Mail</label>
        <input type="email" id="email" placeholder="ihre@email.de" required autocomplete="email">
      </div>
      <div class="form-group">
        <label for="password">Passwort</label>
        <input type="password" id="password" placeholder="••••••••" required autocomplete="current-password">
      </div>
      <button id="submit" onclick="handleLogin()">Anmeldung bestätigen</button>
    </div>
    <div id="success-view" class="success">
      <div class="check">✅</div>
      <h1>Anmeldung erfolgreich!</h1>
      <p style="color: #64748b; margin-top: 8px;">Sie können dieses Fenster jetzt schließen.<br>Der Browser wird automatisch angemeldet.</p>
    </div>
  </div>
  <script>
    async function handleLogin() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorEl = document.getElementById('error');
      const submitBtn = document.getElementById('submit');

      if (!email || !password) {
        errorEl.textContent = 'Bitte alle Felder ausfüllen.';
        errorEl.style.display = 'block';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird bestätigt...';
      errorEl.style.display = 'none';

      try {
        const res = await fetch('${apiBase}/api/auth/qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: '${token}', email, password }),
        });
        const data = await res.json();

        if (data.success) {
          document.getElementById('login-form').style.display = 'none';
          document.getElementById('success-view').style.display = 'block';
        } else {
          errorEl.textContent = data.error || 'Anmeldung fehlgeschlagen';
          errorEl.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Anmeldung bestätigen';
        }
      } catch (e) {
        errorEl.textContent = 'Verbindungsfehler';
        errorEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Anmeldung bestätigen';
      }
    }

    // Allow Enter key to submit
    document.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });
  </script>
</body>
</html>`;
}
