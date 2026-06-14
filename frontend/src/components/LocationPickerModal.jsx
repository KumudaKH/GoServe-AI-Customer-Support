import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import LiveLocationMap from "./LiveLocationMap";

/**
 * Inline location picker panel with live map, search, and GPS functionality
 */
export default function LocationPickerModal({
  userProfile,
  mapCenter,
  selectedAddress,
  selectedLocation,
  searchQuery,
  searchResults,
  onSearchQueryChange,
  onSearch,
  onSelectSearchResult,
  onLocateMe,
  onMapCenterChange,
  onConfirmLocation,
  locationErrorMessage,
  isLoading,
  pickerLoading,
}) {
  const isReadyToConfirm = selectedAddress && selectedAddress !== "Finding address..." && !pickerLoading;

  return (
    <section
      id="location-picker-panel"
      className="mt-6 overflow-hidden rounded-[32px] bg-slate-950/95 shadow-2xl shadow-black/40 ring-1 ring-white/10"
    >
      <div className="border-b border-white/10 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-violet-300 font-semibold">
              📍 Live Location Selector
            </p>
            <h2 className="mt-2 text-lg font-bold text-white">
              Choose delivery address
            </h2>
          </div>
          <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm font-semibold text-white shadow-inner shadow-black/20">
            {userProfile?.address ? "Using saved address" : "Set your delivery address"}
          </div>
        </div>
      </div>

      <div className="relative z-10 px-5 pt-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <form
            onSubmit={onSearch}
            className="flex flex-col gap-3 rounded-3xl border border-white/15 bg-slate-950/90 px-3 py-3 shadow-xl shadow-black/20 backdrop-blur-xl transition-all duration-200 sm:flex-row sm:items-center"
          >
            <div className="flex-1">
              <label className="text-[10px] uppercase tracking-[0.28em] text-slate-400">
                Search Address
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl bg-slate-950/80 px-3 py-2 border border-white/10">
                <MagnifyingGlassIcon className="h-5 w-5 text-violet-300" />
                <input
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  placeholder="Search for area, landmark, or address"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
                  disabled={pickerLoading}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={pickerLoading || !searchQuery.trim()}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-slate-600 disabled:to-fuchsia-600 disabled:cursor-not-allowed"
            >
              {pickerLoading ? "Searching..." : "Search"}
            </button>
          </form>

          {searchResults?.length > 0 && (
            <div className="mt-3 rounded-3xl border border-white/10 bg-slate-950/95 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="px-3 pb-2 text-xs uppercase tracking-[0.28em] text-slate-400">
                Suggestions
              </p>
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <button
                    key={`${result.place_id}-${index}`}
                    type="button"
                    onClick={() => onSelectSearchResult(result)}
                    className="w-full rounded-3xl px-4 py-3 text-left text-sm text-white transition hover:bg-white/10"
                  >
                    <p className="font-semibold">{result.display_name}</p>
                    <p className="text-xs text-slate-400">{result.type || result.class}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative h-[520px] overflow-hidden rounded-b-[32px]">
        <LiveLocationMap
          interactive
          center={mapCenter}
          onCenterChange={onMapCenterChange}
          zoom={18}
          height="100%"
          showCenterPin
        />
      </div>
        </div>

        <button
          type="button"
          onClick={onLocateMe}
          disabled={pickerLoading}
          className="absolute right-6 top-6 z-20 inline-flex items-center gap-2 rounded-3xl bg-white/95 px-4 py-3 text-sm font-semibold text-violet-700 shadow-xl shadow-black/20 transition-all duration-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          <span className="text-lg">🎯</span>
          {pickerLoading ? "Detecting..." : "Locate Me"}
        </button>

        <div className="absolute left-6 top-6 rounded-3xl bg-black/60 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/40">
          {selectedAddress || "Finding address..."}
        </div>
      </div>

      <div className="border-t border-white/10 bg-slate-950/95 px-5 py-6 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onConfirmLocation}
              disabled={!isReadyToConfirm}
              className={`rounded-3xl px-4 py-4 text-sm font-bold transition-all duration-200 active:scale-95 ${
                isReadyToConfirm
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/40 hover:from-violet-500 hover:to-fuchsia-500"
                  : "bg-slate-700 text-slate-400 cursor-not-allowed"
              }`}
            >
              🟣 Confirm Location
            </button>
            <button
              type="button"
              onClick={onLocateMe}
              disabled={pickerLoading}
              className="rounded-3xl bg-white/10 px-4 py-4 text-sm font-bold text-white transition-all duration-200 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              🎯 Locate Me
            </button>
          </div>

          {pickerLoading && (
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-xs text-slate-300">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span>Updating address...</span>
            </div>
          )}

          {locationErrorMessage && (
            <div className="rounded-3xl bg-red-500/10 px-4 py-3 text-sm text-red-200 ring-1 ring-red-400/20">
              {locationErrorMessage}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
