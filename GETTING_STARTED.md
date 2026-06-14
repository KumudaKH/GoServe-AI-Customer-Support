# 🚀 Getting Started - Live Location Tracking

## Quick Start (5 minutes)

### 1. Install Dependencies

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Start Redis

```bash
# Option 1: Docker (recommended)
docker run -d -p 6379:6379 --name redis-loc redis:latest

# Option 2: Local installation
redis-server

# Option 3: Verify it's running
redis-cli ping
# Should return: PONG
```

### 3. Configure Environment

**Backend (.env):**
```bash
cd backend
echo 'REDIS_URL=redis://localhost:6379/0' > .env
```

**Frontend (.env.local):**
```bash
cd frontend
echo 'REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here' > .env.local
echo 'REACT_APP_API_URL=http://localhost:8000' >> .env.local
```

### 4. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload --port 8000
# Watch for: Uvicorn running on http://127.0.0.1:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Watch for: VITE v... ready in ... ms
```

**Terminal 3 - Monitor Redis (optional):**
```bash
redis-cli monitor
# Shows all Redis commands in real-time
```

### 5. Test in Browser

1. Open http://localhost:5173 (frontend URL)
2. Login with test credentials
3. Navigate to an order tracking page
4. You should see the map with delivery marker

---

## Testing Scenarios

### Scenario 1: Customer Tracks Order

**Setup:**
1. Login as customer in browser
2. Navigate to "Track Order" page for order #1

**Expected:**
- Map loads with delivery location
- See all markers (your location in blue, delivery destination in red)
- Connection status shows "Live Tracking"

**To Test:**
```javascript
// In browser console
localStorage.getItem('token')  // Should show JWT

// Check WebSocket
// Open DevTools → Network tab → WS tab
// Should see: ws://localhost:8000/api/location/ws/track/1
```

### Scenario 2: Rider Uploads Location

**Setup:**
1. Create test page to simulate rider
2. Create HTML file with:

```html
<!DOCTYPE html>
<html>
<body>
  <h1>Rider Location Upload Test</h1>
  <button id="startBtn">Start Tracking</button>
  <button id="stopBtn">Stop Tracking</button>
  <p id="status">Ready</p>
  
  <script type="module">
    import RiderLocationUploader from './src/services/RiderLocationUploader.js';
    
    const uploader = new RiderLocationUploader(
      1,  // order ID
      localStorage.getItem('token')
    );
    
    document.getElementById('startBtn').addEventListener('click', () => {
      uploader.on('connected', () => {
        document.getElementById('status').textContent = 'Uploading...';
        uploader.startTracking();
      });
      uploader.connect();
    });
    
    document.getElementById('stopBtn').addEventListener('click', () => {
      uploader.close();
      document.getElementById('status').textContent = 'Stopped';
    });
  </script>
</body>
</html>
```

**Expected:**
- Rider connects to WebSocket
- Location updates every 2-10 seconds
- Customer sees real-time marker updates
- Marker animates smoothly (2 second transition)

### Scenario 3: Authorization Test

**Customer cannot track other orders:**
```bash
# Login as customer_1
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"customer_1","password":"pass"}' | jq -r '.access_token')

# Try to access order owned by customer_2
curl -X GET http://localhost:8000/api/location/orders/999/last-location \
  -H "Authorization: Bearer $TOKEN"
# Expected: 404 Not found
```

**Rider cannot upload to unassigned orders:**
```bash
# Login as rider_1
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"rider_1","password":"pass"}' | jq -r '.access_token')

# Try to update unassigned order
curl -X POST http://localhost:8000/api/location/orders/99/update \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lat": 28.6139, "lng": 77.209}'
# Expected: 403 Forbidden
```

---

## Redis Debugging

### View Active Locations

```bash
redis-cli
> KEYS "order:*:location"
# Lists all orders with active tracking

> GET "order:1:location"
# Shows last location for order 1
# Example: {"lat":28.6139,"lng":77.209,"speed":25.0,"heading":45.5}
```

### Monitor Location Updates

```bash
# Terminal 1: Start monitoring
redis-cli monitor

# Terminal 2: Have rider send location
# You'll see in terminal 1:
# "SET" "order:1:location" '{"lat":28.615,"lng":77.215,...}'
# "PUBLISH" "order_tracking_1" '{"order_id":1,"lat":28.615,...}'
```

### Check TTL

```bash
redis-cli
> TTL "order:1:location"
# Should return: 3599 (or close to 3600)
# Means location expires in ~1 hour

> EXPIRE "order:1:location" 10
# Set new TTL to 10 seconds for testing
```

---

## Common Issues & Solutions

### Issue: WebSocket Connection Refused
```
Error: Failed to create WebSocket: Error connecting to ws://localhost:8000/...
```

**Solution:**
- [ ] Backend running? `uvicorn main:app --reload --port 8000`
- [ ] Redis running? `redis-cli ping` should return PONG
- [ ] Token included? Check browser console for token value
- [ ] Check CORS origins in backend/main.py

### Issue: "Invalid token" Error
```
WebSocketException: code=1008, reason="Invalid token"
```

**Solution:**
- [ ] Token expired? Login again
- [ ] Token format? Should be JWT without "Bearer " prefix
- [ ] SECRET_KEY matches? Check backend/app/utils/security.py

### Issue: "Not authorized" Error
```
WebSocketException: code=1008, reason="Not authorized"
```

**Solution:**
- [ ] For customers: Order must be in your user's orders
- [ ] For riders: Order must have delivery assignment to you
- [ ] Check database: `SELECT * FROM orders WHERE order_id=1;`
- [ ] Check assignment: `SELECT * FROM delivery_assignment WHERE order_id=1;`

### Issue: Location not updating
```
WebSocket connected but no location_update events
```

**Solution:**
- [ ] Rider needs to upload location first (REST or WebSocket)
- [ ] Redis needs to have data: `redis-cli GET "order:1:location"`
- [ ] Check browser DevTools Network tab for messages
- [ ] Check backend logs for errors

### Issue: Marker not animating
```
Marker jumps instead of smoothly moving
```

**Solution:**
- [ ] Check LiveDeliveryMap component props
- [ ] Verify `trackingCoords` is being updated
- [ ] Check browser console for animation errors
- [ ] Try disabling other features to isolate issue

---

## Browser Console Debugging

### Check Location Service
```javascript
// See all location tracker events
tracker.on('connected', () => console.log('Connected'));
tracker.on('location_update', (data) => console.log('Update:', data));
tracker.on('error', (err) => console.log('Error:', err));
tracker.on('disconnected', () => console.log('Disconnected'));
```

### Check WebSocket Status
```javascript
// Check connection state
console.log(tracker.isConnected());  // true/false
console.log(tracker.ws.readyState);  // 0=connecting, 1=open, 2=closing, 3=closed
```

### Simulate Location Update
```javascript
// Manually trigger update for testing
tracker.emit('location_update', {
  lat: 28.615,
  lng: 77.215,
  speed: 30,
  heading: 180
});
```

### Monitor All Network Traffic
```javascript
// Open DevTools → Network tab
// Filter by "WS" to see WebSocket connections
// Click on connection to see messages in "Messages" tab
```

---

## Development Tips

### 1. Use Redis GUI (Optional)
```bash
# Install Redis GUI tools
brew install redisinsight  # macOS
# OR visit: https://redis.io/insight/

# Connect to localhost:6379
# Visual way to explore data
```

### 2. Use Thunder Client or Postman
Instead of curl for testing REST endpoints:
- Import API endpoints
- Save test requests
- Easy to switch between environments

### 3. Mock Rider Data
```javascript
// Instead of real geolocation, use test data
const testLocations = [
  { lat: 28.6139, lng: 77.2090, speed: 0 },
  { lat: 28.6145, lng: 77.2110, speed: 25 },
  { lat: 28.6150, lng: 77.2130, speed: 30 },
  // ... more locations
];

let index = 0;
setInterval(() => {
  uploader.sendLocation(
    testLocations[index].lat,
    testLocations[index].lng,
    0,
    testLocations[index].speed
  );
  index = (index + 1) % testLocations.length;
}, 5000);
```

### 4. Performance Testing
```bash
# Load test the WebSocket endpoint
# Install artillery: npm install -g artillery

artillery quick --count 100 --num 1000 ws://localhost:8000/api/location/ws/track/1?token=jwt
```

---

## Next Steps After Setup

1. ✅ **Verify everything works** - Follow scenarios above
2. ⏭️ **Add mobile integration** - React Native/Flutter app for riders
3. ⏭️ **Implement ETA** - Calculate based on speed and distance
4. ⏭️ **Add notifications** - Alert customer when rider nearby
5. ⏭️ **Deploy to production** - Use WSS, configure domains

---

## Support & Documentation

- **Full Guide**: See `LOCATION_TRACKING_SECURITY.md`
- **API Reference**: See `LOCATION_TRACKING_QUICK_REFERENCE.md`
- **Completion Report**: See `PHASE_2_COMPLETION.md`

---

## Questions?

### Debug logs show nothing?
1. Make sure you're starting backend with `--reload`
2. Check browser console for [LocationTracker] logs
3. Enable print statements in location_service.py

### Still stuck?
1. Review the LOCATION_TRACKING_SECURITY.md guide
2. Check TestingScenarios section above
3. Verify all prerequisites are installed
4. Check that ports 8000 (backend) and 5173 (frontend) are free

---

## ✅ Validation Checklist

Before declaring setup complete:

- [ ] Backend running without errors
- [ ] Frontend running without errors
- [ ] Redis connection working (`redis-cli ping`)
- [ ] Can login to application
- [ ] Can view order tracking page
- [ ] Map loads with correct location
- [ ] WebSocket shows "Live Tracking" status
- [ ] Can test authorization (customer/rider)
- [ ] Location updates visible in Redis
- [ ] Browser console shows no errors

Once all above pass: **System is ready for development! 🎉**
