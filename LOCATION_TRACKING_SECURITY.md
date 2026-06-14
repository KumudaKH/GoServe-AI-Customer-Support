# Live Location Tracking - Security & Integration Guide

## Overview

This guide explains how to implement the secure real-time location tracking system with JWT authentication for both customers (tracking deliveries) and riders (uploading their location).

## Security Features

### 1. JWT Token Validation
- All WebSocket connections require a valid JWT token
- Token is passed as a query parameter: `?token=<jwt_token>`
- Backend validates token signature and expiration
- Tokens are extracted from localStorage or passed via props

### 2. Authorization Checks

#### For Customers (Tracking Endpoint)
- Endpoint: `WS /api/location/ws/track/{order_id}?token=<jwt>`
- Verification: User must own the order (`order.user_id == current_user_id`)
- If not authorized: Connection is rejected with code `1008`

#### For Riders (Upload Endpoint)
- Endpoint: `WS /api/location/ws/location/{order_id}?token=<jwt>`
- Verification: User must be assigned to the order (`DeliveryAssignment.rider_id == current_user_id`)
- If not authorized: Connection is rejected with code `1008`

### 3. Error Codes
- `WS_1008_POLICY_VIOLATION`: Authentication/authorization failed
- Standard WebSocket close codes for connection issues

---

## Backend Implementation (Already Done ✅)

### Location Routes (`app/routes/location.py`)

#### JWT Validation Helper
```python
def verify_websocket_token(token: str) -> dict:
    """Verify JWT token and return payload"""
    if not token:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION)
```

#### REST Endpoints
- `GET /api/location/orders/{order_id}/last-location` - Fetch initial location (requires auth)
- `POST /api/location/orders/{order_id}/update` - Update location (requires auth + rider verification)

#### WebSocket Endpoints (Secure)
- `WS /api/location/ws/track/{order_id}?token=<jwt>` - Customer tracking
- `WS /api/location/ws/location/{order_id}?token=<jwt>` - Rider upload

---

## Frontend Implementation

### For Customers (LiveDeliveryMap.jsx)

```jsx
import LiveDeliveryMap from '../components/LiveDeliveryMap';

export default function OrderTrackingPage({ orderId }) {
  const token = localStorage.getItem('token');

  return (
    <LiveDeliveryMap
      orderId={orderId}
      deliveryCoords={{ lat: 28.6139, lng: 77.209 }}
      token={token}  // Pass JWT token
      showFollowMe={true}
    />
  );
}
```

### For Riders (Example Implementation)

```jsx
import RiderLocationUploader from '../services/RiderLocationUploader';
import { useEffect, useState } from 'react';

export default function RiderDeliveryPage({ orderId }) {
  const [status, setStatus] = useState('connecting');
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Initialize uploader
    const uploader = new RiderLocationUploader(orderId, token);

    // Set up event listeners
    uploader.on('connected', () => {
      setStatus('tracking');
      console.log('Connected to order:', orderId);
    });

    uploader.on('location_sent', (data) => {
      console.log('Location sent:', data);
    });

    uploader.on('error', (error) => {
      setStatus('error');
      console.error('Error:', error.message);
    });

    uploader.on('disconnected', () => {
      setStatus('disconnected');
    });

    // Connect and start tracking
    uploader.connect();
    uploader.startTracking();

    return () => {
      uploader.close();
    };
  }, [orderId, token]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Delivery Tracking</h1>
      <p>Status: <strong>{status}</strong></p>
      <p>Uploading your live location to order #{orderId}</p>
    </div>
  );
}
```

---

## API Usage Examples

### Customer: Fetch Last Known Location

```bash
curl -X GET http://localhost:8000/api/location/orders/1/last-location \
  -H "Authorization: Bearer <jwt_token>"
```

Response:
```json
{
  "order_id": 1,
  "lat": 28.6139,
  "lng": 77.209,
  "heading": 45.5,
  "speed": 25.0,
  "accuracy": 10.0,
  "last_updated": "2026-06-14T12:30:45.123456"
}
```

### Customer: Connect WebSocket (JavaScript)

```javascript
import LocationTracker from '../services/LocationTracker';

const tracker = new LocationTracker(1, localStorage.getItem('token'));

tracker.on('connected', () => {
  console.log('Connected to tracking');
});

tracker.on('location_update', (data) => {
  console.log('Rider location:', data.lat, data.lng);
  console.log('Speed:', data.speed, 'km/h');
});

tracker.on('error', (error) => {
  console.error('Connection error:', error.message);
});

tracker.connect();
```

### Rider: Update Location (REST - One-time Update)

```bash
curl -X POST http://localhost:8000/api/location/orders/1/update \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 28.6139,
    "lng": 77.209,
    "speed": 25.0,
    "heading": 45.5,
    "accuracy": 10.0
  }'
```

### Rider: Stream Location (WebSocket - Continuous)

```javascript
import RiderLocationUploader from '../services/RiderLocationUploader';

const uploader = new RiderLocationUploader(1, localStorage.getItem('token'));

uploader.on('connected', () => {
  console.log('Ready to upload locations');
  uploader.startTracking(); // Auto-send every 2-10s based on speed
});

uploader.on('location_sent', (data) => {
  console.log('Sent location:', data);
});

uploader.on('ack', (data) => {
  console.log('Server confirmed:', data.status);
});

uploader.connect();
```

---

## Integration Checklist

### Backend
- [x] JWT validation helper function
- [x] Customer authorization (order ownership)
- [x] Rider authorization (delivery assignment)
- [x] WebSocket endpoints secured
- [x] REST endpoints secured with OAuth2

### Frontend - Customer
- [x] LocationTracker service with token support
- [x] LiveDeliveryMap component with WebSocket integration
- [x] Example OrderTrackingPage
- [x] Real-time marker animation
- [x] Connection status indicator

### Frontend - Rider
- [x] RiderLocationUploader service
- [x] Adaptive location sending (2s when moving, 10s when stationary)
- [x] Geolocation integration
- [x] Auto-reconnect with exponential backoff
- [x] Geolocation error handling

### Testing Needed
- [ ] Test customer can't access other orders
- [ ] Test rider can't upload to unassigned orders
- [ ] Test token expiration handling
- [ ] Test connection recovery
- [ ] Test Redis persistence

---

## Token Flow

### 1. Login/Registration
```
Client → POST /api/auth/login → Backend
Backend → Generate JWT (sub = user_id, role = rider/customer)
Backend → Return JWT to Client
```

### 2. Store Token
```
Client → localStorage.setItem('token', jwt)
```

### 3. WebSocket Connection
```
Client → WS /api/location/ws/track/1?token=<jwt>
Backend → Decode JWT, extract user_id
Backend → Verify user_id owns order_id=1
Backend → Accept or reject connection
```

---

## Security Best Practices

✅ **Token Validation**: All WebSocket connections validate JWT
✅ **Authorization**: Verify user ownership/assignment before accepting connection
✅ **Error Handling**: Return 1008 code for auth failures (not 1011)
✅ **Token Storage**: Use localStorage (consider httpOnly cookies for production)
✅ **HTTPS/WSS**: Always use WSS in production

⚠️ **Not Yet Implemented**:
- [ ] Token refresh for long-running connections
- [ ] Rate limiting for location updates
- [ ] Audit logging for location access
- [ ] Encryption of coordinates in transit (WSS handles this)
- [ ] Role-based access control (RBAC)

---

## Testing the Implementation

### Test 1: Customer Authorization
```bash
# Get token as customer
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer1","password":"pass"}' | jq -r '.access_token')

# Try to access order 1 (their own)
curl -X GET http://localhost:8000/api/location/orders/1/last-location \
  -H "Authorization: Bearer $TOKEN"  # ✅ Should work

# Try to access order 999 (not owned)
curl -X GET http://localhost:8000/api/location/orders/999/last-location \
  -H "Authorization: Bearer $TOKEN"  # ❌ Should return 404
```

### Test 2: Rider Authorization
```bash
# Get rider token
RIDER_TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"rider1","password":"pass"}' | jq -r '.access_token')

# Update location for assigned order
curl -X POST http://localhost:8000/api/location/orders/1/update \
  -H "Authorization: Bearer $RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat":28.6139,"lng":77.209,"speed":25}'  # ✅ Should work if assigned

# Update location for unassigned order
curl -X POST http://localhost:8000/api/location/orders/99/update \
  -H "Authorization: Bearer $RIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat":28.6139,"lng":77.209}'  # ❌ Should return 403
```

### Test 3: Invalid Token
```bash
# Try WebSocket with bad token
wscat -c "ws://localhost:8000/api/location/ws/track/1?token=invalid"
# ❌ Connection should close with code 1008
```

---

## Next Steps

1. **Deploy & Test**: Run the full stack and test all scenarios
2. **Add Monitoring**: Log location updates for audit trail
3. **Implement Rate Limiting**: Prevent abuse of location API
4. **Add Notifications**: Notify customer when rider nearby (ETA < 5 min)
5. **Mobile Integration**: Build rider app for iOS/Android with background tracking
6. **Analytics**: Track delivery patterns, average speeds, etc.
