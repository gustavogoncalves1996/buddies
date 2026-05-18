import { useMemo, useState } from "react";
import { Bell, BellOff, Globe2, Languages, Moon, Monitor, Sun, Trash2, WalletCards } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isPushSupported, subscribeUserToPush, unsubscribeFromPush } from "../lib/push";
import { useLocale } from "../contexts/LocaleContext";
import useStore from "../store/useStore";
import { getErrorMessage } from "../utils/errors";

const QUERY_CACHE_KEY = "buddies-query-cache-v1";

export default function Settings() {
  const { t } = useTranslation();
  const locale = useLocale();
  const users = useStore((s) => s.users);
  const session = useStore((s) => s.session);
  const pushToast = useStore((s) => s.pushToast);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const [busy, setBusy] = useState(false);

  const currentUser = useMemo(
    () => (session ? users.find((user) => user.authId === session.user.id) : null),
    [session, users]
  );

  const setLanguage = (language) => {
    const nextLocale = language === "pt" ? "pt-PT" : "en-US";
    locale.setLocalePreferences({ language, locale: nextLocale });
    pushToast(t("settings.saved"), "success");
  };

  const setCurrency = (currency) => {
    locale.setLocalePreferences({ currency });
    pushToast(t("settings.saved"), "success");
  };

  const clearLocalCache = async () => {
    localStorage.removeItem(QUERY_CACHE_KEY);
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
    }
    pushToast(t("settings.cacheCleared"), "success");
  };

  const enablePush = async () => {
    if (!currentUser) return;
    setBusy(true);
    try {
      await subscribeUserToPush(currentUser.id);
      pushToast(t("settings.pushEnabled"), "success");
    } catch (err) {
      pushToast(t("settings.pushFailed", { error: getErrorMessage(err, t("common.unknownError")) }), "error");
    } finally {
      setBusy(false);
    }
  };

  const disablePush = async () => {
    if (!currentUser) return;
    setBusy(true);
    try {
      await unsubscribeFromPush(currentUser.id);
      pushToast(t("settings.pushDisabled"), "info");
    } catch (err) {
      pushToast(t("settings.pushFailed", { error: getErrorMessage(err, t("common.unknownError")) }), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface px-5 md:px-12 py-8 md:py-12 pb-28">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">{t("settings.kicker")}</p>
          <h1 className="text-3xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight">
            {t("settings.title")}
          </h1>
        </header>

        <section className="bg-surface-container-lowest rounded-2xl shadow-cozy p-5 md:p-7 space-y-5">
          <div className="flex items-center gap-3">
            <Languages size={20} className="text-primary" />
            <h2 className="font-headline font-bold text-xl text-on-surface">{t("settings.languageTitle")}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["pt", "en"].map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => setLanguage(language)}
                className={`rounded-full px-4 py-3 text-sm font-bold transition-colors ${
                  locale.language === language
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface hover:bg-secondary-container"
                }`}
              >
                {language === "pt" ? "Português" : "English"}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl shadow-cozy p-5 md:p-7 space-y-5">
          <div className="flex items-center gap-3">
            <WalletCards size={20} className="text-primary" />
            <h2 className="font-headline font-bold text-xl text-on-surface">{t("settings.currencyTitle")}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["EUR", "USD", "GBP", "BRL"].map((currency) => (
              <button
                key={currency}
                type="button"
                onClick={() => setCurrency(currency)}
                className={`rounded-full px-4 py-3 text-sm font-bold transition-colors ${
                  locale.currency === currency
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface hover:bg-secondary-container"
                }`}
              >
                {currency}
              </button>
            ))}
          </div>
        </section>

        {/* Theme */}
        <section className="bg-surface-container-lowest rounded-2xl shadow-cozy p-5 md:p-7 space-y-5">
          <h2 className="text-sm uppercase tracking-widest font-bold text-primary mb-3">{t("settings.themeTitle")}</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", label: t("settings.themeLight"), icon: Sun },
              { value: "dark", label: t("settings.themeDark"), icon: Moon },
              { value: "system", label: t("settings.themeSystem"), icon: Monitor },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => { setTheme(value); pushToast(t("settings.saved"), "success"); }}
                className={`flex flex-col items-center gap-2 py-4 rounded-2xl font-bold text-sm transition-colors ${
                  theme === value
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-dim"
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl shadow-cozy p-5 md:p-7 space-y-5">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-primary" />
            <h2 className="font-headline font-bold text-xl text-on-surface">{t("settings.notificationsTitle")}</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <button
              type="button"
              onClick={enablePush}
              disabled={busy || !isPushSupported()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-on-primary px-5 py-3 text-sm font-bold disabled:opacity-50"
            >
              <Bell size={16} />
              {t("settings.enablePush")}
            </button>
            <button
              type="button"
              onClick={disablePush}
              disabled={busy || !isPushSupported()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-container-high text-on-surface px-5 py-3 text-sm font-bold disabled:opacity-50"
            >
              <BellOff size={16} />
              {t("settings.disablePush")}
            </button>
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl shadow-cozy p-5 md:p-7 space-y-5">
          <div className="flex items-center gap-3">
            <Globe2 size={20} className="text-primary" />
            <h2 className="font-headline font-bold text-xl text-on-surface">{t("settings.offlineTitle")}</h2>
          </div>
          <button
            type="button"
            onClick={clearLocalCache}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-error/10 text-error px-5 py-3 text-sm font-bold hover:bg-error hover:text-on-error transition-colors"
          >
            <Trash2 size={16} />
            {t("settings.clearCache")}
          </button>
        </section>
      </div>
    </div>
  );
}
