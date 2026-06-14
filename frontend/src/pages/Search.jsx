import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const useQuery = () => new URLSearchParams(useLocation().search);

export default function Search() {
  const navigate = useNavigate();
  const query = useQuery().get("q") || "";
  const [searchText, setSearchText] = useState(query);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      navigate(`/search?q=${encodeURIComponent(searchText)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] p-6 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-[32px] bg-black/90 p-6 text-white shadow-2xl">
          <div className="text-sm uppercase tracking-[0.28em] text-slate-400">Search</div>
          <div className="mt-3 text-3xl font-semibold">Find products, orders, and help</div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-lg">
          <label className="block text-sm font-semibold text-slate-700">Search</label>
          <div className="mt-3 flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
            <input
              ref={inputRef}
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-base text-slate-900 outline-none"
              placeholder="Search products, orders or help..."
            />
            <button
              type="button"
              onClick={() => navigate(`/search?q=${encodeURIComponent(searchText)}`)}
              className="rounded-3xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-violet-800"
            >
              Search
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {searchText ? (
            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <div className="text-lg font-semibold text-slate-900">Search results for "{searchText}"</div>
              <p className="mt-3 text-sm text-slate-500">Results are simulated in this placeholder page.</p>
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <div className="text-lg font-semibold text-slate-900">Ready for your search</div>
              <p className="mt-3 text-sm text-slate-500">Enter a term and press Enter to view results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
