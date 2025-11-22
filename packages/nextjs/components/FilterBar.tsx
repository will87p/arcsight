"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Language } from "@/lib/i18n/translations";

interface FilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  const { t } = useLanguage();
  
  const categories = [
    { id: "trending", label: t.filters.trending },
    { id: "new", label: t.filters.new },
    { id: "all", label: t.filters.all },
    { id: "politics", label: t.filters.politics },
    { id: "sports", label: t.filters.sports },
    { id: "culture", label: t.filters.culture },
    { id: "crypto", label: t.filters.crypto },
    { id: "climate", label: t.filters.climate },
    { id: "economy", label: t.filters.economy },
    { id: "mentions", label: t.filters.mentions },
    { id: "companies", label: t.filters.companies },
    { id: "finance", label: t.filters.finance },
    { id: "tech", label: t.filters.tech },
    { id: "health", label: t.filters.health },
    { id: "world", label: t.filters.world },
  ];

  return (
    <div className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-[81px] z-40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onFilterChange(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                activeFilter === category.id
                  ? "bg-gray-800 text-white font-semibold"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
