import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

function createTileLayer() {
  if (MAPBOX_TOKEN && MAPBOX_TOKEN !== "your_mapbox_token_here") {
    return L.tileLayer(
      "https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=" + MAPBOX_TOKEN,
      { tileSize: 512, zoomOffset: -1, maxZoom: 20, attribution: "© Mapbox" }
    );
  }
  return L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 20,
  });
}

// Custom animated marker icon for live location
const createAnimatedLiveMarker = () => {
  return L.divIcon({
    html: `
      <div class="live-marker-pulse" style="
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #7c3aed;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(124, 58, 237, 0.8);
        border: 3px solid white;
      ">
        <div style="
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        ">🚚</div>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25],
    className: 'bounce-marker',
  });
};

// Static marker icons for tracking (origin, destination)
const createMarkerIcon = (color, emoji, size = 40) => {
  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 3px solid white;
        font-size: ${size * 0.6}px;
        font-weight: bold;
      ">${emoji}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// Teardrop pin SVG icon for the center marker
const createCenterPinIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        filter: drop-shadow(0 2px 6px rgba(0,0,0,0.35));
      ">
        <svg width="28" height="42" viewBox="0 0 26 40" style="display:block">
          <path d="M13 2C7.5 2 3 6.5 3 12c0 7 10 26 10 26s10-19 10-26C23 6.5 18.5 2 13 2zm0 14c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" fill="#7c3aed" stroke="white" stroke-width="1.5"/>
          <circle cx="13" cy="12" r="3.5" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [28, 42],
    iconAnchor: [14, 40],
    className: '',
  });
};

/**
 * OpenStreetMap / CartoDB map component used across live tracking and interactive address selection.
 */
export default function LiveLocationMap({
  interactive = false,
  center,
  zoom = 16,
  onCenterChange,
  liveLocation,
  destination,
  origin,
  trail = [],
  isLive = true,
  height = "320px",
  showCenterPin = false,
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  const fallbackCenter = { lat: 12.9715987, lng: 77.5945627 };
  const effectiveCenter = interactive
    ? center || liveLocation || destination || origin || fallbackCenter
    : liveLocation || destination || fallbackCenter;

  const bbox = useMemo(() => {
    const points = [effectiveCenter, destination, origin, ...trail].filter(Boolean);
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    const pad = 0.012;
    return {
      minLng: Math.min(...lngs) - pad,
      minLat: Math.min(...lats) - pad,
      maxLng: Math.max(...lngs) + pad,
      maxLat: Math.max(...lats) + pad,
    };
  }, [effectiveCenter, destination, origin, trail]);

  const mapInitializedRef = useRef(false);
  const markersRef = useRef({});
  const trailPolylineRef = useRef(null);

  useEffect(() => {
    if (interactive && containerRef.current && !mapInitializedRef.current) {
      mapInitializedRef.current = true;

      const map = L.map(containerRef.current, {
        center: [effectiveCenter.lat, effectiveCenter.lng],
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        touchPan: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        tap: true,
        inertia: true,
        easeLinearity: 0.25,
        maxZoom: 20,
        attributionControl: false,
      });

      createTileLayer().addTo(map);

      let centerPin = null;
      if (showCenterPin) {
        centerPin = L.marker([effectiveCenter.lat, effectiveCenter.lng], {
          icon: createCenterPinIcon(),
          interactive: false,
          zIndexOffset: 10000,
        }).addTo(map);
      }

      map.on("move", () => {
        const c = map.getCenter();
        if (centerPin) {
          centerPin.setLatLng([c.lat, c.lng]);
        }
      });

      map.on("dragend", () => {
        const mapCenter = map.getCenter();
        onCenterChange?.({ lat: mapCenter.lat, lng: mapCenter.lng });
      });

      mapRef.current = map;
      setTimeout(() => map.invalidateSize(), 100);

      return () => {
        map.off();
        map.remove();
        mapRef.current = null;
        mapInitializedRef.current = false;
      };
    }
  }, [interactive, effectiveCenter.lat, effectiveCenter.lng, onCenterChange]);

  const centerSetRef = useRef(null);
  useEffect(() => {
    if (!interactive || !mapRef.current || !center) return;

    const current = mapRef.current.getCenter();
    const moved = centerSetRef.current;
    const latDiff = Math.abs(current.lat - center.lat);
    const lngDiff = Math.abs(current.lng - center.lng);

    // Skip if center hasn't changed meaningfully (avoids fighting user drag)
    if (moved && latDiff < 1e-7 && lngDiff < 1e-7) return;

    centerSetRef.current = true;
    mapRef.current.flyTo([center.lat, center.lng], zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [interactive, center?.lat, center?.lng]);

  useEffect(() => {
    if (interactive || !containerRef.current) return;

    if (mapInitializedRef.current) return;
    mapInitializedRef.current = true;

    const map = L.map(containerRef.current, {
      center: [effectiveCenter.lat, effectiveCenter.lng],
      zoom: 16,
      zoomControl: false,
      scrollWheelZoom: false,
      tap: false,
      attributionControl: true,
      dragging: false,
    });

    createTileLayer().addTo(map);
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};
    if (trailPolylineRef.current) {
      map.removeLayer(trailPolylineRef.current);
      trailPolylineRef.current = null;
    }

    // Add origin marker (Green - Pickup)
    if (origin) {
      const marker = L.marker([origin.lat, origin.lng], {
        icon: createMarkerIcon("#22c55e", "📍", 40),
      })
        .addTo(map)
        .bindPopup("<strong>Pickup Location</strong>");
      markersRef.current.origin = marker;
    }

    // Add trail polyline (delivery route)
    if (trail.length > 0) {
      const trailCoords = trail.map((p) => [p.lat, p.lng]);
      trailPolylineRef.current = L.polyline(trailCoords, {
        color: "#a78bfa",
        weight: 4,
        opacity: 0.7,
        dashArray: "5, 10",
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);
    }

    // Add destination marker (Red - Delivery)
    if (destination) {
      const marker = L.marker([destination.lat, destination.lng], {
        icon: createMarkerIcon("#ef4444", "📍", 40),
      })
        .addTo(map)
        .bindPopup("<strong>Delivery Location</strong>");
      markersRef.current.destination = marker;
    }

    // Add live location marker (animated)
    if (liveLocation) {
      const marker = L.marker([liveLocation.lat, liveLocation.lng], {
        icon: createAnimatedLiveMarker(),
      })
        .addTo(map)
        .bindPopup("<strong>Current Location</strong>");
      markersRef.current.live = marker;
    }

    // Fit bounds to all points
    const points = [effectiveCenter, destination, origin, ...trail].filter(Boolean);
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [80, 80] });
    }

    mapRef.current = map;

    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
      mapInitializedRef.current = false;
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};
    };
  }, [effectiveCenter, destination, origin, trail, liveLocation, interactive]);

  if (!interactive) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-inner bg-gray-100" style={{ height }}>
        <div ref={containerRef} className="h-full w-full bg-white relative z-0" />
        
        {/* Location button on left side */}
        <button
          onClick={() => {
            if (mapRef.current) {
              const center = mapRef.current.getCenter();
              onCenterChange?.({ lat: center.lat, lng: center.lng });
            }
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-40 slide-in-left flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-xl hover:bg-violet-50 transition-all border-2 border-violet-600 hover:scale-110"
          title="Select location"
        >
          <span className="text-3xl font-bold text-violet-600">+</span>
        </button>

        {/* Live indicator badge */}
        {isLive && (
          <div className="absolute right-4 top-4 slide-in-right z-30 flex items-center gap-2 rounded-full bg-white shadow-lg px-4 py-2 backdrop-blur-lg border border-green-200">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-600" />
            </span>
            <span className="text-xs font-bold text-green-700">LIVE</span>
          </div>
        )}

        {/* Location info card at bottom */}
        {liveLocation?.label && (
          <div className="absolute bottom-4 left-4 right-4 slide-in-left z-30 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-4 text-white backdrop-blur-xl border border-slate-700 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="text-2xl pt-1">📍</div>
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-widest font-semibold text-violet-300 mb-1">Current Location</p>
                <p className="font-bold text-sm line-clamp-2">{liveLocation.label}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-inner" style={{ height }}>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

export function EtaCountdown({ minutes, status }) {
  if (status === "Delivered") {
    return (
      <div className="rounded-2xl bg-green-50 px-4 py-3 text-center">
        <p className="text-xs text-green-600">Delivered</p>
        <p className="text-2xl font-bold text-green-700">✓</p>
      </div>
    );
  }
  if (status === "Cancelled" || minutes < 0) return null;

  return (
    <div className="rounded-2xl bg-violet-50 px-4 py-3 text-center">
      <p className="text-xs uppercase tracking-wide text-violet-500">ETA</p>
      <p className="text-3xl font-bold text-violet-800">{minutes}</p>
      <p className="text-xs text-violet-600">minutes</p>
    </div>
  );
}

export function RiderCard({ rider, deliveryOtp }) {
  if (!rider) return null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Your rider</p>
      <div className="mt-3 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl text-white">
          🛵
        </div>
        <div className="flex-1">
          <p className="font-bold text-slate-900">{rider.name}</p>
          <p className="text-sm text-slate-500">{rider.vehicle}</p>
          <p className="text-sm text-amber-600">★ {rider.rating}</p>
        </div>
        <a
          href={`tel:${rider.phone?.replace(/\s/g, "")}`}
          className="rounded-2xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          Call
        </a>
      </div>
      {deliveryOtp && (
        <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
          <p className="text-xs text-amber-700">Delivery OTP — share only when rider arrives</p>
          <p className="mt-1 text-2xl font-bold tracking-[0.3em] text-amber-900">{deliveryOtp}</p>
        </div>
      )}
    </div>
  );
}
