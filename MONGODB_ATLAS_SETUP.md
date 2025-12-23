# MongoDB Atlas Setup Guide

Complete step-by-step guide to set up MongoDB Atlas for your POS backend.

## Step 1: Create MongoDB Atlas Account

1. Visit [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** or **"Sign Up"**
3. You can sign up with:
   - Google account
   - GitHub account  
   - Email and password

## Step 2: Create a New Cluster

1. After login, you'll see "Create a Deployment"
2. Choose **FREE** tier (M0 Sandbox)
3. Select:
   - **Cloud Provider**: AWS, Google Cloud, or Azure (any is fine)
   - **Region**: Choose closest to your location for better performance
   - **Cluster Name**: Keep default or name it "POS-Cluster"
4. Click **"Create Deployment"**
5. Wait 3-5 minutes for cluster creation

## Step 3: Create Database User

### Security Quick Start will appear automatically

1. **Username**: Enter a username (e.g., `posadmin`)
2. **Password**: Click "Autogenerate Secure Password" or create your own
   - ⚠️ **IMPORTANT**: Save this password somewhere safe!
3. Click **"Create Database User"**

### If you missed this step:
1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username and password
5. Set privileges to **"Read and write to any database"**
6. Click **"Add User"**

## Step 4: Configure Network Access

### From Security Quick Start:
1. Choose **"My Local Environment"**
2. Click **"Add My Current IP Address"**
3. Also add: `0.0.0.0/0` to allow access from anywhere (for development)
4. Click **"Add Entry"** then **"Finish and Close"**

### If you missed this step:
1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (adds 0.0.0.0/0)
   - ⚠️ For production, add only specific IP addresses
4. Click **"Confirm"**

## Step 5: Get Connection String

1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
5. Copy the connection string, it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Configure Your Application

1. **Replace placeholders** in the connection string:
   ```
   Original:
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   
   Updated (example):
   mongodb+srv://posadmin:MySecurePass123@cluster0.xxxxx.mongodb.net/pos-database?retryWrites=true&w=majority
   ```

2. **Add database name** after `.net/`:
   - Change: `...mongodb.net/?retryWrites...`
   - To: `...mongodb.net/pos-database?retryWrites...`

3. **Copy to .env file**:
   ```bash
   cd ~/POS/pos-back
   nano .env  # or use your favorite editor
   ```
   
   Paste:
   ```env
   MONGODB_URI=mongodb+srv://posadmin:MySecurePass123@cluster0.xxxxx.mongodb.net/pos-database?retryWrites=true&w=majority
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

## Step 7: Test Connection

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm run dev
   ```

3. **Look for success message**:
   ```
   MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
   Database Name: pos-database
   🚀 Server running in development mode on port 5000
   ```

## Common Issues & Solutions

### Issue 1: "Authentication failed"
**Solution**: 
- Check username and password in connection string
- Ensure special characters in password are URL-encoded:
  - `@` → `%40`
  - `#` → `%23`
  - `%` → `%25`
  - `:` → `%3A`

### Issue 2: "Connection timeout" or "Network error"
**Solution**:
- Check Network Access in MongoDB Atlas
- Ensure 0.0.0.0/0 is added
- Wait a few minutes after adding IP (takes time to apply)

### Issue 3: "Database user not found"
**Solution**:
- Go to Database Access
- Verify user exists and has correct privileges
- Try creating a new user

### Issue 4: "Unable to connect to server"
**Solution**:
- Check if cluster is running (should show green "Active")
- Verify connection string format
- Ensure database name is included in the string

## Connection String Format Breakdown

```
mongodb+srv://[username]:[password]@[cluster-address]/[database-name]?[options]
```

Example:
```
mongodb+srv://posadmin:MyPass123@cluster0.abcde.mongodb.net/pos-database?retryWrites=true&w=majority
│              │          │          │                                    │
│              │          │          │                                    └─ Database name
│              │          │          └────────────────────────────────────── Cluster address
│              │          └───────────────────────────────────────────────── Password
│              └──────────────────────────────────────────────────────────── Username
└─────────────────────────────────────────────────────────────────────────── Protocol
```

## Additional MongoDB Atlas Features

### View Your Data
1. Click **"Browse Collections"** on your cluster
2. You'll see databases and collections
3. After running the app, you'll see:
   - Database: `pos-database`
   - Collections: `categories`, `purchases`, `sales`

### Monitor Performance
1. Click on your cluster name
2. Go to **"Metrics"** tab
3. View connection stats, operations, etc.

### Backup (M10+ clusters only)
- Free M0 tier doesn't include automatic backups
- Upgrade to M10+ for scheduled backups

## Best Practices

1. **Never commit .env file**: Already in .gitignore
2. **Use strong passwords**: Mix letters, numbers, symbols
3. **Limit IP access in production**: Don't use 0.0.0.0/0
4. **Create separate users**: Different users for dev/prod
5. **Monitor usage**: Check Atlas dashboard regularly

## Free Tier Limits

MongoDB Atlas M0 (Free) includes:
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Suitable for development and small projects
- ❌ No backups
- ❌ No performance analytics
- ❌ Limited to 100 connections

For production, consider upgrading to M10 or higher.

## Need Help?

- MongoDB Atlas Docs: [https://docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- MongoDB University: Free courses at [university.mongodb.com](https://university.mongodb.com)
- Community Forum: [community.mongodb.com](https://community.mongodb.com)

---

**You're all set! 🎉** 

Once connected, your backend will automatically create the database and collections when you start adding data through the API.


