# 🚀 Peerace Portfolio

A responsive full-stack portfolio website with a **monthly newsletter system**, contact form, and subscriber management — built with Node.js and Express.

**Live at:** `https://github.com/Peerace`

---

## 📁 Project Structure

```
portfolio/
├── public/
│   ├── index.html          ← Frontend (the portfolio website)
│   └── images/
│       └── profile.jpg     ← Your photo
├── data/
│   └── subscribers.json    ← Auto-created, stores subscriber emails
├── server.js               ← Express backend + cron job
├── .env.example            ← Copy to .env and fill in values
├── .env                    ← YOUR SECRET CONFIG (never commit this)
├── .gitignore
├── package.json
└── README.md
```

---

## ⚡ Quick Start (Local)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/portfolio.git
cd portfolio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

```
PORT=3000
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
ADMIN_KEY=some-secret-key
SITE_URL=http://localhost:3000
```

> **Getting Gmail App Password:**
> 1. Go to your Google Account → Security
> 2. Enable 2-Step Verification (if not already)
> 3. Go to Security → App passwords
> 4. Create an app password for "Mail"
> 5. Copy the 16-character password into `EMAIL_PASS`

### 4. Run the server

```bash
npm start
```

Visit **http://localhost:3000** 🎉

---

## 📬 Newsletter System

The newsletter cron job runs automatically on the **1st of every month at 9:00 AM**.

- Subscribers are stored in `data/subscribers.json`
- A welcome email is sent immediately when someone subscribes
- Monthly newsletter emails go to all subscribers
- Unsubscribe links are embedded in every email

### Manually trigger newsletter (for testing)

Edit `server.js` and temporarily change the cron schedule to run in a few seconds:
```js
cron.schedule('*/1 * * * *', async () => { ... }); // every minute for testing
```

---

## 🌐 Deploying to Railway / Render (Free)

### Option A: Railway
1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add environment variables in Railway dashboard
4. Done — your app gets a public URL

### Option B: Render
1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set Start Command: `node server.js`
5. Add env variables

### Option C: GitHub Pages (frontend only)
> Note: GitHub Pages is **static only** — the Node.js backend won't run.
> Use Railway/Render for the full backend. Put the URL in `SITE_URL` in your `.env`.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/subscribe` | Subscribe an email |
| `POST` | `/api/contact` | Send contact form message |
| `GET` | `/api/unsubscribe?email=...` | Unsubscribe an email |
| `GET` | `/api/admin/subscribers` | View all subscribers (requires `x-admin-key` header) |

---

## 🛠️ Customising Your Content

Open `public/index.html` and update:
- **Hero section**: Name, title, description
- **Projects**: Add/edit project cards
- **Achievements**: Update timeline items
- **Contact links**: Update email, GitHub, LinkedIn URLs
- **Footer**: Update name and links

Open `server.js` and update `getNewsletterHTML()` to customise the monthly email content.

---

## 🔒 Security Notes

- Never commit `.env` to GitHub (it's in `.gitignore`)
- Use Gmail App Passwords, not your real password
- The admin endpoint requires a secret key
- Rate limiting protects API endpoints (10 requests / 15 min)

---

## 👨‍💻 Built By

**Babalola John Praise (Peerace)**  
EEE Student · Obafemi Awolowo University, Ile-Ife  
GitHub: [@Peerace](https://github.com/Peerace)
