# CancerGuard AI Deployment Guide

Your frontend is now live on Vercel! However, since the **AI Backend** is still only running on your local laptop (`localhost:8000`), the Vercel app won't be able to scan images yet. 

We need to deploy the backend to the cloud so your mobile app can talk to it.

## Step 1: Deploy Backend (Render.com)

Render is the best free platform for hosting Python/FastAPI backends.

1. Go to [Render.com](https://render.com/) and sign up with GitHub.
2. Click **New +** and select **Web Service**.
3. Select **"Build and deploy from a Git repository"** and connect your `CancerGuardAI-IIT-BOMBAY` repository.
4. Fill out the form with these exact settings:
   - **Name:** `cancerguard-backend` (or anything you like)
   - **Root Directory:** `backend` (⚠️ IMPORTANT)
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port 10000`
   - **Instance Type:** Free
5. Click **Create Web Service**. 
6. Wait a few minutes for it to deploy. Once it's live, copy the public URL it gives you at the top left (e.g., `https://cancerguard-backend-xyz.onrender.com`).

---

## Step 2: Connect Vercel to Render

Now we must tell your Vercel app where the Render backend lives.

1. Go back to your Vercel Dashboard: [CancerGuard AI Vercel Settings](https://vercel.com/codebyvedant008s-projects/cancer-guard-ai-iit-bombay/settings/environment-variables)
2. Go to the **Settings** tab.
3. Click on **Environment Variables** in the left menu.
4. Add a new variable:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://your-render-url-here.onrender.com/api` *(Make sure to add `/api` at the end!)*
5. Click **Save**.
6. Go to the **Deployments** tab in Vercel, click the three dots on your latest deployment, and click **Redeploy**.

Once that finishes, open the app on your phone. You will have a fully functioning AI app on your phone that you can take anywhere!
