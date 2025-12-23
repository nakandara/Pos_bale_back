# Quick Setup Guide

## Step 1: Install Dependencies
```bash
cd ~/POS/pos-back
npm install
```

## Step 2: Configure MongoDB Atlas

### Create MongoDB Atlas Account
1. Visit https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new cluster (free M0 tier)

### Setup Database Access
1. Go to "Database Access"
2. Add new database user
3. Set username and password (save these!)

### Setup Network Access
1. Go to "Network Access"
2. Add IP Address: 0.0.0.0/0 (allow all for development)

### Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password

## Step 3: Configure Environment Variables

Edit the `.env` file:
```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pos-database?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Step 4: Start the Server

### Development mode (with auto-restart):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start at: http://localhost:5000

## Step 5: Test the API

Open http://localhost:5000 in your browser or use curl:
```bash
curl http://localhost:5000
```

You should see:
```json
{
  "message": "POS Backend API",
  "version": "1.0.0",
  "endpoints": {
    "categories": "/api/categories",
    "purchases": "/api/purchases",
    "sales": "/api/sales",
    "inventory": "/api/inventory",
    "dashboard": "/api/dashboard"
  }
}
```

## Step 6: Test with Sample Data

### Create a category:
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "T-Shirt"}'
```

### Get all categories:
```bash
curl http://localhost:5000/api/categories
```

## Troubleshooting

### "MongoNetworkError" or "connection refused"
- Check your MongoDB connection string
- Verify your IP is whitelisted in MongoDB Atlas
- Ensure username and password are correct

### "Port 5000 already in use"
- Change PORT in .env to different number (e.g., 5001)
- Or kill the process: `lsof -ti:5000 | xargs kill -9`

### CORS errors from frontend
- Verify FRONTEND_URL in .env matches your React app URL
- Default is http://localhost:5173 (Vite default)

## Next Steps

1. **Integrate with React Frontend**: See README.md for integration guide
2. **Add Authentication** (optional): Implement JWT or session-based auth
3. **Add Validation**: Use express-validator for input validation
4. **Add Tests**: Write unit and integration tests

## API Documentation

Full API documentation is available in README.md

Enjoy! 🚀


