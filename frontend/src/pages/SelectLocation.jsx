import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../services/api";
import LiveLocationMap from "../components/LiveLocationMap";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";

const DEFAULT_CENTER = { lat: 12.9715987, lng: 77.5945627 };

const reverseGeocode = async (lat, lng) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Reverse geocoding failed");
    const data = await response.json();
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

const searchPlaces = async (query) => {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
    query
  )}&addressdetails=1&limit=6`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Search failed");
  return response.json();
};

export default function SelectLocation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [selectedAddress, setSelectedAddress] = useState("Finding address...");
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_CENTER);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [locationErrorMessage, setLocationErrorMessage] = useState("");
  const [geoPermissionActive, setGeoPermissionActive] = useState(false);
  const reverseDebounceRef = useRef(null);
  const [pageReady, setPageReady] = useState(false);

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const liveMode = queryParams.get("mode") === "live";

  useEffect(() => {
    const init = async () => {
      setPickerLoading(true);
      try {
        if (navigator.geolocation) {
          await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const coords = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                };
                setMapCenter(coords);
                setSelectedLocation(coords);
                setGeoPermissionActive(true);
                resolve();
              },
              (error) => {
                console.warn("GPS locate failed, falling back", error);
                reject(error);
              },
              { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
            );
          });
        } else {
          throw new Error("Geolocation not supported");
        }
      } catch {
        const profileJson = localStorage.getItem("user");
        const profile = profileJson ? JSON.parse(profileJson) : null;
        if (profile?.latitude && profile?.longitude) {
          const coords = {
            lat: Number(profile.latitude),
            lng: Number(profile.longitude),
          };
          setMapCenter(coords);
          setSelectedLocation(coords);
          setSelectedAddress(profile.address || "Finding address...");
        }
      } finally {
        setPageReady(true);
        setPickerLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!pageReady) return;
    if (reverseDebounceRef.current) clearTimeout(reverseDebounceRef.current);
    reverseDebounceRef.current = window.setTimeout(async () => {
      setPickerLoading(true);
      const address = await reverseGeocode(mapCenter.lat, mapCenter.lng);
      setSelectedAddress(address);
      setSelectedLocation(mapCenter);
      setPickerLoading(false);
    }, 250);

    return () => clearTimeout(reverseDebounceRef.current);
  }, [mapCenter, pageReady]);

  const handleLocateMe = async () => {
    if (!navigator.geolocation) {
      setLocationErrorMessage("Geolocation is not supported by your browser.");
      return;
    }

    setPickerLoading(true);
    setLocationErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setMapCenter(coords);
        setSelectedLocation(coords);
        setGeoPermissionActive(true);
        const address = await reverseGeocode(coords.lat, coords.lng);
        setSelectedAddress(address);
        setPickerLoading(false);
      },
      (error) => {
        let message = "Unable to access your location. Please enable GPS permission.";
        if (error.code === 1) {
          message = "Location permission denied. Please allow location access.";
        } else if (error.code === 2) {
          message = "Location unavailable. Try again in a moment.";
        } else if (error.code === 3) {
          message = "Location request timed out. Try again.";
        }
        setLocationErrorMessage(message);
        setPickerLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setPickerLoading(true);
    setSearchResults([]);

    try {
      const results = await searchPlaces(query);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error(error);
      setLocationErrorMessage("Unable to search addresses. Please try again.");
    } finally {
      setPickerLoading(false);
    }
  };

  const handleSelectResult = async (result) => {
    if (!result) return;
    const coords = { lat: Number(result.lat), lng: Number(result.lon) };
    setMapCenter(coords);
    setSelectedLocation(coords);
    setSelectedAddress(result.display_name || searchQuery);
    setSearchResults([]);
    setSearchQuery(result.display_name || "");
  };

  const handleConfirm = async () => {
    if (!selectedLocation || !selectedAddress || selectedAddress === "Finding address...") {
      return;
    }

    setPickerLoading(true);
    try {
      const result = await authenticatedFetch(
        "/api/profile",
        {
          method: "PATCH",
          body: JSON.stringify({
            address: selectedAddress,
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lng,
          }),
        },
        navigate
      );

      if (result?.success) {
        localStorage.setItem("delivery_address", selectedAddress);
        localStorage.setItem("delivery_latitude", String(selectedLocation.lat));
        localStorage.setItem("delivery_longitude", String(selectedLocation.lng));
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.address = selectedAddress;
          user.latitude = selectedLocation.lat;
          user.longitude = selectedLocation.lng;
          localStorage.setItem("user", JSON.stringify(user));
        }
        navigate(-1);
      }
    } catch (error) {
      console.error("Save location failed:", error);
      setLocationErrorMessage("Could not save location. Please try again.");
    } finally {
      setPickerLoading(false);
    }
  };

  const selectedAddressLabel = useMemo(() => {
    if (!selectedAddress) return "Finding address...";
    return selectedAddress;
  }, [selectedAddress]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 text-sm sm:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Back
          </button>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs uppercase tracking-[0.32em] text-violet-500">📍 Select Delivery Location</p>
            <h1 className="mt-2 text-xl font-bold text-slate-900">Where should we deliver?</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
        <form
          onSubmit={handleSearch}
          className="flex w-full flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
        >
          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-[0.32em] text-slate-400">
              Search for area, street or landmark
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-500" />
              <input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSearchResults([]);
                }}
                placeholder="Search for area, street or landmark"
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!searchQuery.trim() || pickerLoading}
            className="inline-flex h-12 items-center justify-center rounded-3xl bg-violet-600 px-6 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Search
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            {searchResults.map((item, index) => (
              <button
                key={`${item.place_id}-${index}`}
                type="button"
                onClick={() => handleSelectResult(item)}
                className="w-full rounded-3xl p-4 text-left transition hover:bg-slate-100"
              >
                <p className="font-semibold text-slate-900">{item.display_name}</p>
                <p className="mt-1 text-xs text-slate-500">{item.type || item.class}</p>
              </button>
            ))}
          </div>
        )}

        <div className="relative h-[72vh] overflow-hidden rounded-[32px] bg-slate-200">
          <LiveLocationMap
            interactive
            center={mapCenter}
            zoom={19}
            onCenterChange={(center) => setMapCenter(center)}
            height="100%"
            showCenterPin
          />
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={pickerLoading}
            className="absolute right-5 top-5 z-20 inline-flex items-center gap-2 rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-violet-700 shadow-xl shadow-black/20 transition hover:bg-slate-100 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="text-lg">🎯</span>
            {pickerLoading ? "Locating..." : "Locate Me"}
          </button>
          <div className="absolute left-5 top-5 z-20 rounded-3xl bg-black/70 px-4 py-3 text-sm text-white shadow-lg">
            {selectedAddressLabel}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Selected Address</p>
              <p className="mt-2 text-sm text-slate-900">{selectedAddressLabel}</p>
              <p className="mt-1 text-xs text-slate-500">
                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>

            {locationErrorMessage && (
              <div className="rounded-3xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                {locationErrorMessage}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={pickerLoading || !selectedAddress}
                className={`rounded-3xl px-4 py-4 text-sm font-semibold transition duration-200 ${
                  selectedAddress && !pickerLoading
                    ? "bg-violet-600 text-white hover:bg-violet-700"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed"
                }`}
              >
                🟣 Confirm Location
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-3xl bg-white px-4 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                ⚪ Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
