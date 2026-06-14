/**
 * WebSocket service for real-time location tracking
 * Handles connection management, reconnection logic, and message handling
 */

class LocationTracker {
  constructor(orderId, token = null) {
    this.orderId = orderId;
    this.token = token;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectIntervals = [3000, 5000, 10000]; // 3s, 5s, 10s
    this.listeners = new Map();
    this.isIntentionallyClosed = false;
  }

  /**
   * Connect to the WebSocket server
   */
  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${window.location.host}/api/location/ws/track/${this.orderId}`;

    console.log(`[LocationTracker] Connecting to ${wsUrl}`);

    try {
      this.ws = new WebSocket(this.token ? `${wsUrl}?token=${this.token}` : wsUrl);

      this.ws.onopen = () => {
        console.log(`[LocationTracker] Connected to order ${this.orderId}`);
        this.reconnectAttempts = 0;
        this.emit('connected', { order_id: this.orderId });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log(`[LocationTracker] Received:`, message);
          this.emit(message.type || 'message', message);
        } catch (error) {
          console.error('[LocationTracker] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error(`[LocationTracker] Error:`, error);
        this.emit('error', { message: error.message || 'WebSocket error' });
      };

      this.ws.onclose = () => {
        console.log(`[LocationTracker] Disconnected from order ${this.orderId}`);
        this.emit('disconnected', { order_id: this.orderId });

        if (!this.isIntentionallyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch (error) {
      console.error('[LocationTracker] Failed to create WebSocket:', error);
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
      console.error(`[LocationTracker] Max reconnection attempts (${this.maxReconnectAttempts}) reached`);
      this.emit('max_reconnect_attempts', {});
      return;
    }

    const delayIndex = Math.min(
      this.reconnectAttempts,
      this.reconnectIntervals.length - 1
    );
    const delay = this.reconnectIntervals[delayIndex];

    console.log(
      `[LocationTracker] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  /**
   * Subscribe to a specific message type
   */
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  /**
   * Unsubscribe from a specific message type
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
   * Emit an event to all subscribers
   */
  emit(eventType, data) {
    if (!this.listeners.has(eventType)) return;
    this.listeners.get(eventType).forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[LocationTracker] Error in ${eventType} listener:`, error);
      }
    });
  }

  /**
   * Send a ping message to keep connection alive
   */
  ping() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ping' }));
    }
  }

  /**
   * Close the WebSocket connection
   */
  close() {
    console.log(`[LocationTracker] Closing connection to order ${this.orderId}`);
    this.isIntentionallyClosed = true;
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

export default LocationTracker;
