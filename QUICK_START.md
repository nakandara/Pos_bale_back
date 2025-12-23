# 🚀 Quick Start - POS Backend

Get your POS backend running in 5 minutes!

## ⚡ Super Quick Setup

```bash
# 1. Navigate to backend directory
cd ~/POS/pos-back

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << 'EOF'
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pos-database?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EOF

# 4. Edit .env with your MongoDB credentials
nano .env  # or code .env

# 5. Start the server
npm run dev
```

## ✅ Verify It's Working

Open in browser: [http://localhost:5000](http://localhost:5000)

You should see:
```json
{
  "message": "POS Backend API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

## 🎯 Test API Quickly

```bash
# Create a category
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "T-Shirt"}'

# Get all categories
curl http://localhost:5000/api/categories

# Check inventory
curl http://localhost:5000/api/inventory

# View dashboard
curl http://localhost:5000/api/dashboard
```

## 📚 Available Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/categories` | Manage product categories |
| `/api/purchases` | Record stock purchases (in) |
| `/api/sales` | Record sales transactions (out) |
| `/api/inventory` | View current stock levels |
| `/api/dashboard` | Analytics and insights |

## 📖 Full Documentation

- **Setup Guide**: See `SETUP.md`
- **MongoDB Setup**: See `MONGODB_ATLAS_SETUP.md`  
- **API Examples**: See `API_EXAMPLES.md`
- **Full README**: See `README.md`

## 🔧 Common Commands

```bash
# Start development server (auto-restart)
npm run dev

# Start production server
npm start

# Install new package
npm install package-name

# Check for errors
npm run lint  # if eslint configured
```

## 📁 Project Structure

```
pos-back/
├── models/          # MongoDB schemas
├── controllers/     # Business logic
├── routes/          # API endpoints
├── middleware/      # Express middleware
├── config/          # Configuration files
└── server.js        # Main entry point
```

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't connect to MongoDB | Check connection string in `.env` |
| Port 5000 in use | Change `PORT=5001` in `.env` |
| CORS errors | Verify `FRONTEND_URL` in `.env` |
| Module not found | Run `npm install` |

## 🔗 Connect React Frontend

In your React app, create `src/services/api.ts`:

```typescript
const API_URL = 'http://localhost:5000/api';

export const api = {
  // Categories
  getCategories: () => 
    fetch(`${API_URL}/categories`).then(r => r.json()),
  
  createCategory: (data) => 
    fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
  
  // Purchases
  getPurchases: () => 
    fetch(`${API_URL}/purchases`).then(r => r.json()),
  
  createPurchase: (data) => 
    fetch(`${API_URL}/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
  
  // Sales
  getSales: () => 
    fetch(`${API_URL}/sales`).then(r => r.json()),
  
  createSale: (data) => 
    fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
  
  // Inventory & Dashboard
  getInventory: () => 
    fetch(`${API_URL}/inventory`).then(r => r.json()),
  
  getDashboard: () => 
    fetch(`${API_URL}/dashboard`).then(r => r.json()),
};
```

Then use in your React components:

```typescript
import { api } from './services/api';

// Get categories
const categories = await api.getCategories();

// Create category
const newCategory = await api.createCategory({ name: 'T-Shirt' });
```

## 🎉 You're Ready!

Your backend is now ready to handle:
- ✅ Category management
- ✅ Purchase tracking
- ✅ Sales recording
- ✅ Inventory monitoring
- ✅ Dashboard analytics

**Next Steps:**
1. Set up MongoDB Atlas (see MONGODB_ATLAS_SETUP.md)
2. Configure your .env file
3. Test the API (see API_EXAMPLES.md)
4. Connect your React frontend

**Happy Coding! 🚀**


