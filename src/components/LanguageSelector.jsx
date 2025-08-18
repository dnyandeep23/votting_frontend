"use client"

import { useLanguage } from "../contexts/LanguageContext"
import { Globe } from "lucide-react"

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  const languages = [
    { code: "mr", name: "मराठी", flag: "🇮🇳" },
    { code: "hi", name: "हिंदी", flag: "🇮🇳" },
    { code: "en", name: "English", flag: "🇮🇳" },
  ]

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <div className="flex gap-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`text-xs px-2 py-1 h-auto rounded-md font-medium transition-all duration-300 ${
              language === lang.code
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "hover:bg-orange-50 text-gray-600 hover:text-orange-600"
            }`}
          >
            {lang.flag} {lang.name}
          </button>
        ))}
      </div>
    </div>
  )
}
