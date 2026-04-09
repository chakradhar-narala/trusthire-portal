# TrustHire Deployment Guide

Follow these steps to deploy the TrustHire platform live.

## 1. Push Code to GitHub
We have already initialized Git. Now you need to create a private repository on GitHub and push your code:

```bash
# In the root project folder:
git add .
git commit -m "Initialize production-ready deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

## 2. Deploy Backend (Render)
Go to [Render.com](https://render.com) and create a new **Web Service**:
- **Repository**: Link your GitHub repo.
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `MONGO_URI`: Your MongoDB Atlas connection string.
  - `JWT_SECRET`: A long random string.
  - `STRIPE_SECRET_KEY`: Your live Stripe secret key.
  - `EMAIL_PASS`: App password for your notification email.
  - `FRONTEND_URL`: `https://your-frontend.vercel.app` (Add this AFTER deploying the frontend).

---

## 3. Deploy Frontend (Vercel)
Go to [Vercel.com](https://vercel.com) and create a **New Project**:
- **Repository**: Link your GitHub repo.
- **Root Directory**: `frontend`
- **Framework Preset**: Vite
- **Environment Variables**:
  - `VITE_API_URL`: `https://your-backend.onrender.com/api` (The URL of your Render service).

---

## 4. Final Updates
1. **Update CORS**: Once the backend is deployed, go to the Render dashboard and update the `FRONTEND_URL` environment variable with your Vercel URL.
2. **Stripe Webhook**: In your Stripe Dashboard, set the Webhook URL to: `https://your-backend.onrender.com/api/payments/webhook`.

---

> [!CAUTION]
> Never share your `.env` file or commit it to Git. Ensure you set the variables directly in the Render and Vercel dashboards.
