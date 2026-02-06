# Deployment Guide - Render & Vercel

This guide provides step-by-step instructions for deploying the Recipe Builder application on Render (backend) and Vercel (frontend).

## Prerequisites

- GitHub repository with this project
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)
- Google OAuth credentials (optional, for Google login)

## Part 1: MongoDB Atlas Setup

1. **Create MongoDB Atlas Cluster**
   - Go to MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
   - Sign up or log in
   - Create a new cluster (free tier is available)
   - Click "Connect" and get your connection string

2. **Get Connection String**
   - Format: `mongodb+srv://username:password@cluster-name.mongodb.net/database-name?retryWrites=true&w=majority`
   - Replace `username` and `password` with your database credentials
   - Replace `database-name` with `recipeBuilder`

## Part 2: Backend Deployment (Render)

### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Fix deployment bugs for Render"
git push origin main
```

### Step 2: Create Render Web Service

1. Go to https://dashboard.render.com
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name:** recipe-builder-server
   - **Environment:** Node
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Instance Type:** Free (or paid for production)

### Step 3: Set Environment Variables

In Render dashboard, go to Environment and add:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipeBuilder?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend-url.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id (optional)
GOOGLE_CLIENT_SECRET=your-google-client-secret (optional)
GOOGLE_CALLBACK_URL=https://your-backend-url.onrender.com/api/auth/google/callback (optional)
```

### Step 4: Deploy

- Render will automatically deploy when you push to GitHub
- Wait for the build to complete
- Copy your backend URL (e.g., `https://recipe-builder-server.onrender.com`)

## Part 3: Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `./`
   - **Build Command:** `cd client && npm run build`
   - **Output Directory:** `client/build`
   - **Install Command:** `npm run install-client`

### Step 2: Set Environment Variables

In Vercel project settings, add:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id (optional)
```

### Step 3: Deploy

- Vercel will automatically deploy when you push to GitHub
- Wait for the build to complete
- Your frontend will be live at `https://your-project-name.vercel.app`

## Part 4: Testing

### Check Backend Health

```bash
curl https://your-backend-url.onrender.com/api/health
```

Expected response:
```json
{"message":"Recipe Builder API is running!"}
```

### Test API Connection

1. Open your frontend URL
2. Try to register a new account
3. Check if you can login and view recipes

## Common Issues & Solutions

### Issue: "CORS error" or "Cannot connect to API"

**Solution:** 
- Verify `CLIENT_URL` is set correctly in backend environment variables
- Verify `REACT_APP_API_URL` is set correctly in frontend environment variables
- Make sure both URLs are accessible

### Issue: "MongoDB connection error"

**Solution:**
- Check `MONGODB_URI` is correct
- Ensure IP whitelist in MongoDB Atlas includes `0.0.0.0/0` (allows all IPs)
- Verify database credentials

### Issue: "JWT_SECRET is not defined"

**Solution:**
- Add `JWT_SECRET` to environment variables in Render
- Make sure you generated a strong secret key

### Issue: "Cold start delays" (Render free tier)

**Solution:**
- The free tier spins down after 15 minutes of inactivity
- Upgrade to paid tier for always-on instances
- Or use a service like https://uptimerobot.com to keep it warm

## Optional: Google OAuth Setup

1. Go to Google Cloud Console (https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Add authorized redirect URIs:
     ```
     https://your-backend-url.onrender.com/api/auth/google/callback
     ```
   - Add authorized JavaScript origins:
     ```
     https://your-frontend-url.vercel.app
     https://www.your-domain.com (if using custom domain)
     ```
5. Copy the Client ID and Client Secret
6. Add to environment variables:
   - Backend: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
   - Frontend: `REACT_APP_GOOGLE_CLIENT_ID`

## Next Steps

1. Monitor your application in Render and Vercel dashboards
2. Set up error tracking (e.g., Sentry)
3. Enable HTTPS (automatic with Render and Vercel)
4. Set up custom domain (optional)
5. Configure email notifications for errors

## Getting Help

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Docs:** https://docs.mongodb.com
- **React Docs:** https://react.dev
