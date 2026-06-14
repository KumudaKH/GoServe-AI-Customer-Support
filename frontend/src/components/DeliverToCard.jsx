import React from "react";

/**
 * Premium "Deliver To" card component matching reference design
 * Horizontal compact layout with all information in one row
 */
export default function DeliverToCard({
  userProfile,
  locationStatus,
  isLocating,
  locationErrorMessage,
  onOpenLocationPicker,
  onUseLiveLocation,
  onChangeAddress,
}) {
  return (
    <div className="space-y-4">
      {/* Main Card - Horizontal Layout */}
      <div
        onClick={onOpenLocationPicker}
        className="w-full cursor-pointer rounded-[20px] bg-white border border-slate-100 px-5 py-4 text-left shadow-sm shadow-slate-200/60 transition-all duration-300 hover:shadow-md hover:shadow-slate-300/40"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Icon + Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Location Icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 flex-shrink-0">
              <span className="text-lg">📍</span>
            </div>

            {/* Text Content */}
            <div className="min-w-0">
              {/* Label */}
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Deliver to
              </p>

              {/* User Name + Address on same line */}
              <div className="flex items-center gap-2 mt-0.5">
                <h3 className="text-sm font-bold text-slate-900">
                  {userProfile?.name || "Kumuda KH"}
                </h3>
                <span className="text-xs text-slate-500">•</span>
                <p className="text-xs text-slate-600 truncate">
                  {userProfile?.address || "#55, Chikkasandra, T. Dasarahalli, Bengaluru - 560057"}
                </p>
              </div>
            </div>

            {/* Live Badge */}
            {locationStatus && (
              <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
                </span>
                LIVE
              </span>
            )}
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Use Live Location Button */}
            <button
              disabled={isLocating}
              onClick={(event) => {
                event.stopPropagation();
                onUseLiveLocation?.();
              }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                isLocating
                  ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                  : "bg-violet-50 text-violet-700 hover:bg-violet-100 cursor-pointer active:scale-95"
              }`}
            >
              <span className="text-sm">{isLocating ? "⏳" : "🎯"}</span>
              <span>{isLocating ? "Locating..." : "Use my live location"}</span>
            </button>

            {/* Change Address Button */}
            <button
              onClick={(event) => {
                event.stopPropagation();
                onChangeAddress?.();
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 transition-all duration-200 hover:text-violet-700 hover:underline cursor-pointer active:scale-95"
            >
              Change Address
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {locationErrorMessage && (
        <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 shadow-sm shadow-red-100/50">
          <p className="text-sm text-red-700 font-medium">{locationErrorMessage}</p>
          <button
            type="button"
            onClick={() => window.location.href = "/profile"}
            className="mt-3 inline-flex rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Select Address Manually →
          </button>
        </div>
      )}
    </div>
  );
}
