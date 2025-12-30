# 🚀 Vercel Deployment Guide

This guide will help you deploy your Threads App to Vercel and fix common deployment issues.

## 📋 Prerequisites

Before deploying, make sure you have:
- A GitHub account with your code pushed
- A Vercel account (free tier works)
- A MongoDB Atlas account (or MongoDB database)
- A Clerk account for authentication
- An UploadThing account for file uploads

## 🔧 Step 1: Set Up Environment Variables in Vercel

### Required Environment Variables

Go to your Vercel project settings → Environment Variables and add the following:

#### MongoDB Connection
```
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/threads?retryWrites=true&w=majority
```
**OR**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/threads?retryWrites=true&w=majority
```

**Note:** The app supports both `MONGODB_URL` and `MONGODB_URI` for compatibility.

#### Clerk Authentication
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

#### UploadThing (for file uploads)
```
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=your_app_id
```

### How to Get Your Environment Variables

1. **MongoDB Atlas:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

2. **Clerk:**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Create a new application
   - Copy the Publishable Key and Secret Key from the API Keys section

3. **UploadThing:**
   - Go to [UploadThing Dashboard](https://uploadthing.com)
   - Create a new app
   - Copy the Secret and App ID

## 🔍 Step 2: Common Deployment Issues & Fixes

### Issue 1: "Application error: a server-side exception has occurred"

**Causes:**
- Missing or incorrect environment variables
- MongoDB connection issues
- Missing `await` on database connections

**Solutions:**
1. ✅ Verify all environment variables are set in Vercel
2. ✅ Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for all IPs)
3. ✅ Ensure MongoDB connection string is correct
4. ✅ Check Vercel deployment logs for specific errors

### Issue 2: Database Connection Errors

**Fix:** The app now properly handles:
- Serverless environment connection pooling
- Both `MONGODB_URL` and `MONGODB_URI` variable names
- Proper error handling and reconnection

### Issue 3: Build Errors

**Fix:** The `next.config.js` already includes:
- TypeScript build error ignoring (for development)
- ESLint build error ignoring
- Proper external packages configuration

## 📝 Step 3: Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
5. Add all environment variables
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production
vercel --prod
```

## 🔐 Step 4: Configure Clerk Webhook

After deployment, configure Clerk webhook:

1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/webhook/clerk`
3. Subscribe to events:
   - `user.created`
   - `user.updated`
4. Copy the signing secret
5. Add to Vercel environment variables:
   ```
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

## ✅ Step 5: Verify Deployment

1. Visit your deployed URL
2. Check browser console for errors
3. Check Vercel function logs:
   - Go to Vercel Dashboard → Your Project → Functions
   - Check for any error logs

## 🐛 Troubleshooting

### Check Vercel Logs

1. Go to Vercel Dashboard → Your Project
2. Click on "Deployments"
3. Click on the latest deployment
4. Check "Function Logs" for errors

### Common Error Messages

**"MONGODB_URL not found"**
- Solution: Add `MONGODB_URL` or `MONGODB_URI` to Vercel environment variables

**"Failed to connect to MongoDB"**
- Solution: Check MongoDB Atlas IP whitelist and connection string

**"Clerk authentication error"**
- Solution: Verify all Clerk environment variables are set correctly

**"UploadThing error"**
- Solution: Check UploadThing credentials and API configuration

## 🔄 Re-deploy After Fixes

After fixing issues:

1. Push changes to GitHub
2. Vercel will automatically redeploy
3. Or manually trigger redeploy in Vercel Dashboard

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [Clerk Documentation](https://clerk.com/docs)

## ✨ What Was Fixed

The following issues have been resolved in the codebase:

1. ✅ **Database Connection:** Fixed for serverless environments (Vercel)
2. ✅ **Environment Variables:** Support for both `MONGODB_URL` and `MONGODB_URI`
3. ✅ **Async/Await:** All database connections now properly awaited
4. ✅ **Error Handling:** Improved error handling and logging
5. ✅ **Connection State:** Proper connection state management for serverless

---

**Need Help?** Check the Vercel deployment logs for specific error messages and refer to this guide.

