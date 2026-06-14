import { useEffect, useMemo, useState, useRef } from 'react';
import Map, { Marker, NavigationControl, FlyToInterpolator } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import LocationTracker from '../services/LocationTracker';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

/**
 * Interpolate between two coordinates smoothly
 * Used for smooth marker animation when location updates arrive
 */
function interpolateCoordinates(from, to, progress) {
  return {
    lng: from.lng + (to.lng - from.lng) * progress,
    lat: from.lat + (to.lat - from.lat) * progress,
  };
}

export default function LiveDeliveryMap({
  orderId,
  deliveryCoords,
  trackingCoords,
  onLocationUpdate,
  token = null,
  showFollowMe = true,
}) {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(deliveryCoords);
  const [riderLocation, setRiderLocation] = useState(trackingCoords);
  const [followMode, setFollowMode] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [viewport, setViewport] = useState({
    longitude: deliveryCoords?.lng || 0,
    latitude: deliveryCoords?.lat || 0,
    zoom: 12,
  });

  const trackerRef = useRef(null);
  const animationRef = useRef(null);
  const keepAliveIntervalRef = useRef(null);
  const lastLocationRef = useRef(riderLocation);

  // Initialize geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(loc);
      },
      (err) => console.error('Geolocation error', err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  // Initialize WebSocket connection for real-time tracking
  useEffect(() => {
    if (!orderId) return;

    console.log(`[LiveDeliveryMap] Initializing WebSocket for order ${orderId}`);

    // Create tracker instance
    const tracker = new LocationTracker(orderId, token);
    trackerRef.current = tracker;

    // Set up event listeners
    tracker.on('connected', () => {
      console.log('[LiveDeliveryMap] Connected to tracking server');
      setConnectionStatus('connected');
    });

    tracker.on('location_update', (data) => {
      console.log('[LiveDeliveryMap] Received location update:', data);
      handleLocationUpdate(data);
    });

    tracker.on('disconnected', () => {
      console.log('[LiveDeliveryMap] Disconnected from tracking server');
      setConnectionStatus('disconnected');
    });

    tracker.on('error', (error) => {
      console.error('[LiveDeliveryMap] Tracker error:', error);
      setConnectionStatus('error');
    });

    tracker.on('max_reconnect_attempts', () => {
      console.error('[LiveDeliveryMap] Max reconnection attempts reached');
      setConnectionStatus('failed');
    });

    // Connect to WebSocket
    tracker.connect();

    // Set up keep-alive ping every 30 seconds
    keepAliveIntervalRef.current = setInterval(() => {
      if (tracker.isConnected()) {
        tracker.ping();
      }
    }, 30000);

    return () => {
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
      tracker.close();
    };
  }, [orderId, token]);

  // Handle new location updates with smooth animation
  function handleLocationUpdate(data) {
    const newLocation = {
      lat: data.lat,
      lng: data.lng,
    };

    // Update rider location (will animate smoothly)
    lastLocationRef.current = riderLocation || newLocation;

    // Start smooth animation
    animateMarker(lastLocationRef.current, newLocation, 2000); // 2 second animation

    // Update parent callback
    if (onLocationUpdate) {
      onLocationUpdate(newLocation);
    }

    // Update viewport if follow mode is enabled
    if (followMode) {
      setViewport((prev) => ({
        ...prev,
        latitude: newLocation.lat,
        longitude: newLocation.lng,
        transitionDuration: 1000,
        transitionInterpolator: new FlyToInterpolator(),
      }));
    }
  }

  // Smooth marker animation using requestAnimationFrame
  function animateMarker(from, to, duration) {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startTime = Date.now();

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const interpolated = interpolateCoordinates(from, to, progress);
      setRiderLocation(interpolated);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        lastLocationRef.current = to;
        setRiderLocation(to);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }

  // Update delivery marker
  useEffect(() => {
    if (deliveryCoords) {
      setViewport((prev) => ({
        ...prev,
        latitude: deliveryCoords.lat,
        longitude: deliveryCoords.lng,
        zoom: 13,
        transitionDuration: 1000,
        transitionInterpolator: new FlyToInterpolator(),
      }));
      setSelectedMarker(deliveryCoords);
    }
  }, [deliveryCoords]);

  // Calculate bounds between delivery and rider location
  const bounds = useMemo(() => {
    if (riderLocation && selectedMarker) {
      return [
        [
          Math.min(selectedMarker.lng, riderLocation.lng),
          Math.min(selectedMarker.lat, riderLocation.lat),
        ],
        [
          Math.max(selectedMarker.lng, riderLocation.lng),
          Math.max(selectedMarker.lat, riderLocation.lat),
        ],
      ];
    }
    return null;
  }, [riderLocation, selectedMarker]);

  // Auto-fit bounds when both locations available
  useEffect(() => {
    if (bounds) {
      setViewport((prev) => ({
        ...prev,
        longitude: (bounds[0][0] + bounds[1][0]) / 2,
        latitude: (bounds[0][1] + bounds[1][1]) / 2,
        zoom: 11,
      }));
    }
  }, [bounds]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Map
        initialViewState={viewport}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        onMove={(evt) => setViewport(evt.viewState)}
      >
        <NavigationControl position="top-right" />

        {/* User location */}
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} color="blue">
            <div style={{ transform: 'translate(-50%, -50%)' }} title="Your Location">
              📍
            </div>
          </Marker>
        )}

        {/* Delivery destination */}
        {deliveryCoords && (
          <Marker
            longitude={selectedMarker.lng}
            latitude={selectedMarker.lat}
            draggable
            color="red"
            onDragEnd={(evt) => {
              const updated = { lat: evt.lngLat.lat, lng: evt.lngLat.lng };
              setSelectedMarker(updated);
              if (onLocationUpdate) onLocationUpdate(updated);
            }}
            title="Delivery Destination"
          />
        )}

        {/* Rider/Vehicle location */}
        {riderLocation && (
          <Marker
            longitude={riderLocation.lng}
            latitude={riderLocation.lat}
            color="green"
            title="Rider Location"
          >
            <div style={{ transform: 'translate(-50%, -50%)' }}>🚚</div>
          </Marker>
        )}
      </Map>

      {/* Connection status indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          padding: '10px 15px',
          borderRadius: '4px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            marginRight: '6px',
            backgroundColor:
              connectionStatus === 'connected'
                ? '#10b981'
                : connectionStatus === 'disconnected'
                  ? '#6b7280'
                  : '#ef4444',
          }}
        />
        {connectionStatus === 'connected' ? 'Live Tracking' : connectionStatus}
      </div>

      {/* Follow Me toggle */}
      {showFollowMe && (
        <button
          onClick={() => setFollowMode(!followMode)}
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            padding: '10px 15px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: followMode ? '#3b82f6' : '#e5e7eb',
            color: followMode ? '#fff' : '#1f2937',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {followMode ? '🎯 Following' : '👁️ Follow'}
        </button>
      )}
    </div>
  );
}
