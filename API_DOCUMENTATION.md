# WhatsApp SaaS - API Documentation

## Base URL
```
Development: http://localhost:8000
Production: https://your-app.onrender.com
```

## Authentication
All API endpoints (except webhook and payment) require Firebase JWT token in the Authorization header:
```
Authorization: Bearer <firebase_jwt_token>
```

---

## Health Check

### GET /ping
Health check endpoint to verify server is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000000"
}
```

---

## Webhook Endpoints

### GET /webhook
WhatsApp webhook verification endpoint.

**Query Parameters:**
- `hub.mode`: "subscribe"
- `hub.verify_token`: Your verify token
- `hub.challenge`: Challenge string

**Response:** Returns the challenge string

### POST /webhook
Receives WhatsApp messages from Meta.

**Request Body:** WhatsApp webhook payload

**Response:**
```json
{
  "status": "received"
}
```

---

## Business Endpoints

### GET /api/businesses
Get all businesses (Super Admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "businesses": [
    {
      "id": "business_id",
      "name": "Business Name",
      "owner_email": "owner@example.com",
      "phone_number_id": "1234567890",
      "is_active": true
    }
  ]
}
```

### GET /api/businesses/:business_id
Get single business details.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "business_id",
  "name": "Business Name",
  "display_name": "Display Name",
  "logo_url": "https://...",
  "upi_id": "business@upi",
  "timings": {
    "open": "09:00",
    "close": "21:00"
  }
}
```

### POST /api/businesses
Create new business (Super Admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Business Name",
  "owner_email": "owner@example.com",
  "phone_number_id": "1234567890",
  "waba_id": "0987654321",
  "upi_id": "business@upi"
}
```

**Response:**
```json
{
  "success": true,
  "business_id": "new_business_id"
}
```

### PUT /api/businesses/:business_id
Update business details.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "display_name": "Updated Display Name",
  "logo_url": "https://...",
  "timings": {
    "open": "09:00",
    "close": "21:00"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Business updated"
}
```

### DELETE /api/businesses/:business_id
Delete business (Super Admin only).

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Business deleted"
}
```

---

## Menu Endpoints

### GET /api/menu/:business_id
Get menu items for a business.

**Response:**
```json
{
  "menu": [
    {
      "id": "item_id",
      "name": "Item Name",
      "category": "Category",
      "price": 500,
      "variants": [
        {
          "name": "500g",
          "price": 450
        }
      ],
      "is_available": true,
      "is_bestseller": false,
      "prep_time": "24 hours"
    }
  ]
}
```

### POST /api/menu/:business_id
Add new menu item.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Item Name",
  "category": "Category",
  "price": 500,
  "description": "Description",
  "image_url": "https://...",
  "prep_time": "24 hours",
  "is_bestseller": false
}
```

**Response:**
```json
{
  "success": true,
  "item_id": "new_item_id"
}
```

### PUT /api/menu/:business_id/:item_id
Update menu item.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "price": 550,
  "is_available": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu item updated"
}
```

### DELETE /api/menu/:business_id/:item_id
Delete menu item.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Menu item deleted"
}
```

---

## Customer Endpoints

### GET /api/customers/:business_id
Get all customers for a business.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "customers": [
    {
      "phone": "919876543210",
      "name": "Customer Name",
      "birthday": "1990-01-01",
      "total_orders": 5,
      "total_spent": 5000,
      "loyalty_points": 500,
      "tags": ["VIP"]
    }
  ]
}
```

### POST /api/customers/:business_id
Add new customer.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "phone": "919876543210",
  "name": "Customer Name",
  "birthday": "1990-01-01",
  "notes": "VIP customer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Customer added"
}
```

### PUT /api/customers/:business_id/:customer_id
Update customer details.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "birthday": "1990-01-01",
  "notes": "Updated notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Customer updated"
}
```

---

## Order Endpoints

### GET /api/orders/:business_id
Get orders for a business.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Filter by status (optional)
- `limit`: Number of orders (default: 100)

**Response:**
```json
{
  "orders": [
    {
      "id": "order_id",
      "customer_phone": "919876543210",
      "customer_name": "Customer Name",
      "items": [
        {
          "name": "Item Name",
          "quantity": 2,
          "price": 500
        }
      ],
      "total_amount": 1000,
      "status": "pending",
      "payment_status": "unpaid",
      "delivery_type": "delivery",
      "created_at": "2024-01-01T12:00:00"
    }
  ]
}
```

### POST /api/orders
Create new order.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "business_id": "business_id",
  "customer_phone": "919876543210",
  "customer_name": "Customer Name",
  "items": [
    {
      "name": "Item Name",
      "quantity": 2,
      "price": 500
    }
  ],
  "total_amount": 1000,
  "delivery_type": "delivery",
  "address": "Full address"
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "new_order_id",
  "payment_link": "https://your-app.com/pay/order_id?sig=..."
}
```

### PUT /api/orders/:order_id/status
Update order status.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order status updated"
}
```

---

## Campaign Endpoints

### GET /api/campaigns/:business_id
Get campaigns for a business.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "campaigns": [
    {
      "id": "campaign_id",
      "type": "offer_blast",
      "message": "Campaign message",
      "target": "all",
      "sent_count": 100,
      "created_at": "2024-01-01T12:00:00"
    }
  ]
}
```

### POST /api/campaigns/blast
Send campaign blast.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "business_id": "business_id",
  "type": "offer_blast",
  "target": "all",
  "message": "Special offer message!"
}
```

**Response:**
```json
{
  "success": true,
  "sent_count": 100,
  "message": "Campaign sent successfully"
}
```

---

## Analytics Endpoints

### GET /api/analytics/:business_id/dashboard
Get dashboard statistics.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "todays_orders": 10,
  "todays_revenue": 5000,
  "pending_orders": 3,
  "new_customers": 2,
  "total_customers": 50
}
```

### GET /api/analytics/:business_id/revenue
Get revenue by date.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `days`: Number of days (default: 30)

**Response:**
```json
{
  "revenue_by_date": {
    "2024-01-01": 5000,
    "2024-01-02": 6000
  }
}
```

### GET /api/analytics/:business_id/bestsellers
Get best selling items.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "bestsellers": [
    {
      "name": "Item Name",
      "count": 50
    }
  ]
}
```

---

## Payment Endpoints

### GET /pay/:order_id
Display payment page.

**Query Parameters:**
- `sig`: HMAC signature for verification

**Response:** HTML payment page

### POST /pay/confirm/:order_id
Confirm payment completion.

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed"
}
```

---

## Image Upload Endpoint

### POST /api/upload
Upload image to Cloudinary.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
- `file`: Image file (max 5MB)
- `business_id`: Business ID (optional)

**Response:**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/...",
  "public_id": "whatsapp-saas/business_id/menu/image_id"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Recommended to add in production:
- 100 requests per minute per IP
- 1000 requests per hour per user

---

## Webhooks

### WhatsApp Message Received
When a customer sends a message, the webhook receives:
```json
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "919876543210",
          "type": "text",
          "text": {
            "body": "Customer message"
          }
        }]
      }
    }]
  }]
}
```

---

## Testing

### Using cURL:
```bash
# Health check
curl http://localhost:8000/ping

# Get menu (no auth required)
curl http://localhost:8000/api/menu/cake_shop

# Get businesses (with auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/businesses
```

### Using Postman:
1. Import the API endpoints
2. Set Authorization header with Firebase JWT token
3. Test each endpoint

---

## Support

For issues or questions:
- Check DEPLOYMENT.md for setup
- Check COMPLETE_REVIEW.md for implementation details
- Review error logs in Render dashboard

---

**Last Updated:** June 10, 2026
**Version:** 1.0.0
