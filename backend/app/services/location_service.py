import json
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import os

# Try to import redis, fallback to mock implementation
try:
    import redis
    REDIS_AVAILABLE = True
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
except (ImportError, Exception) as e:
    print(f"⚠️  Redis not available ({type(e).__name__}). Using in-memory mock.")
    REDIS_AVAILABLE = False
    redis_client = None

# In-memory mock for when Redis is not available
_memory_store = {}
_pubsub_subscribers: Dict[str, list] = {}

class LocationService:
    """Service for managing real-time delivery location tracking"""
    
    LOCATION_KEY_PREFIX = "order:{order_id}:location"
    TRACKING_CHANNEL_PREFIX = "order_tracking_{order_id}"
    TTL = 3600  # 1 hour
    
    @staticmethod
    def _set(key: str, value: str, ttl: int = TTL):
        """Helper to set value in Redis or memory store"""
        if REDIS_AVAILABLE and redis_client:
            try:
                redis_client.setex(key, ttl, value)
            except Exception as e:
                print(f"Redis error: {e}. Falling back to memory store.")
                _memory_store[key] = {"value": value, "expires_at": datetime.now().timestamp() + ttl}
        else:
            _memory_store[key] = {"value": value, "expires_at": datetime.now().timestamp() + ttl}
    
    @staticmethod
    def _get(key: str) -> Optional[str]:
        """Helper to get value from Redis or memory store"""
        if REDIS_AVAILABLE and redis_client:
            try:
                return redis_client.get(key)
            except Exception as e:
                print(f"Redis error: {e}. Using memory store.")
                return _memory_store.get(key, {}).get("value") if _memory_store.get(key, {}).get("expires_at", 0) > datetime.now().timestamp() else None
        else:
            data = _memory_store.get(key, {})
            if data.get("expires_at", 0) > datetime.now().timestamp():
                return data.get("value")
            return None
    
    @staticmethod
    def _delete(key: str):
        """Helper to delete value from Redis or memory store"""
        if REDIS_AVAILABLE and redis_client:
            try:
                redis_client.delete(key)
            except Exception:
                _memory_store.pop(key, None)
        else:
            _memory_store.pop(key, None)
    
    @staticmethod
    def _publish(channel: str, message: str) -> int:
        """Helper to publish message to Redis or memory store subscribers"""
        if REDIS_AVAILABLE and redis_client:
            try:
                return redis_client.publish(channel, message)
            except Exception as e:
                print(f"Redis publish error: {e}. Using memory store.")
                if channel not in _pubsub_subscribers:
                    return 0
                for callback in _pubsub_subscribers.get(channel, []):
                    try:
                        callback(message)
                    except:
                        pass
                return len(_pubsub_subscribers.get(channel, []))
        else:
            if channel not in _pubsub_subscribers:
                return 0
            for callback in _pubsub_subscribers.get(channel, []):
                try:
                    callback(message)
                except:
                    pass
            return len(_pubsub_subscribers.get(channel, []))
    
    @staticmethod
    def save_location(order_id: int, location_data: Dict[str, Any]) -> bool:
        """
        Save latest location to Redis with TTL
        
        Args:
            order_id: Order ID
            location_data: {lat, lng, timestamp, heading, speed}
        """
        try:
            key = LocationService.LOCATION_KEY_PREFIX.format(order_id=order_id)
            LocationService._set(
                key,
                json.dumps({
                    **location_data,
                    "last_updated": datetime.now().isoformat()
                }),
                LocationService.TTL
            )
            return True
        except Exception as e:
            print(f"Error saving location: {e}")
            return False
    
    @staticmethod
    def get_location(order_id: int) -> Optional[Dict[str, Any]]:
        """
        Retrieve last known location for an order
        
        Args:
            order_id: Order ID
            
        Returns:
            Location data or None if not found
        """
        try:
            key = LocationService.LOCATION_KEY_PREFIX.format(order_id=order_id)
            location = LocationService._get(key)
            if location:
                return json.loads(location)
            return None
        except Exception as e:
            print(f"Error retrieving location: {e}")
            return None
    
    @staticmethod
    def publish_location(order_id: int, location_data: Dict[str, Any]) -> int:
        """
        Publish location update to Redis Pub/Sub channel
        
        Args:
            order_id: Order ID
            location_data: Location coordinates and metadata
            
        Returns:
            Number of subscribers that received the message
        """
        try:
            channel = LocationService.TRACKING_CHANNEL_PREFIX.format(order_id=order_id)
            message = json.dumps({
                "order_id": order_id,
                **location_data,
                "timestamp": datetime.now().isoformat()
            })
            return LocationService._publish(channel, message)
        except Exception as e:
            print(f"Error publishing location: {e}")
            return 0
    
    @staticmethod
    def update_and_publish(order_id: int, location_data: Dict[str, Any]) -> bool:
        """
        Save location to state store and publish to subscribers
        
        Args:
            order_id: Order ID
            location_data: Location data to update
            
        Returns:
            True if successful
        """
        saved = LocationService.save_location(order_id, location_data)
        subscribers = LocationService.publish_location(order_id, location_data)
        print(f"Location update for order {order_id}: saved={saved}, subscribers={subscribers}")
        return saved
    
    @staticmethod
    def clear_location(order_id: int) -> bool:
        """
        Clear location data for an order (when delivery is complete)
        
        Args:
            order_id: Order ID
            
        Returns:
            True if successful
        """
        try:
            key = LocationService.LOCATION_KEY_PREFIX.format(order_id=order_id)
            LocationService._delete(key)
            return True
        except Exception as e:
            print(f"Error clearing location: {e}")
            return False

# Pub/Sub for background consumers
class LocationSubscriber:
    """Helper for subscribing to location updates"""
    
    def __init__(self):
        if REDIS_AVAILABLE and redis_client:
            self.pubsub = redis_client.pubsub()
        else:
            self.pubsub = None
    
    def subscribe_to_order(self, order_id: int, callback=None):
        """Subscribe to location updates for an order"""
        channel = LocationService.TRACKING_CHANNEL_PREFIX.format(order_id=order_id)
        if self.pubsub:
            self.pubsub.subscribe(channel)
        elif callback:
            if channel not in _pubsub_subscribers:
                _pubsub_subscribers[channel] = []
            _pubsub_subscribers[channel].append(callback)
    
    def unsubscribe_from_order(self, order_id: int):
        """Unsubscribe from order location updates"""
        channel = LocationService.TRACKING_CHANNEL_PREFIX.format(order_id=order_id)
        if self.pubsub:
            self.pubsub.unsubscribe(channel)
    
    def listen(self):
        """Listen for incoming messages"""
        if self.pubsub:
            return self.pubsub.listen()
        return []
