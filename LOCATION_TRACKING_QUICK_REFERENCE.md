# Quick Reference - Live Location Tracking API

## REST Endpoints

### Get Last Known Location
```
GET /api/location/orders/{order_id}/last-location

Headers:
  Authorization: Bearer <jwt_token>

Response (200):
{
  "order_id": 1,
  "lat": 28.6139,
  "lng": 77.209,
  "heading": 45.5,
  "speed": 25.0,
  "accuracy": 10.0,
  "last_updated": "2026-06-14T12:30:45.123456"
}

Errors:
  404 - Order not found or not authorized
  401 - Invalid token
```

### Update Location (Rider/Partner)
```
POST /api/location/orders/{order_id}/update

Headers:
  Authorization: Bearer <jwt_token>
  Content-Type: application/json

Body:
{
  "lat": 28.6139,
  "lng": 77.209,
  "heading": 45.5,        // optional
  "speed": 25.0,          // optional (km/h)
  "accuracy": 10.0        // optional (meters)
}

Response (200):
{
  "status": "success",
  "message": "Location updated"
}

Errors:
  403 - Not assigned to this order
  404 - Order not found
  401 - Invalid token
```

---

## WebSocket Endpoints

### Customer: Track Delivery
```
WS /api/location/ws/track/{order_id}?token=<jwt_token>

Connection Success:
{
  "type": "connected",
  "order_id": 1
}

Incoming Message (Location Update):
{
  "type": "location_update",
  "order_id": 1,
  "lat": 28.6139,
  "lng": 77.209,
  "heading": 45.5,
  "speed": 25.0,
  "accuracy": 10.0,
  "timestamp": "2026-06-14T12:30:45.123456",
  "last_updated": "2026-06-14T12:30:45.123456"
}

Outgoing Message (Keep-Alive):
{
  "type": "ping"
}

Response (Keep-Alive):
{
  "type": "pong",
  "message": "Connection alive"
}

Errors:
  Code 1008 - Authentication failed (invalid/missing token)
  Code 1008 - Not authorized to view this order
```

### Rider: Upload Location
```
WS /api/location/ws/location/{order_id}?token=<jwt_token>

Connection Success:
{
  "type": "connected",
  "message": "Connected as location provider",
  "order_id": 1
}

Send Location:
{
  "lat": 28.6139,
  "lng": 77.209,
  "heading": 45.5,       // optional
  "speed": 25.0,         // optional
  "accuracy": 10.0,      // optional
  "timestamp": "2026-06-14T12:30:45.123456"
}

Receive Acknowledgment:
{
  "type": "ack",
  "status": "received",
  "timestamp": "2026-06-14T12:30:45.123456"
}

Receive Error:
{
  "type": "error",
  "message": "Error message"
}

Errors:
  Code 1008 - Authentication failed (invalid/missing token)
  Code 1008 - Not assigned to this order
```

---

## Frontend Usage

### Customer: Track Order
```jsx
import LiveDeliveryMap from '../components/LiveDeliveryMap';

<LiveDeliveryMap
  orderId={1}
  deliveryCoords={{ lat: 28.6139, lng: 77.209 }}
  trackingCoords={riderLocation}
  onLocationUpdate={(location) => console.log(location)}
  token={localStorage.getItem('token')}
  showFollowMe={true}
/>
```

### Rider: Upload Location
```jsx
import RiderLocationUploader from '../services/RiderLocationUploader';

const uploader = new RiderLocationUploader(
  1,                              // orderId
  localStorage.getItem('token')   // token
);

uploader.on('connected', () => {
  uploader.startTracking();
});

uploader.on('location_sent', (data) => {
  console.log('Location sent:', data);
});

uploader.connect();
```

---

## Status Codes

### WebSocket Close Codes
| Code | Reason | Action |
|------|--------|--------|
| 1000 | Normal closure | Connection ended normally |
| 1008 | Policy violation | Auth/authorization failed - check token |
| 1011 | Server error | Server error - retry with backoff |
| 1006 | Abnormal closure | Connection lost - auto-reconnect triggered |

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (invalid JSON/parameters) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (not authorized for resource) |
| 404 | Not found |
| 500 | Server error |

---

## Event Types (WebSocket)

### Customer Receives
- `location_update` - Rider location changed
- `pong` - Response to keep-alive ping
- `error` - Generic error message

### Rider Receives
- `connected` - Successfully connected
- `ack` - Location update acknowledged
- `error` - Failed to process location

### Rider Sends
- Location object - `{lat, lng, ...}`

### Customer Sends
- `{"type": "ping"}` - Keep connection alive

---

## Connection Management

### Auto-Reconnect Strategy
```
Attempt 1: Wait 3 seconds
Attempt 2: Wait 5 seconds
Attempt 3+: Wait 10 seconds
Max attempts: 10
```

### Keep-Alive
```
Every 30 seconds: Send ping (prevents idle disconnect)
```

### Clean Disconnect
```javascript
tracker.close();  // Stops auto-reconnect
uploader.close(); // Stops location tracking
```

---

## Example: Complete Flow

### 1. Customer Places Order
```
Customer → Place Order → Backend creates Order(user_id=123, order_id=1)
```

### 2. Rider Assigned
```
Backend → Create DeliveryAssignment(order_id=1, rider_id=456)
Backend → Send notification to rider
```

### 3. Customer Checks Tracking
```
Customer → GET /api/location/orders/1/last-location
Backend → Check: order.user_id == 123 ✅ Allowed
Backend → Get last location from Redis
Backend → Return location coordinates
Customer → Initialize map with coordinates
```

### 4. Customer Opens Live Tracking
```
Customer → WS /api/location/ws/track/1?token=jwt_123
Backend → Verify JWT (sub=123)
Backend → Check: order.user_id == 123 ✅ Allowed
Backend → Accept WebSocket connection
Backend → Send last known location
```

### 5. Rider Starts Delivering
```
Rider → WS /api/location/ws/location/1?token=jwt_456
Backend → Verify JWT (sub=456)
Backend → Check: DeliveryAssignment.rider_id == 456 ✅ Allowed
Backend → Accept WebSocket connection
Backend → Send "Connected" confirmation
```

### 6. Rider Moves, Sends Location
```
Rider Device → Get GPS coordinates every 2-10s
Rider Device → Send {lat: 28.61, lng: 77.21, speed: 25}
Backend → Validate & Save to Redis
Backend → Publish to order_tracking_1 channel
Backend → Send ACK to rider
Backend → Broadcast to all tracking customers
Customer → Receive update, animate marker smoothly
```

### 7. Delivery Complete
```
Rider → Mark delivery complete (REST API)
Backend → Clear location from Redis (ttl expires)
Customer → Tracking stops (no new updates)
```

---

## Debugging

### Check Connection
```javascript
tracker.isConnected() // true/false
```

### Listen to All Events
```javascript
tracker.on('connected', (data) => console.log('Connected:', data));
tracker.on('location_update', (data) => console.log('Update:', data));
tracker.on('disconnected', (data) => console.log('Disconnected:', data));
tracker.on('error', (data) => console.log('Error:', data));
```

### Enable Verbose Logging
Browser DevTools Console shows all [LocationTracker] and [RiderLocationUploader] logs

### Test WebSocket
```bash
# Install wscat: npm install -g wscat
wscat -c "ws://localhost:8000/api/location/ws/track/1?token=your_token_here"
```

### Monitor Redis
```bash
# In Redis CLI
redis-cli
> KEYS "order:*:location"
> GET "order:1:location"
> SUBSCRIBE "order_tracking_1"
```
