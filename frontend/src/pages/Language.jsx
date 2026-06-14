import { useEffect, useState } from "react";

const LANGUAGES = [
  "English",
  "Kannada",
  "Hindi",
  "Tamil",
  "Telugu",
  "Malayalam",
];

export default function Language() {
  const [language, setLanguage] = useState(localStorage.getItem("language") || "English");

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  return (
    <div className="min-h-screen bg-[#F7F3FF] p-6 pb-28">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[2rem] bg-gradient-to-r from-violet-700 to-fuchsia-600 p-8 text-white shadow-2xl">
          <h1 className="text-4xl font-bold">Language Preferences</h1>
          <p className="mt-3 max-w-2xl text-sm text-violet-100">Change your UI language instantly and preserve it for future sessions.</p>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg border border-slate-200">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LANGUAGES.map((item) => (
              <button
                key={item}
                onClick={() => setLanguage(item)}
                className={`rounded-[1.75rem] border p-5 text-left transition ${
                  language === item
                    ? "border-violet-600 bg-violet-50 text-violet-900 shadow-lg"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-violet-300 hover:bg-violet-50"
                }`}
              >
                <p className="text-lg font-semibold">{item}</p>
                <p className="mt-2 text-sm text-slate-500">{item === language ? "Selected" : "Change UI language"}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
