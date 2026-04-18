require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ──
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── RATE LIMITING ──
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// ── SUBSCRIBERS STORE (JSON file-based persistence) ──
const SUBSCRIBERS_FILE = path.join(__dirname, 'data', 'subscribers.json');

function loadSubscribers() {
  try {
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
      fs.mkdirSync(path.join(__dirname, 'data'));
    }
    if (!fs.existsSync(SUBSCRIBERS_FILE)) {
      fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([]));
      return [];
    }
    return JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf8'));
  } catch (err) {
    console.error('Error loading subscribers:', err);
    return [];
  }
}

function saveSubscribers(subscribers) {
  try {
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
  } catch (err) {
    console.error('Error saving subscribers:', err);
  }
}

// ── EMAIL TRANSPORTER ──
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS  // Gmail App Password
    }
  });
}

// ── NEWSLETTER EMAIL TEMPLATE ──
function getNewsletterHTML(month, year) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin: 0; padding: 0; background: #0a0c0f; font-family: Georgia, serif; color: #e8eaf0; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #111418; }
    .header { background: #111418; padding: 40px; border-bottom: 1px solid #22282f; text-align: center; }
    .logo { font-size: 28px; font-weight: 900; color: #00e5a0; letter-spacing: -0.02em; }
    .tag { font-size: 11px; color: #6b7588; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 4px; }
    .hero-section { padding: 48px 40px; text-align: center; border-bottom: 1px solid #22282f; }
    .month-label { font-size: 11px; color: #00e5a0; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 12px; }
    .hero-section h1 { font-size: 32px; font-weight: 900; color: #e8eaf0; margin: 0 0 16px; }
    .hero-section p { font-size: 16px; color: #8090a8; line-height: 1.7; margin: 0; }
    .content { padding: 40px; }
    .section { margin-bottom: 36px; }
    .section-title { font-size: 13px; color: #00e5a0; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 16px; border-bottom: 1px solid #22282f; padding-bottom: 8px; }
    .section p { font-size: 15px; color: #a0aabb; line-height: 1.8; margin: 0 0 12px; }
    .update-item { background: #181c22; border: 1px solid #22282f; border-left: 3px solid #00e5a0; padding: 16px 20px; margin-bottom: 12px; }
    .update-title { font-size: 15px; font-weight: bold; color: #e8eaf0; margin-bottom: 4px; }
    .update-desc { font-size: 14px; color: #8090a8; }
    .cta-section { background: #181c22; padding: 32px 40px; text-align: center; border-top: 1px solid #22282f; border-bottom: 1px solid #22282f; }
    .cta-btn { display: inline-block; padding: 14px 32px; background: #00e5a0; color: #0a0c0f; font-size: 13px; font-weight: bold; text-decoration: none; letter-spacing: 0.08em; }
    .footer { padding: 32px 40px; text-align: center; }
    .footer p { font-size: 12px; color: #6b7588; margin: 0 0 8px; }
    .footer a { color: #00e5a0; text-decoration: none; }
    .divider { height: 1px; background: #22282f; margin: 24px 0; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="logo">Peerace</div>
    <div class="tag">Monthly Update · ${month} ${year}</div>
  </div>

  <div class="hero-section">
    <div class="month-label">📬 ${month} ${year} Newsletter</div>
    <h1>What I've Been Building</h1>
    <p>Here's a roundup of my latest projects, learnings, and experiments in engineering and software development.</p>
  </div>

  <div class="content">
    <div class="section">
      <div class="section-title">🔧 This Month's Projects</div>
      <div class="update-item">
        <div class="update-title">Portfolio Website — Launched!</div>
        <div class="update-desc">Built a full-stack portfolio with Node.js backend, newsletter subscription system, and contact form. You're reading this newsletter because of it!</div>
      </div>
      <div class="update-item">
        <div class="update-title">Vickayor School Management System</div>
        <div class="update-desc">Continuing work on the backend — role-based access control, session management, and email integration nearly complete.</div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="section">
      <div class="section-title">📚 What I'm Learning</div>
      <p>This month I've been deep in <strong style="color:#e8eaf0">Node.js backend fundamentals</strong> — HTTP routing, PBKDF2 password hashing, rate limiting, and now nodemailer integration.</p>
      <p>On the hardware side, wrapping up BJT amplifier analysis (Common-Emitter, Common-Base, Common-Collector) and AC/DC load line analysis for EEE 302.</p>
    </div>

    <div class="divider"></div>

    <div class="section">
      <div class="section-title">⚡ Electronics Experiment</div>
      <p>Running LTspice simulations on a <strong style="color:#e8eaf0">microcontroller-based pressure monitoring circuit</strong>. Bridging SPICE simulation with real embedded code is genuinely exciting.</p>
    </div>
  </div>

  <div class="cta-section">
    <p style="font-size:15px; color:#a0aabb; margin-bottom:20px;">Want to see my full portfolio, projects, and circuit work?</p>
    <a href="https://github.com/Peerace" class="cta-btn">VISIT MY GITHUB →</a>
  </div>

  <div class="footer">
    <p>You're receiving this because you subscribed to Peerace's monthly newsletter.</p>
    <p>Babalola John Praise · OAU Ile-Ife, Nigeria</p>
    <p style="margin-top:12px;">
      <a href="UNSUBSCRIBE_LINK">Unsubscribe</a> · <a href="https://github.com/Peerace">GitHub</a>
    </p>
  </div>
</div>
</body>
</html>`;
}

// ── WELCOME EMAIL TEMPLATE ──
function getWelcomeHTML(email) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { margin:0; padding:0; background:#0a0c0f; font-family:Georgia, serif; color:#e8eaf0; }
    .wrapper { max-width:600px; margin:0 auto; background:#111418; }
    .header { padding:40px; border-bottom:1px solid #22282f; text-align:center; }
    .logo { font-size:28px; font-weight:900; color:#00e5a0; }
    .body { padding:48px 40px; }
    .body h2 { font-size:26px; margin-bottom:16px; }
    .body p { font-size:16px; color:#a0aabb; line-height:1.8; margin-bottom:16px; }
    .highlight { color:#00e5a0; font-weight:bold; }
    .cta { display:inline-block; margin-top:20px; padding:14px 32px; background:#00e5a0; color:#0a0c0f; font-weight:bold; text-decoration:none; font-size:13px; letter-spacing:0.08em; }
    .footer { padding:24px 40px; border-top:1px solid #22282f; text-align:center; font-size:12px; color:#6b7588; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="header"><div class="logo">Peerace</div></div>
  <div class="body">
    <h2>Welcome to the Newsletter! 🎉</h2>
    <p>Hey there! Thanks for subscribing. I'm <span class="highlight">Peerace</span> — an EEE student and full-stack developer at Obafemi Awolowo University, Nigeria.</p>
    <p>Every month you'll get updates on my <strong style="color:#e8eaf0">engineering projects</strong>, <strong style="color:#e8eaf0">software builds</strong>, electronics experiments, and learning journey.</p>
    <p>First newsletter drops on the 1st of next month. Watch your inbox!</p>
    <a href="https://github.com/Peerace" class="cta">VIEW MY GITHUB →</a>
  </div>
  <div class="footer">Babalola John Praise · OAU Ile-Ife, Nigeria<br/><a href="UNSUBSCRIBE_LINK" style="color:#6b7588">Unsubscribe</a></div>
</div>
</body>
</html>`;
}

// ── API: SUBSCRIBE ──
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  const subscribers = loadSubscribers();
  if (subscribers.find(s => s.email === email)) {
    return res.status(409).json({ message: 'This email is already subscribed.' });
  }

  subscribers.push({ email, subscribedAt: new Date().toISOString() });
  saveSubscribers(subscribers);

  // Send welcome email
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Peerace Newsletter" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Welcome to Peerace\'s Monthly Newsletter!',
      html: getWelcomeHTML(email)
    });
    console.log(`✅ Welcome email sent to: ${email}`);
  } catch (err) {
    console.error('Welcome email error:', err.message);
    // Still return success - subscriber is saved even if welcome email fails
  }

  return res.status(200).json({ message: 'Successfully subscribed!' });
});

// ── API: CONTACT FORM ──
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required.' });
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `📩 Portfolio Contact: ${subject || 'New message'} — from ${name}`,
      html: `
        <div style="font-family:Georgia,serif;background:#0a0c0f;color:#e8eaf0;padding:40px;max-width:600px;margin:0 auto;">
          <h2 style="color:#00e5a0;margin-bottom:24px;">New Contact Message</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
          <hr style="border-color:#22282f;margin:24px 0;"/>
          <p style="color:#a0aabb;line-height:1.8;">${message.replace(/\n/g, '<br>')}</p>
          <hr style="border-color:#22282f;margin:24px 0;"/>
          <p style="font-size:12px;color:#6b7588;">Sent via Portfolio Contact Form</p>
        </div>
      `
    });
    return res.status(200).json({ message: 'Message sent!' });
  } catch (err) {
    console.error('Contact email error:', err.message);
    return res.status(500).json({ message: 'Could not send message. Please try email directly.' });
  }
});

// ── API: UNSUBSCRIBE ──
app.get('/api/unsubscribe', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).send('Invalid unsubscribe link.');

  let subscribers = loadSubscribers();
  const initial = subscribers.length;
  subscribers = subscribers.filter(s => s.email !== email);

  if (subscribers.length < initial) {
    saveSubscribers(subscribers);
    res.send('<html><body style="font-family:Georgia;background:#0a0c0f;color:#e8eaf0;text-align:center;padding:80px"><h2 style="color:#00e5a0">Unsubscribed ✓</h2><p>You have been removed from the newsletter.</p></body></html>');
  } else {
    res.status(404).send('<html><body style="font-family:Georgia;background:#0a0c0f;color:#e8eaf0;text-align:center;padding:80px"><h2>Email not found</h2></body></html>');
  }
});

// ── MONTHLY NEWSLETTER CRON JOB ──
// Runs on the 1st of every month at 9:00 AM
cron.schedule('0 9 1 * *', async () => {
  console.log('📬 Running monthly newsletter job...');
  const subscribers = loadSubscribers();

  if (subscribers.length === 0) {
    console.log('No subscribers to email.');
    return;
  }

  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();

  const transporter = createTransporter();
  let sent = 0, failed = 0;

  for (const subscriber of subscribers) {
    try {
      const unsubLink = `${process.env.SITE_URL || 'http://localhost:' + PORT}/api/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
      const html = getNewsletterHTML(month, year).replace('UNSUBSCRIBE_LINK', unsubLink);

      await transporter.sendMail({
        from: `"Peerace Monthly" <${process.env.EMAIL_USER}>`,
        to: subscriber.email,
        subject: `📬 Peerace Monthly Update — ${month} ${year}`,
        html
      });
      sent++;
      console.log(`  ✅ Sent to: ${subscriber.email}`);
      // Small delay between emails to avoid spam triggers
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      failed++;
      console.error(`  ❌ Failed for ${subscriber.email}: ${err.message}`);
    }
  }

  console.log(`📬 Newsletter done. Sent: ${sent}, Failed: ${failed}`);
});

// ── ADMIN: SUBSCRIBER COUNT (optional) ──
app.get('/api/admin/subscribers', (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const subscribers = loadSubscribers();
  res.json({ count: subscribers.length, subscribers });
});

// ── CATCH ALL: Serve index.html ──
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── START SERVER ──
app.listen(PORT, () => {
  console.log(`\n🚀 Peerace Portfolio running on http://localhost:${PORT}`);
  console.log(`📬 Newsletter cron: 1st of every month at 9:00 AM`);
  console.log(`📁 Subscribers stored at: ${SUBSCRIBERS_FILE}\n`);
});

module.exports = app;
