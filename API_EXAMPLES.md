# API Examples and Testing

This file contains practical examples for testing all API endpoints.

## Base URL
```
http://localhost:5000/api
```

## 1. Categories API

### Get All Categories
```bash
curl http://localhost:5000/api/categories
```

### Get Single Category
```bash
curl http://localhost:5000/api/categories/{categoryId}
```

### Create Category
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Crop Top"
  }'
```

### Update Category
```bash
curl -X PUT http://localhost:5000/api/categories/{categoryId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Crop Top Updated"
  }'
```

### Delete Category
```bash
curl -X DELETE http://localhost:5000/api/categories/{categoryId}
```

---

## 2. Purchases API

### Get All Purchases
```bash
curl http://localhost:5000/api/purchases
```

### Get Single Purchase
```bash
curl http://localhost:5000/api/purchases/{purchaseId}
```

### Create Purchase
```bash
curl -X POST http://localhost:5000/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "categoryId": "65a1234567890abcdef12345",
    "categoryName": "Crop Top",
    "quantity": 100,
    "totalCost": 50000,
    "sellingPricePerItem": 750,
    "supplier": "ABC Fashion Suppliers"
  }'
```

**Note**: The `costPerItem` is automatically calculated as `totalCost / quantity`

### Update Purchase
```bash
curl -X PUT http://localhost:5000/api/purchases/{purchaseId} \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 120,
    "totalCost": 60000
  }'
```

### Delete Purchase
```bash
curl -X DELETE http://localhost:5000/api/purchases/{purchaseId}
```

---

## 3. Sales API

### Get All Sales
```bash
curl http://localhost:5000/api/sales
```

### Get Single Sale
```bash
curl http://localhost:5000/api/sales/{saleId}
```

### Create Sale
```bash
curl -X POST http://localhost:5000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-16",
    "categoryId": "65a1234567890abcdef12345",
    "categoryName": "Crop Top",
    "quantity": 5,
    "sellingPricePerItem": 750
  }'
```

**Note**: 
- The `totalAmount` is automatically calculated as `quantity * sellingPricePerItem`
- The system checks if enough stock is available before creating the sale

### Update Sale
```bash
curl -X PUT http://localhost:5000/api/sales/{saleId} \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 7,
    "sellingPricePerItem": 800
  }'
```

### Delete Sale
```bash
curl -X DELETE http://localhost:5000/api/sales/{saleId}
```

---

## 4. Inventory API

### Get Full Inventory Summary
```bash
curl http://localhost:5000/api/inventory
```

**Response includes**:
- Stock levels for all categories
- Average cost per item
- Average selling price
- Stock value (cost and selling)
- Summary totals

### Get Inventory for Specific Category
```bash
curl http://localhost:5000/api/inventory/{categoryId}
```

**Response includes**:
- Category details
- Total bought and sold
- Remaining stock
- All purchases for this category
- All sales for this category

---

## 5. Dashboard API

### Get Dashboard Analytics
```bash
curl http://localhost:5000/api/dashboard
```

**Response includes**:
- Summary statistics (total revenue, profit, profit margin)
- Top selling categories
- Recent purchases and sales
- Monthly trends (last 6 months)
- Low stock alerts

---

## Complete Workflow Example

Here's a complete example workflow:

### 1. Create categories
```bash
# Create T-Shirt category
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "T-Shirt"}'

# Create Blouse category
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Blouse"}'

# Create Crop Top category
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Crop Top"}'
```

### 2. Get categories (to get IDs)
```bash
curl http://localhost:5000/api/categories
```

Save the `_id` values from the response.

### 3. Add purchases (stock in)
```bash
# Purchase T-Shirts (replace {categoryId} with actual ID)
curl -X POST http://localhost:5000/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-10",
    "categoryId": "{categoryId}",
    "categoryName": "T-Shirt",
    "quantity": 100,
    "totalCost": 30000,
    "sellingPricePerItem": 500,
    "supplier": "Fashion Hub"
  }'
```

### 4. Make sales (stock out)
```bash
# Sell some T-Shirts
curl -X POST http://localhost:5000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "categoryId": "{categoryId}",
    "categoryName": "T-Shirt",
    "quantity": 10,
    "sellingPricePerItem": 500
  }'
```

### 5. Check inventory
```bash
curl http://localhost:5000/api/inventory
```

### 6. View dashboard
```bash
curl http://localhost:5000/api/dashboard
```

---

## Using Postman or Thunder Client

If you prefer a GUI, you can use:

1. **Postman**: Import these examples as a collection
2. **Thunder Client** (VS Code extension)
3. **Insomnia**: REST API client

### Sample Postman Collection Structure:
```
POS API/
├── Categories/
│   ├── Get All Categories [GET]
│   ├── Create Category [POST]
│   ├── Update Category [PUT]
│   └── Delete Category [DELETE]
├── Purchases/
│   ├── Get All Purchases [GET]
│   ├── Create Purchase [POST]
│   ├── Update Purchase [PUT]
│   └── Delete Purchase [DELETE]
├── Sales/
│   ├── Get All Sales [GET]
│   ├── Create Sale [POST]
│   ├── Update Sale [PUT]
│   └── Delete Sale [DELETE]
├── Inventory/
│   ├── Get Full Inventory [GET]
│   └── Get Category Inventory [GET]
└── Dashboard/
    └── Get Analytics [GET]
```

---

## Response Status Codes

- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Server Error

---

## Error Response Format

All errors return in this format:
```json
{
  "message": "Error description",
  "error": "Detailed error message (dev mode only)"
}
```

---

## Testing Tips

1. **Start with categories**: Create categories first before purchases/sales
2. **Get IDs**: Always fetch and save `_id` values for related operations
3. **Check stock**: Use inventory endpoint to verify stock levels
4. **Monitor responses**: Check response status codes and messages
5. **Test validation**: Try invalid data to test error handling

Happy Testing! 🧪

