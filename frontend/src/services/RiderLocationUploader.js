/**
 * Rider Location Upload Service
 * Used by delivery partners to stream their location in real-time
 * 
 * This is a specialized version of LocationTracker for sending (not receiving) location data
 */

class RiderLocationUploader {
  constructor(orderId, token = null) {
    this.orderId = orderId;
    this.token = token;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectIntervals = [3000, 5000, 10000];
    this.listeners = new Map();
    this.isIntentionallyClosed = false;
    this.locationWatcher = null;
  }

  /**
   * Connect to the WebSocket server
   */
  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${window.location.host}/api/location/ws/location/${this.orderId}`;

    if (!this.token) {
      console.error('[RiderLocationUploader] Token required');
      this.emit('error', { message: 'Authentication token required' });
      return;
    }

    const urlWithToken = `${wsUrl}?token=${this.token}`;
    console.log(`[RiderLocationUploader] Connecting to ${wsUrl}`);

    try {
      this.ws = new WebSocket(urlWithToken);

      this.ws.onopen = () => {
        console.log(`[RiderLocationUploader] Connected to order ${this.orderId}`);
        this.reconnectAttempts = 0;
        this.emit('connected', { order_id: this.orderId });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log(`[RiderLocationUploader] Received:`, message);
          this.emit(message.type || 'message', message);
        } catch (error) {
          console.error('[RiderLocationUploader] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error(`[RiderLocationUploader] Error:`, error);
        this.emit('error', { message: error.message || 'WebSocket error' });
      };

      this.ws.onclose = () => {
        console.log(`[RiderLocationUploader] Disconnected from order ${this.orderId}`);
        this.emit('disconnected', { order_id: this.orderId });

        if (!this.isIntentionallyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('[RiderLocationUploader] Failed to create WebSocket:', error);
      this.emit('error', { message: error.message });
      if (!this.isIntentionallyClosed) {
        this.scheduleReconnect();
      }
    }
  }

  /**
   * Schedule a reconnection attempt with exponential backoff
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`[RiderLocationUploader] Max reconnection attempts (${this.maxReconnectAttempts}) reached`);
      this.emit('max_reconnect_attempts', {});
      return;
    }

    const delayIndex = Math.min(
      this.reconnectAttempts,
      this.reconnectIntervals.length - 1
    );
    const delay = this.reconnectIntervals[delayIndex];

    console.log(
      `[RiderLocationUploader] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  /**
   * Send location update to server
   */
  sendLocation(lat, lng, heading = null, speed = null, accuracy = null) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[RiderLocationUploader] WebSocket not connected');
      return false;
    }

    try {
      const payload = {
        lat,
        lng,
        ...(heading !== null && { heading }),
        ...(speed !== null && { speed }),
        ...(accuracy !== null && { accuracy }),
        timestamp: new Date().toISOString(),
      };

      this.ws.send(JSON.stringify(payload));
      console.log('[RiderLocationUploader] Location sent:', payload);
      return true;
    } catch (error) {
      console.error('[RiderLocationUploader] Failed to send location:', error);
      return false;
    }
  }

  /**
   * Start tracking and automatically sending location updates
   * Uses adaptive intervals: 2s when moving, 10s when stationary
   */
  startTracking(minSpeedForMoving = 10) {
    if (!navigator.geolocation) {
      console.error('[RiderLocationUploader] Geolocation not available');
      this.emit('error', { message: 'Geolocation not available' });
      return;
    }

    console.log('[RiderLocationUploader] Starting location tracking');

    this.locationWatcher = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, heading, speed } = pos.coords;

        // Determine if moving based on speed
        const isMoving = speed > minSpeedForMoving;

        // Send location
        this.sendLocation(latitude, longitude, heading, speed, accuracy);

        this.emit('location_sent', {
          lat: latitude,
          lng: longitude,
          speed,
          heading,
          isMoving,
        });
      },
      (error) => {
        console.error('[RiderLocationUploader] Geolocation error:', error);
        this.emit('geolocation_error', {
          message: error.message,
          code: error.code,
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0, // Don't cache
        timeout: 10000,
      }
    );
  }

  /**
   * Stop tracking location updates
   */
  stopTracking() {
    if (this.locationWatcher) {
      navigator.geolocation.clearWatch(this.locationWatcher);
      this.locationWatcher = null;
      console.log('[RiderLocationUploader] Location tracking stopped');
    }
  }

  /**
   * Subscribe to events
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  /**
   * Unsubscribe from events
   */
  off(eventType, callback) {
    if (!this.listeners.has(eventType)) return;
    const callbacks = this.listeners.get(eventType);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Emit event
   */
  emit(eventType, data) {
    if (!this.listeners.has(eventType)) return;
    this.listeners.get(eventType).forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[RiderLocationUploader] Error in ${eventType} listener:`, error);
      }
    });
  }

  /**
   * Close connection
   */
  close() {
    console.log(`[RiderLocationUploader] Closing connection to order ${this.orderId}`);
    this.isIntentionallyClosed = true;
    this.stopTracking();
    if (this.ws) {
      this.ws.close();
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

export default RiderLocationUploader;
