# POS Backend API

Backend API for Point of Sale (POS) System built with Node.js, Express, and MongoDB Atlas.

## 🚀 Features

- **Categories Management**: Create, read, update, and delete product categories
- **Purchases Tracking**: Record and manage inventory purchases (stock in)
- **Sales Management**: Track sales transactions (stock out)
- **Inventory Monitoring**: Real-time inventory levels and stock calculations
- **MongoDB Atlas Integration**: Cloud-based database storage
- **RESTful API**: Clean and organized API endpoints

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (free tier available at [mongodb.com](https://www.mongodb.com/cloud/atlas))

## 🛠️ Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd ~/POS/pos-back
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pos-database?retryWrites=true&w=majority
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

## 🔑 MongoDB Atlas Setup

1. **Create a MongoDB Atlas Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a New Cluster**
   - Click "Create" to create a new cluster (free M0 tier is sufficient)
   - Choose your preferred cloud provider and region
   - Wait for cluster creation (takes 3-5 minutes)

3. **Create Database User**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password (remember these!)
   - Set user privileges to "Atlas admin" or "Read and write to any database"

4. **Whitelist Your IP Address**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
   - For production, add specific IP addresses

5. **Get Connection String**
   - Go to your cluster and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your desired database name (e.g., `pos-database`)
   - Paste this into your `.env` file as `MONGODB_URI`

## 🏃‍♂️ Running the Application

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Purchases
- `GET /api/purchases` - Get all purchases
- `GET /api/purchases/:id` - Get single purchase
- `POST /api/purchases` - Create new purchase
- `PUT /api/purchases/:id` - Update purchase
- `DELETE /api/purchases/:id` - Delete purchase

### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get single sale
- `POST /api/sales` - Create new sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

### Inventory
- `GET /api/inventory` - Get full inventory summary
- `GET /api/inventory/:categoryId` - Get inventory for specific category

## 📝 API Usage Examples

### Create a Category
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "T-Shirt"}'
```

### Create a Purchase
```bash
curl -X POST http://localhost:5000/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "categoryId": "65a1234567890abcdef12345",
    "categoryName": "T-Shirt",
    "quantity": 100,
    "totalCost": 50000,
    "sellingPricePerItem": 750,
    "supplier": "ABC Suppliers"
  }'
```

### Create a Sale
```bash
curl -X POST http://localhost:5000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-16",
    "categoryId": "65a1234567890abcdef12345",
    "categoryName": "T-Shirt",
    "quantity": 5,
    "sellingPricePerItem": 750
  }'
```

### Get Inventory Summary
```bash
curl http://localhost:5000/api/inventory
```

## 📁 Project Structure

```
pos-back/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── categoryController.js # Category business logic
│   ├── purchaseController.js # Purchase business logic
│   ├── saleController.js     # Sale business logic
│   └── inventoryController.js# Inventory calculations
├── middleware/
│   └── errorHandler.js       # Error handling middleware
├── models/
│   ├── Category.js           # Category schema
│   ├── Purchase.js           # Purchase schema
│   └── Sale.js               # Sale schema
├── routes/
│   ├── categoryRoutes.js     # Category routes
│   ├── purchaseRoutes.js     # Purchase routes
│   ├── saleRoutes.js         # Sale routes
│   └── inventoryRoutes.js    # Inventory routes
├── .env                      # Environment variables (create this)
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── package.json              # Project dependencies
├── README.md                 # This file
└── server.js                 # Application entry point
```

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `FRONTEND_URL` | Frontend application URL for CORS | `http://localhost:5173` |

## 🐛 Troubleshooting

### Cannot connect to MongoDB
- Verify your connection string is correct
- Check if your IP is whitelisted in MongoDB Atlas Network Access
- Ensure database user credentials are correct

### Port already in use
- Change the PORT in `.env` file
- Or stop the process using port 5000: `lsof -ti:5000 | xargs kill -9`

### CORS errors
- Make sure `FRONTEND_URL` in `.env` matches your frontend URL
- Check if CORS middleware is properly configured in `server.js`

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB object modeling
- **dotenv**: Environment variable management
- **cors**: Cross-origin resource sharing
- **morgan**: HTTP request logger
- **nodemon**: Development auto-restart (dev dependency)

## 🤝 Integration with React Frontend

To connect your React frontend with this backend:

1. **Update Frontend API calls**: Create an API service in your React app that points to `http://localhost:5000/api`

2. **Example API Service** (create `src/services/api.ts` in React app):
   ```typescript
   const API_BASE_URL = 'http://localhost:5000/api';

   export const api = {
     // Categories
     getCategories: () => fetch(`${API_BASE_URL}/categories`).then(r => r.json()),
     createCategory: (data) => fetch(`${API_BASE_URL}/categories`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(data)
     }).then(r => r.json()),

     // Purchases
     getPurchases: () => fetch(`${API_BASE_URL}/purchases`).then(r => r.json()),
     createPurchase: (data) => fetch(`${API_BASE_URL}/purchases`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(data)
     }).then(r => r.json()),

     // Sales
     getSales: () => fetch(`${API_BASE_URL}/sales`).then(r => r.json()),
     createSale: (data) => fetch(`${API_BASE_URL}/sales`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(data)
     }).then(r => r.json()),

     // Inventory
     getInventory: () => fetch(`${API_BASE_URL}/inventory`).then(r => r.json()),
   };
   ```

3. **Replace Redux local state with API calls**: Update your Redux slices to fetch from the API instead of local state

## 📄 License

ISC

## 👨‍💻 Author

Built for POS System Project

---

**Happy Coding! 🎉**

