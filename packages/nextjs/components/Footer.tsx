"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-gray-800 bg-gray-900/95 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm">
              {t.footer.createdBy}{" "}
              <a
                href="https://x.com/Oxwill_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition font-semibold"
              >
                @Oxwill
              </a>
              {" "}{t.footer.memberOf}{" "}
              <span className="text-blue-400 font-semibold">{t.footer.community}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://x.com/Oxwill_"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-white text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              {t.footer.followOnX}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

