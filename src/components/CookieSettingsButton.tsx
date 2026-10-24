"use client";

export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("localis:open-cookie-settings"))}
      className="hover:text-cyan-300 transition-colors"
    >
      Configurar cookies
    </button>
  );
}
