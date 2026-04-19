import { createClient } from 'redis';
import nodemailer from 'nodemailer';
import he from 'he';

const getClientIp = (req) => {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) return xff.split(',')[0].trim();
  if (Array.isArray(xff) && xff.length > 0) return String(xff[0]).split(',')[0].trim();
  if (req.socket?.remoteAddress) return req.socket.remoteAddress;
  return 'unknown';
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const requiredEnvVars = ['SMTP_USER', 'SMTP_PASS'];
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
  const redisUrl = process.env.KV_URL || process.env.REDIS_URL;
  if (!redisUrl) missingVars.push('KV_URL|REDIS_URL');

  if (missingVars.length > 0) {
    return res.status(500).json({ message: 'Server misconfigured' });
  }

  const ip = getClientIp(req);
  const client = createClient({ url: redisUrl });
  client.on('error', () => undefined);

  try {
    await client.connect();
    const key = `rate_limit:${ip}`;
    const requests = await client.incr(key);
    if (requests === 1) await client.expire(key, 60);
    if (requests > 3) return res.status(429).json({ message: 'Troppi tentativi. Riprova tra poco.' });
  } catch {
    return res.status(503).json({ message: 'Servizio temporaneamente non disponibile. Riprova più tardi.' });
  } finally {
    if (client.isOpen) await client.quit().catch(() => undefined);
  }

  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  const rawName = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const rawEmail = typeof req.body.email === 'string' ? req.body.email.trim() : '';
  const rawSubject = typeof req.body.subject === 'string' ? req.body.subject.trim() : '';
  const rawMessage = typeof req.body.message === 'string' ? req.body.message.trim() : '';

  if (!rawName || !rawEmail || !rawMessage) {
    return res.status(400).json({ message: 'Campi obbligatori mancanti.' });
  }

  if (rawName.length > 100) return res.status(400).json({ message: 'Nome troppo lungo (max 100 caratteri).' });
  if (rawEmail.length > 100) return res.status(400).json({ message: 'Email troppo lunga (max 100 caratteri).' });
  if (rawSubject.length > 150) return res.status(400).json({ message: 'Oggetto troppo lungo (max 150 caratteri).' });
  if (rawMessage.length > 5000) return res.status(400).json({ message: 'Messaggio troppo lungo (max 5000 caratteri).' });

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(rawEmail)) return res.status(400).json({ message: 'Email non valida.' });

  const headerName = rawName.replace(/[\r\n"]/g, ' ').trim();
  const safeName = he.escape(rawName);
  const safeEmail = he.escape(rawEmail);
  const safeMessage = he.escape(rawMessage).replace(/\n/g, '<br>');
  const safeSubject = rawSubject ? he.escape(rawSubject) : `Nuovo messaggio da ${safeName} - Tech My House`;

  const to = process.env.CONTACT_TO || 'info@techmyhouse.it';

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"${headerName}" <${process.env.SMTP_USER}>`,
      to,
      replyTo: rawEmail,
      subject: safeSubject,
      text: `Nome: ${rawName}\nEmail: ${rawEmail}\n\nMessaggio:\n${rawMessage}`,
      html: `
        <h3>Nuovo messaggio dal sito Tech My House</h3>
        <p><strong>Nome:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Oggetto:</strong> ${safeSubject}</p>
        <p><strong>Messaggio:</strong></p>
        <div style="padding: 12px; border-left: 4px solid #eee; background-color: #f9f9f9;">
          ${safeMessage}
        </div>
      `,
    });

    return res.status(200).json({ message: 'Email inviata.' });
  } catch {
    return res.status(500).json({ message: 'Errore durante l’invio. Riprova.' });
  }
}

