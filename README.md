# Ondar V1 - Simple Nigerian Storefronts

Ondar is a simplified online store platform designed specifically for WhatsApp and Instagram vendors in Nigeria. It eliminates "DM chaos" by providing a structured order flow and professional receipts.

## 🚀 Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Database/Auth:** Supabase
- **Analytics:** PostHog
- **Infrastructure:** Netlify

## 🛠️ Troubleshooting Auth Issues

If you see errors like **"Email rate limit exceeded"** or users aren't getting verification emails:

1.  **Increase Rate Limits:**
    *   Go to **Supabase Dashboard** > **Authentication** > **Settings** > **Auth Providers**.
    *   Find the **Rate Limits** section.
    *   Increase **"Max Emails per Hour"** (default is 3, try 30 for launch).
2.  **Verify Site URL:**
    *   In **Authentication** > **URL Configuration**, ensure **Site URL** is set to `https://ondar.ng`.
    *   Add `https://ondar.ng/**` to the **Redirect URLs** list.
3.  **Check Spam:**
    *   The default Supabase email provider often lands in "Promotions" or "Spam". For production, we should eventually connect a custom SMTP provider (like Resend).

## 📦 Getting Started

```bash
npm install
npm run dev
```

---

Ondar built by Asiegbu Caleb
