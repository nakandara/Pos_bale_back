# Vercel Backend Deployment - CORS Fix

## ✅ What I Fixed

1. **Enhanced CORS Configuration** - Now allows multiple origins including all Vercel preview URLs
2. **Added `vercel.json`** - Configures Vercel to handle Express as serverless function
3. **Modified `server.js`** - Works in both local development and Vercel serverless

## 🚀 Vercel Backend Configuration

### Environment Variables (CRITICAL!)

Go to your Vercel backend project → Settings → Environment Variables and add:

| Key | Value | Description |
|-----|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/pos-database?retryWrites=true&w=majority` | Your MongoDB Atlas connection |
| `NODE_ENV` | `production` | Environment mode |
| `FRONTEND_URL` | `https://pos-bale-front.vercel.app` | Your frontend URL |

### Vercel Settings

- **Framework Preset**: Other
- **Root Directory**: `./`
- **Build Command**: (leave empty or `npm install`)
- **Output Directory**: (leave empty)
- **Install Command**: `npm install`

## 📝 How CORS is Now Configured

The backend now accepts requests from:
- ✅ `http://localhost:5173` (local development)
- ✅ `https://pos-bale-front.vercel.app` (production)
- ✅ All Vercel preview URLs (e.g., `pos-bale-front-git-master-nakandara.vercel.app`)
- ✅ Any URL containing `vercel.app`

## 🔧 Files Changed

### 1. `vercel.json` (NEW)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### 2. `server.js` (UPDATED)
- Enhanced CORS to accept multiple origins
- Modified to work as Vercel serverless function
- Still works locally for development

## 🎯 After Pushing to GitHub

1. **Vercel will auto-deploy** the new changes
2. **Wait 2-3 minutes** for deployment to complete
3. **Test your API**: `https://pos-bale-back.vercel.app/api/categories`

## ✅ Testing CORS

### Test 1: Direct API Call
```bash
curl https://pos-bale-back.vercel.app/api/categories
```
Should return: `[]` or list of categories

### Test 2: From Frontend
1. Open your frontend: `https://pos-bale-front.vercel.app`
2. Open browser console (F12)
3. Go to Categories page
4. Check Network tab - should see successful API calls
5. No CORS errors in console

## 🐛 Troubleshooting

### Still Getting CORS Error?

1. **Check Environment Variables**:
   - Go to Vercel backend → Settings → Environment Variables
   - Verify `FRONTEND_URL` is set correctly
   - Click "Redeploy" after adding variables

2. **Check MongoDB Connection**:
   - Verify `MONGODB_URI` is correct
   - Check MongoDB Atlas Network Access allows `0.0.0.0/0`

3. **Check Deployment Logs**:
   - Go to Vercel backend → Deployments
   - Click latest deployment
   - Check "Build Logs" and "Function Logs"

### Error: "Cannot find module"
**Solution**: Make sure all dependencies are in `package.json`

### Error: "MongoDB connection failed"
**Solution**: 
- Check `MONGODB_URI` in Vercel environment variables
- Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### CORS Still Blocked
**Solution**:
- Clear browser cache
- Try incognito/private window
- Check browser console for exact error
- Verify frontend is using correct backend URL

## 📊 Expected Response Headers

Your API should return these CORS headers:
```
Access-Control-Allow-Origin: https://pos-bale-front.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

## 🌐 Full Stack URLs

- **Frontend**: `https://pos-bale-front.vercel.app`
- **Backend**: `https://pos-bale-back.vercel.app`
- **API Base**: `https://pos-bale-back.vercel.app/api`

## 🎉 You're Done!

After Vercel redeploys:
1. ✅ CORS errors should be gone
2. ✅ Frontend can call backend APIs
3. ✅ Data saves to MongoDB Atlas
4. ✅ Full stack app is working!

## 💡 Pro Tips

1. **Use Environment Variables**: Never hardcode URLs
2. **Check Vercel Logs**: Great for debugging
3. **Test Locally First**: Run `npm run dev` before deploying
4. **MongoDB Atlas**: Keep Network Access open (0.0.0.0/0) for Vercel

---

**Need Help?** Check Vercel deployment logs or MongoDB Atlas connection settings.

