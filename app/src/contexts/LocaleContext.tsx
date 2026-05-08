import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import i18n from "../i18n";

const STORAGE_KEY = "buddies.locale.v1";

const COUNTRY_LANGUAGE_MAP = {
  PT: "pt",
  BR: "pt",
  AO: "pt",
  MZ: "pt",
  CV: "pt",
  GW: "pt",
  ST: "pt",
  TL: "pt",
};

const COUNTRY_CURRENCY_MAP = {
  PT: "EUR",
  BR: "BRL",
};

const DEFAULT_LANGUAGE = "en";
const DEFAULT_COUNTRY = "US";
const DEFAULT_CURRENCY = "USD";

const LocaleContext = createContext(null);

function normalizeLanguage(language) {
  const code = String(language || "").slice(0, 2).toLowerCase();
  return code || DEFAULT_LANGUAGE;
}

function normalizeCountry(country) {
  return String(country || "").slice(0, 2).toUpperCase() || DEFAULT_COUNTRY;
}

function localeFrom(language, countryCode) {
  const lang = normalizeLanguage(language);
  const country = normalizeCountry(countryCode);
  return `${lang}-${country}`;
}

function currencySymbolFrom(locale, currency) {
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value || currency;
  } catch {
    return currency;
  }
}

function buildPreferences({ language, countryCode, currency, timeZone }) {
  const normalizedLanguage = normalizeLanguage(language);
  const normalizedCountry = normalizeCountry(countryCode);
  const locale = localeFrom(normalizedLanguage, normalizedCountry);
  const normalizedCurrency = (currency || DEFAULT_CURRENCY).toUpperCase();
  const resolvedTimeZone =
    timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  return {
    language: normalizedLanguage,
    countryCode: normalizedCountry,
    locale,
    currency: normalizedCurrency,
    currencySymbol: currencySymbolFrom(locale, normalizedCurrency),
    timeZone: resolvedTimeZone,
  };
}

function safeReadStoredPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function detectPreferencesFromIp() {
  const browserLanguage = normalizeLanguage(navigator.language);

  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) throw new Error("ipapi request failed");

    const data = await response.json();
    const countryCode = normalizeCountry(data?.country_code);
    const language = COUNTRY_LANGUAGE_MAP[countryCode] || browserLanguage;
    const currency =
      (data?.currency && String(data.currency).toUpperCase()) ||
      COUNTRY_CURRENCY_MAP[countryCode] ||
      DEFAULT_CURRENCY;

    return buildPreferences({
      language,
      countryCode,
      currency,
      timeZone: data?.timezone,
    });
  } catch {
    return buildPreferences({
      language: browserLanguage,
      countryCode: DEFAULT_COUNTRY,
      currency: COUNTRY_CURRENCY_MAP[DEFAULT_COUNTRY] || DEFAULT_CURRENCY,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }
}

export function LocaleProvider({ children }) {
  const [preferences, setPreferences] = useState(() => {
    const stored = safeReadStoredPreferences();
    if (stored) return buildPreferences(stored);

    return buildPreferences({
      language: normalizeLanguage(navigator.language),
      countryCode: DEFAULT_COUNTRY,
      currency: DEFAULT_CURRENCY,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  });
  const [isDetecting, setIsDetecting] = useState(() => !safeReadStoredPreferences());

  useEffect(() => {
    let mounted = true;

    const stored = safeReadStoredPreferences();
    if (stored) {
      setIsDetecting(false);
      return;
    }

    (async () => {
      const detected = await detectPreferencesFromIp();
      if (!mounted) return;
      setPreferences(detected);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(detected));
      setIsDetecting(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    i18n.changeLanguage(preferences.language);
    document.documentElement.lang = preferences.language;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const setLocalePreferences = useCallback((next) => {
    setPreferences((current) => {
      const merged = { ...current, ...next };
      return buildPreferences(merged);
    });
  }, []);

  const formatCurrency = useCallback(
    (value, options = {}) =>
      new Intl.NumberFormat(preferences.locale, {
        style: "currency",
        currency: preferences.currency,
        ...options,
      }).format(value),
    [preferences.currency, preferences.locale]
  );

  const formatNumber = useCallback(
    (value, options = {}) =>
      new Intl.NumberFormat(preferences.locale, {
        ...options,
      }).format(value),
    [preferences.locale]
  );

  const formatDate = useCallback(
    (value, options = {}) => {
      const date = value instanceof Date ? value : new Date(value);
      return new Intl.DateTimeFormat(preferences.locale, {
        timeZone: preferences.timeZone,
        ...options,
      }).format(date);
    },
    [preferences.locale, preferences.timeZone]
  );

  const contextValue = useMemo(
    () => ({
      ...preferences,
      isDetecting,
      setLocalePreferences,
      formatCurrency,
      formatNumber,
      formatDate,
    }),
    [preferences, isDetecting, setLocalePreferences, formatCurrency, formatNumber, formatDate]
  );

  return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used inside LocaleProvider");
  }
  return context;
}
