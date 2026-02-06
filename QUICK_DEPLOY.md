# Quick Deployment Reference

## 🚀 Fast Deployment Guide (5 minutes)

### Step 1: MongoDB Setup (1 min)
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string: mongodb+srv://user:pass@cluster.mongodb.net/recipeBuilder
```

### Step 2: Deploy Backend (2 min)
```
1. Go to https://dashboard.render.com
2. New Web Service → Connect GitHub repo
3. Build: cd server && npm install
4. Start: cd server && npm start
5. Add Environment Variables:
   - MONGODB_URI=your-mongodb-connection-string
   - JWT_SECRET=generate-a-strong-random-string
   - CLIENT_URL=https://your-frontend-url.vercel.app
   - NODE_ENV=production
   - PORT=10000
6. Copy your backend URL (e.g., https://recipe-builder.onrender.com)
```

### Step 3: Deploy Frontend (2 min)
```
1. Go to https://vercel.com/dashboard
2. New Project → Import GitHub repo
3. Framework: Create React App
4. Root: ./
5. Build: cd client && npm run build
6. Output: client/build
7. Add Environment Variable:
   - REACT_APP_API_URL=https://your-backend-url.onrender.com/api
8. Deploy!
```

---

## 🔑 Environment Variables Quick Checklist

### Backend (.env in Render)
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
CLIENT_URL=https://your-vercel-url.vercel.app
```

### Frontend (.env in Vercel)
```
REACT_APP_API_URL=https://your-render-url.onrender.com/api
```

---

## ✅ Testing After Deployment

```bash
# Check backend is running
curl https://your-render-url.onrender.com/api/health

# Should return:
{"message":"Recipe Builder API is running!"}
```

Then test in browser:
1. Open your Vercel frontend URL
2. Try to register/login
3. Check recipes load
4. Verify no errors in browser console

---

## 🐛 Common Issues & Fixes

| Error | Fix |
|-------|-----|
| "Cannot connect to API" | Check REACT_APP_API_URL in Vercel settings |
| "CORS error" | Check CLIENT_URL matches frontend URL in Render |
| "MongoDB connection failed" | Verify MONGODB_URI is correct & IP whitelist includes 0.0.0.0/0 |
| "JWT_SECRET is not defined" | Add JWT_SECRET to Render environment variables |
| "Google OAuth error" | Either add credentials OR ignore (it's optional) |

---

## 📋 Bugs That Were Fixed

1. ✅ Missing axios base URL configuration
2. ✅ Missing environment variable validation
3. ✅ CORS errors in production
4. ✅ JWT error handling
5. ✅ Google OAuth crash when credentials missing
6. ✅ No error boundary for React errors
7. ✅ Production security issues

All fixes are already applied to your code!

---

## 🎯 What's Next

1. Push code to GitHub: `git push origin main`
2. Follow the Fast Deployment Guide above
3. Test everything works
4. Monitor logs in Render/Vercel dashboards
5. (Optional) Set up Google OAuth if you want it

---

## 📚 Full Guides

- **Detailed Deployment:** See `RENDER_DEPLOYMENT.md`
- **All Bug Fixes:** See `BUG_FIXES_SUMMARY.md`
- **Project Info:** See `PROJECT_SUMMARY.md`

---

**Your app is ready to deploy! 🎉**
