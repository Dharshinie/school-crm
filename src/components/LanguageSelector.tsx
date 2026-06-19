import { Translations } from "../types";

interface LanguageSelectorProps {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  dict: Translations;
}

export default function LanguageSelector({ currentLanguage, setLanguage, dict }: LanguageSelectorProps) {
  const options = [
    { code: "en", label: "English 🇬🇧" },
    { code: "ta", label: "தமிழ் 🇮🇳 (Tamil)" },
    { code: "hi", label: "हिन्दी 🇮🇳 (Hindi)" },
    { code: "ml", label: "മലയാളം 🇮🇳 (Malayalam)" }
  ];

  return (
    <div className="flex items-center space-x-1.5 bg-stone-100/80 p-1.5 rounded-xl border border-stone-200/80" id="lang-selector-container">
      <span className="text-[10px] md:text-xs font-bold text-stone-500 uppercase px-1.5 hidden sm:inline select-none">
        {dict.language}
      </span>
      <select
        value={currentLanguage}
        onChange={(e) => setLanguage(e.target.value)}
        className="bg-white border border-stone-200 text-xs py-1 px-2.5 rounded-lg font-semibold text-stone-700 outline-none focus:ring-2 focus:ring-[#4A5D4E]/20 focus:border-[#4A5D4E] cursor-pointer transition shadow-xs"
        id="lang-select-dropdown"
      >
        {options.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
